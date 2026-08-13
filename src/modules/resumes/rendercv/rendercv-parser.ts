import {
  RenderCVException,
  RenderCVContentException,
  RenderCVEmptyResumeException,
  RenderCVFieldError,
  RenderCVInternalException,
  RenderCVTimeoutException,
  RenderCVUnavailableException,
  RenderCVValidationException,
  RenderCVYamlException,
} from './rendercv-errors';

/* ─────────────────────────────────────────────────────────────────────────────
 * Parser de la salida de RenderCV v2.7 (CLI)
 *
 * RenderCV imprime sus errores en tablas "rich" que cambian de look según el
 * encoding de la consola:
 *   - ASCII  (sin PYTHONIOENCODING):  +-- ... --+  con separadores  |  y  -/+
 *   - Unicode (con PYTHONIOENCODING=utf-8):  ┌─ ... ─┐  con  │  y  ─
 * El servicio ejecuta con PYTHONIOENCODING=utf-8, así que en producción llega
 * Unicode; se normalizan ambos formatos a ASCII antes de parsear.
 * ──────────────────────────────────────────────────────────────────────────── */

const UNICODE_BOX_CHARS: Record<string, string> = {
  '┌': '+',
  '┬': '+',
  '┐': '+',
  '├': '+',
  '┼': '+',
  '┤': '+',
  '└': '+',
  '┴': '+',
  '┘': '+',
  '─': '-',
  '═': '-',
  '│': '|',
  '║': '|',
};

export function normalizeRenderCVOutput(text: string): string {
  return text
    .split('')
    .map((c) => UNICODE_BOX_CHARS[c] ?? c)
    .join('');
}

/** Fila extraída de la tabla de validación de RenderCV. */
interface ValidationRow {
  location: string;
  inputValue: string;
  explanation: string;
}

/**
 * Parsea la tabla "There are validation errors!" de la salida de RenderCV.
 * Devuelve las filas reales (omite las filas de cabecera de sección).
 */
export function parseValidationTable(stdout: string): ValidationRow[] {
  const normalized = normalizeRenderCVOutput(stdout);
  const lines = normalized.split(/\r?\n/);

  // 1) Buscar la cabecera de la tabla de validación
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('There are validation errors')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return [];

  // 2) Encontrar el separador de columnas de la tabla interna:
  //    ASCII:   | |------+-------------+------| |
  //    Unicode: | +------+-------------+------+ |
  const separatorPattern = /^\| [ |+][-+]+[+|] \|$/;
  let separatorFound = false;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (separatorPattern.test(lines[i])) {
      headerIdx = i;
      separatorFound = true;
      break;
    }
  }
  if (!separatorFound) return [];

  // 2) Recorrer las filas de la tabla interna.
  // Cada línea de fila es "| | cell0 | cell1 | cell2 | |": las celdas se
  // separan por '|' dentro de la región interna (el texto envuelto en varias
  // líneas mantiene el mismo número de separadores).
  const rows: ValidationRow[] = [];
  let current: ValidationRow | null = null;
  const flush = () => {
    if (current) {
      current.location = current.location.trim();
      current.inputValue = current.inputValue.trim();
      current.explanation = current.explanation.trim();
      if (current.location) rows.push(current);
      current = null;
    }
  };

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    // Separador intermedio de la tabla interna (puede empezar con "| |" o "| +")
    if (separatorPattern.test(line)) continue;
    // Fin de la tabla interna o externa
    if (!line.startsWith('| |')) break;
    if (/^\| \|[-+]+/.test(line)) break;

    const inner = line.slice(3, line.length - 3);
    const cells = inner.split('|').map((c) => c.trim());

    if (cells[0] && cells[0] !== '') {
      // Nueva fila: primera celda (Location) con contenido
      flush();
      current = {
        location: cells[0] ?? '',
        inputValue: cells[1] ?? '',
        explanation: cells.slice(2).join(' ').trim(),
      };
    } else if (current) {
      // Continuación de la fila anterior (texto envuelto en varias líneas)
      if (cells[1]) current.inputValue += ' ' + cells[1];
      if (cells[2]) current.explanation += ' ' + cells.slice(2).join(' ');
    }
  }
  flush();

  // Omitir el encabezado de la propia tabla ("Location | Input Value | Explanation")
  // y las filas de cabecera de sección ("There are problems with the entries")
  return rows.filter(
    (r) =>
      !(
        (r.location === 'Location' && r.explanation === 'Explanation') ||
        (/^cv\.sections\.[^.]+$/i.test(r.location) && r.explanation.includes('problems with the entries'))
      ),
  );
}

/* ─────────────────────────── Traducción de mensajes ─────────────────────────── */

