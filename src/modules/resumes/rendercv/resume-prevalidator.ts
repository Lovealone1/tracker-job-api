import { RenderCVFieldError } from './rendercv-errors';

/**
 * Pre-validador en TypeScript de los datos del CV.
 * Atrapa los errores más frecuentes ANTES de invocar a Python/RenderCV:
 * fechas malformadas, correos/URLs inválidos, DOIs, rangos de fechas...
 * (RenderCV sigue siendo la validación final; esto da feedback instantáneo).
 */

const DATE_PATTERN = /^(present|\d{4}(-\d{2}(-\d{2})?)?)$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const DOI_PATTERN = /^10\.\S+$/i;

const SECTION_NAMES_ES: Record<string, string> = {
  education: 'Educación',
  experience: 'Experiencia',
  projects: 'Proyectos',
  publications: 'Publicaciones',
  certifications: 'Certificaciones',
  honors: 'Honores',
  patents: 'Patentes',
  talks: 'Charlas',
};

const DATE_FIELDS_ES: Record<string, string> = {
  startDate: 'fecha de inicio',
  endDate: 'fecha de fin',
  date: 'fecha',
};

interface FieldIssue {
  field: string;
  location: string;
  inputValue: string;
  message: string;
}

export function prevalidateResumeData(data: any): RenderCVFieldError[] {
  const issues: FieldIssue[] = [];

  /* ── Nombre ── */
  if (!data?.resumeName || typeof data.resumeName !== 'string' || !data.resumeName.trim()) {
    issues.push({
      field: 'Nombre completo',
      location: 'resumeName',
      inputValue: String(data?.resumeName ?? ''),
      message: 'El nombre es obligatorio y no puede estar vacío.',
    });
  }

  /* ── Información personal ── */
  const personal = data?.personalInfo ?? {};
  if (personal.email && typeof personal.email === 'string' && personal.email.trim()) {
    if (!EMAIL_PATTERN.test(personal.email.trim())) {
      issues.push({
        field: 'Correo electrónico',
        location: 'personalInfo.email',
        inputValue: personal.email,
        message: 'El correo electrónico no es válido. Ejemplo: nombre@dominio.com',
      });
    }
  }
  if (personal.website && typeof personal.website === 'string' && personal.website.trim()) {
    if (!URL_PATTERN.test(personal.website.trim())) {
      issues.push({
        field: 'Sitio web',
        location: 'personalInfo.website',
        inputValue: personal.website,
        message: 'La URL no es válida. Debe empezar por http:// o https://',
      });
    }
  }
  for (const network of ['linkedIn', 'github'] as const) {
    const value = personal[network]?.trim();
    if (!value) continue;
    const looksLikeUrl = /^https?:\/\//i.test(value);
    const hostOk =
      network === 'linkedIn'
        ? /^https?:\/\/(www\.)?linkedin\.com\//i.test(value)
        : /^https?:\/\/(www\.)?github\.com\//i.test(value);
    if (looksLikeUrl && !hostOk) {
      issues.push({
        field: network === 'linkedIn' ? 'LinkedIn' : 'GitHub',
        location: `personalInfo.${network}`,
        inputValue: value,
        message:
          network === 'linkedIn'
            ? 'La URL de LinkedIn no es válida. Usa tu perfil (linkedin.com/in/usuario) o solo el nombre de usuario.'
            : 'La URL de GitHub no es válida. Usa tu perfil (github.com/usuario) o solo el nombre de usuario.',
      });
    }
  }

  /* ── Secciones con fechas ── */
  for (const section of ['education', 'experience', 'projects', 'publications', 'certifications', 'honors', 'patents', 'talks']) {
    const items = data?.[section];
    if (!Array.isArray(items)) continue;
    const sectionName = SECTION_NAMES_ES[section] ?? section;

    items.forEach((item: any, index: number) => {
      if (!item || typeof item !== 'object') return;
      const prefix = `${sectionName} · elemento ${index + 1}`;

      // Fechas de inicio/fin (education, experience, projects) y fecha simple (resto)
      for (const [key, label] of Object.entries(DATE_FIELDS_ES)) {
        const raw = item[key];
        if (raw === undefined || raw === null || raw === '') continue;
        const value = String(raw).trim();
        if (!DATE_PATTERN.test(value)) {
          issues.push({
            field: `${prefix} · ${label}`,
            location: `${section}[${index}].${key}`,
            inputValue: value,
            message: 'La fecha no es válida. Usa YYYY-MM-DD, YYYY-MM, YYYY o «present».',
          });
          continue;
        }
        const monthDayValid = isValidDateParts(value);
        if (monthDayValid) {
          issues.push({
            field: `${prefix} · ${label}`,
            location: `${section}[${index}].${key}`,
            inputValue: value,
            message: 'La fecha contiene un mes (01-12) o día (01-31) inválido.',
          });
        }
      }

      // Rango: la fecha de fin no puede ser anterior a la de inicio.
      // Solo se compara cuando AMBAS son fechas completas (YYYY-MM-DD);
      // con años/meses parciales no hay certeza y no se reporta.
      const start = fullDateOrNull(item.startDate);
      const end = fullDateOrNull(item.endDate);
      if (start && end && end < start) {
        issues.push({
          field: `${prefix} · fecha de fin`,
          location: `${section}[${index}].endDate`,
          inputValue: item.endDate,
          message: 'La fecha de fin es anterior a la fecha de inicio.',
        });
      }

      // DOI de publicaciones
      if (section === 'publications' && item.doi && typeof item.doi === 'string' && item.doi.trim()) {
        if (!DOI_PATTERN.test(item.doi.trim())) {
          issues.push({
            field: `${prefix} · DOI`,
            location: `publications[${index}].doi`,
            inputValue: item.doi,
            message: 'El DOI no es válido. Debe empezar por «10.» (ej. 10.1234/abcd).',
          });
        }
      }
    });
  }

  return issues;
}

/** Valida mes 01-12 y día 01-31 cuando están presentes. */
function isValidDateParts(value: string): boolean {
  if (/present/i.test(value)) return false;
  const parts = value.split('-');
  if (parts.length >= 2) {
    const month = Number(parts[1]);
    if (month < 1 || month > 12) return true;
  }
  if (parts.length >= 3) {
    const day = Number(parts[2]);
    if (day < 1 || day > 31) return true;
  }
  return false;
}

function fullDateOrNull(value: any): string | null {
  if (value === undefined || value === null || value === '') return null;
  const str = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  return str;
}
