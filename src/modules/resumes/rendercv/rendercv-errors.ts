import { HttpException, HttpStatus } from '@nestjs/common';

/** Código de error estable para que el frontend pueda reaccionar programáticamente. */
export type RenderCVErrorCode =
  | 'VALIDATION' // datos del CV inválidos (fechas, correos, URLs, campos requeridos...)
  | 'YAML' // el YAML generado no es válido (error interno de formato)
  | 'CONTENT' // error de compilación Typst (caracteres/sintaxis en el contenido)
  | 'EMPTY' // CV sin contenido
  | 'TIMEOUT' // el render excedió el tiempo límite
  | 'UNAVAILABLE' // python/RenderCV no está instalado en el servidor
  | 'NO_OUTPUT' // el render terminó sin producir archivos
  | 'INTERNAL'; // error inesperado

export interface RenderCVFieldError {
  /** Ruta cruda reportada por RenderCV (ej. cv.sections.Experience.0.start_date) */
  location: string;
  /** Ruta amigable en español (ej. «Experiencia · elemento 1 · fecha de inicio») */
  field: string;
  /** Valor ingresado por el usuario (recortado) */
  inputValue?: string;
  /** Explicación traducida al español */
  message: string;
}

interface RenderCVErrorBody {
  statusCode: number;
  code: RenderCVErrorCode;
  message: string;
  errors?: RenderCVFieldError[];
  details?: string;
}

/**
 * Excepción base y controlada para cualquier fallo de RenderCV.
 * El payload es estructurado: { statusCode, code, message, errors[] }.
 */
export class RenderCVException extends HttpException {
  readonly code: RenderCVErrorCode;
  readonly errors?: RenderCVFieldError[];
  readonly details?: string;

  constructor(
    status: number,
    code: RenderCVErrorCode,
    message: string,
    opts?: { errors?: RenderCVFieldError[]; details?: string },
  ) {
    const body: RenderCVErrorBody = { statusCode: status, code, message };
    if (opts?.errors?.length) body.errors = opts.errors;
    if (opts?.details) body.details = opts.details;
    super(body, status);
    this.code = code;
    this.errors = opts?.errors;
    this.details = opts?.details;
  }
}

/** 422 — El CV tiene errores de datos que el usuario puede corregir. */
export class RenderCVValidationException extends RenderCVException {
  constructor(message: string, errors: RenderCVFieldError[], details?: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, 'VALIDATION', message, { errors, details });
  }
}

/** 422 — YAML malformado (no debería ocurrir vía el mapper, pero se controla). */
export class RenderCVYamlException extends RenderCVException {
  constructor(details?: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, 'YAML', 'El documento del CV tiene un error de formato YAML.', {
      details,
    });
  }
}

/** 422 — Error de compilación Typst en el contenido del CV. */
export class RenderCVContentException extends RenderCVException {
  constructor(message: string, details?: string) {
    super(HttpStatus.UNPROCESSABLE_ENTITY, 'CONTENT', message, { details });
  }
}

/** 400 — El CV está vacío. */
export class RenderCVEmptyResumeException extends RenderCVException {
  constructor() {
    super(HttpStatus.BAD_REQUEST, 'EMPTY', 'El CV está vacío. Agrega al menos tu nombre o una sección.');
  }
}

/** 504 — El render excedió el tiempo límite. */
export class RenderCVTimeoutException extends RenderCVException {
  constructor() {
    super(
      HttpStatus.GATEWAY_TIMEOUT,
      'TIMEOUT',
      'La generación del CV tardó demasiado. Inténtalo de nuevo; si persiste, reduce el contenido o quita imágenes pesadas.',
    );
  }
}

/** 503 — RenderCV no está disponible en el servidor. */
export class RenderCVUnavailableException extends RenderCVException {
  constructor() {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      'UNAVAILABLE',
      'El motor de generación de CV no está disponible en este momento. Contacta al administrador.',
    );
  }
}

/** 500 — El render terminó sin producir archivos de salida. */
export class RenderCVOutputException extends RenderCVException {
  constructor() {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'NO_OUTPUT',
      'El render no generó los archivos esperados. Inténtalo de nuevo.',
    );
  }
}

/** 500 — Error inesperado. Los detalles quedan solo en los logs del servidor. */
export class RenderCVInternalException extends RenderCVException {
  constructor() {
    super(HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL', 'Error interno al generar el CV. Inténtalo de nuevo.');
  }
}