/** Traduce la explicación de RenderCV al español. Devuelve undefined si no hay traducción. */
export function translateExplanation(rawExplanation: string): string | undefined {
  const explanation = rawExplanation.replace(/\s+/g, ' ').trim();

  const rules: Array<{ test: (e: string) => boolean; es: (e: string) => string }> = [
    {
      test: (e) => e.includes('custom theme folder'),
      es: () => 'La carpeta del tema personalizado no existe. Usa uno de los temas incluidos.',
    },
    {
      test: (e) => /not a valid `?(start_date|end_date|date)`?/.test(e) || /This is not a valid date/.test(e),
      es: () =>
        'La fecha no es válida. Usa el formato YYYY-MM-DD, YYYY-MM o YYYY (o «present» para "actualmente").',
    },
    {
      test: (e) => e.includes('must have an @-sign'),
      es: () => 'El correo electrónico debe contener un @. Ejemplo: nombre@dominio.com',
    },
    {
      test: (e) => e.includes('This is not a valid URL'),
      es: () => 'La URL no es válida. Debe empezar por http:// o https://',
    },
    {
      test: (e) => e.includes('This field is required'),
      es: () => 'Este campo es obligatorio.',
    },
    {
      test: (e) => e.includes('This field is unknown'),
      es: () => 'Este campo no es válido en esta sección. Elimínalo.',
    },
    {
      test: (e) => e.includes('Input should be a valid dictionary'),
      es: () => 'El formato de esta sección no es válido: debe ser un objeto con categorías.',
    },
    {
      test: (e) => e.includes('does not exist'),
      es: (e) => {
        const fileMatch = e.match(/`([^`]+)`/);
        return `El archivo ${fileMatch ? `«${fileMatch[1]}» ` : ''}no existe. Verifica la ruta.`;
      },
    },
    {
      test: (e) => e.includes('This is not a valid YAML'),
      es: () => 'El documento del CV tiene un error de sintaxis YAML.',
    },
    {
      test: (e) => e.includes('does not match any of the expected tags'),
      es: () => 'El idioma seleccionado no está soportado por RenderCV.',
    },
    {
      test: (e) => e.includes('should contain a list of items'),
      es: () => 'Este campo debe ser una lista de elementos (no un texto suelto).',
    },
    {
      test: (e) => e.includes("String should match pattern") || e.includes('does not match'),
      es: () => 'El valor no cumple el formato requerido (por ejemplo, un DOI debe empezar por «10.»).',
    },
  ];

  for (const rule of rules) {
    if (rule.test(explanation)) return rule.es(explanation);
  }
  return undefined;
}

/* ─────────────────────── Rutas amigables (Location → field) ─────────────────────── */

const SECTION_TITLES_ES: Record<string, string> = {
  summary: 'Resumen',
  education: 'Educación',
  experience: 'Experiencia',
  projects: 'Proyectos',
  skills: 'Habilidades',
  publications: 'Publicaciones',
  certifications: 'Certificaciones',
  honors: 'Honores',
  patents: 'Patentes',
  talks: 'Charlas',
};

const FIELD_NAMES_ES: Record<string, string> = {
  name: 'nombre',
  email: 'correo electrónico',
  phone: 'teléfono',
  website: 'sitio web',
  location: 'ubicación',
  photo: 'foto',
  social_networks: 'redes sociales',
  sections: 'secciones',
  network: 'red',
  username: 'usuario',
  start_date: 'fecha de inicio',
  end_date: 'fecha de fin',
  date: 'fecha',
  company: 'empresa',
  position: 'cargo',
  institution: 'institución',
  degree: 'título académico',
  area: 'área de estudio',
  highlights: 'logros',
  summary: 'descripción',
  title: 'título',
  authors: 'autores',
  doi: 'DOI',
  journal: 'revista',
  issuer: 'otorgante',
  venue: 'lugar',
  label: 'categoría',
  details: 'habilidades',
};

/** Convierte una ruta de RenderCV (cv.sections.Experience.0.start_date) a una ruta amigable en español. */
export function friendlyLocation(location: string): string {
  const raw = location.trim();

  // Errores de archivo YAML: "main_yaml_file: line X to line Y"
  const yamlMatch = raw.match(/main_yaml_file:?\s*line\s*(\d+)(?:\s*to\s*line\s*(\d+))?/i);
  if (yamlMatch) {
    return yamlMatch[2]
      ? `Archivo YAML (líneas ${yamlMatch[1]} a ${yamlMatch[2]})`
      : `Archivo YAML (línea ${yamlMatch[1]})`;
  }

  // cv.<campo>
  const topMatch = raw.match(/^cv\.([a-z_]+)$/i);
  if (topMatch) {
    return FIELD_NAMES_ES[topMatch[1].toLowerCase()] ?? `Campo «${topMatch[1]}»`;
  }

  // cv.sections.<Título>[.<índice>[.<campo>]]
  const sectionMatch = raw.match(/^cv\.sections\.([^.]+)(?:\.(\d+))?(?:\.([a-z_]+))?$/i);
  if (sectionMatch) {
    const title = sectionMatch[1];
    const index = sectionMatch[2];
    const field = sectionMatch[3]?.toLowerCase();
    const titleEs = SECTION_TITLES_ES[title.toLowerCase()] ?? title;
    const parts = [`«${titleEs}»`];
    if (index !== undefined) parts.push(`elemento ${Number(index) + 1}`);
    if (field) parts.push(FIELD_NAMES_ES[field] ?? field);
    return parts.join(' · ');
  }

  // design / locale / etc.
  const bareMatch = raw.match(/^([a-z_]+)$/i);
  if (bareMatch) {
    const known: Record<string, string> = { design: 'Diseño', locale: 'Idioma y configuración regional', cv: 'CV' };
    return known[bareMatch[1].toLowerCase()] ?? `Campo «${bareMatch[1]}»`;
  }

  return raw;
}

/* ──────────────────────────── Clasificación principal ──────────────────────────── */

interface ExecErrorLike {
  code?: number | string;
  killed?: boolean;
  signal?: string;
}

/**
 * Convierte una ejecución fallida de `rendercv render` en una excepción controlada.
 * Devuelve null si no se pudo clasificar (el llamador usa el fallback interno).
 */
export function classifyRenderCVFailure(
  stdout: string,
  stderr: string,
  execError?: ExecErrorLike,
): RenderCVException | null {
  // python/RenderCV no instalado
  if (execError?.code === 'ENOENT') {
    return new RenderCVUnavailableException();
  }

  // Timeout de la ejecución
  if (execError?.killed || execError?.signal) {
    return new RenderCVTimeoutException();
  }

  const out = normalizeRenderCVOutput(stdout ?? '');
  const err = normalizeRenderCVOutput(stderr ?? '');

  // Error de compilación Typst (contenido del usuario con sintaxis inválida)
  const typstMatch = err.match(/TypstError:\s*([^\n]*)/);
  if (typstMatch) {
    const detail = typstMatch[1].trim();
    let message: string;
    if (/unknown variable:\s*(.+)/.test(detail)) {
      message = `Hay un error de sintaxis en el contenido del CV: «${detail.match(/unknown variable:\s*(.+)/)![1].trim()}» no está definido. Revisa caracteres especiales (#, \\) en tus textos.`;
    } else if (/unknown function/.test(detail)) {
      message = 'Hay un error de sintaxis en el contenido del CV: se usó una función de Typst que no existe. Revisa caracteres especiales (#, \\) en tus textos.';
    } else {
      message = `Error de compilación al generar el PDF: ${detail || 'sintaxis inválida en el contenido'}. Revisa caracteres especiales (#, \\) en tus textos.`;
    }
    return new RenderCVContentException(message, detail);
  }

  // Tabla de errores de validación
  if (out.includes('There are validation errors')) {
    const rows = parseValidationTable(stdout);
    const fieldErrors: RenderCVFieldError[] = rows.map((row) => ({
      location: row.location,
      field: friendlyLocation(row.location),
      inputValue: row.inputValue && row.inputValue !== '...' ? row.inputValue.slice(0, 200) : undefined,
      message: translateExplanation(row.explanation) ?? (row.explanation || 'Valor inválido.'),
    }));

    const hasYamlError = fieldErrors.some((e) => /main_yaml_file/i.test(e.location));
    if (hasYamlError) {
      return new RenderCVYamlException(fieldErrors[0]?.message);
    }

    const summary =
      fieldErrors.length === 1
        ? `Hay 1 error en tu CV: ${fieldErrors[0].field}.`
        : `Hay ${fieldErrors.length} errores en tu CV. Revisa los campos indicados.`;
    return new RenderCVValidationException(summary, fieldErrors);
  }

  // Archivo de entrada vacío
  if (out.includes('The input file is empty')) {
    return new RenderCVEmptyResumeException();
  }

  // Traceback inesperado de Python (no clasificado)
  if (err.includes('Traceback')) {
    const lines = err
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const lastMeaningful = lines[lines.length - 1] ?? '';
    // Devuelve excepción interna; el detalle queda para los logs del servidor.
    void lastMeaningful;
    return new RenderCVInternalException();
  }

  return null;
}
