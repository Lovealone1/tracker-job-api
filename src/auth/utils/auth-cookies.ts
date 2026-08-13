import { CookieOptions } from 'express';

export const ACCESS_TOKEN_COOKIE = 'jt_access_token';
export const REFRESH_TOKEN_COOKIE = 'jt_refresh_token';
export const PKCE_VERIFIER_COOKIE = 'jt_pkce_verifier';

const isProd = () => process.env.NODE_ENV === 'production';

/**
 * Base options for auth cookies.
 * - httpOnly: tokens are never readable from JS (XSS-safe by design).
 * - Production: SameSite=None + Secure so cookies survive cross-site XHR
 *   (e.g. frontend on Vercel -> API on Render). In dev both apps share the
 *   "localhost" site, so Lax is enough and Secure must stay off (http).
 */
function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: isProd() ? 'none' : 'lax',
  };
}

/** Short-lived access token (sent to every API route). */
export function accessTokenCookieOptions(expiresInSeconds = 3600): CookieOptions {
  return { ...baseOptions(), path: '/', maxAge: expiresInSeconds * 1000 };
}

/** Long-lived refresh token (scoped to the auth routes only). */
export function refreshTokenCookieOptions(): CookieOptions {
  return { ...baseOptions(), path: '/api/v1/auth', maxAge: 30 * 24 * 60 * 60 * 1000 };
}

/** PKCE code verifier — only lives between the OAuth start and the callback. */
export function pkceVerifierCookieOptions(): CookieOptions {
  return { ...baseOptions(), path: '/api/v1/auth', maxAge: 10 * 60 * 1000 };
}

export function clearAccessTokenCookieOptions(): CookieOptions {
  return { ...baseOptions(), path: '/' };
}

export function clearRefreshTokenCookieOptions(): CookieOptions {
  return { ...baseOptions(), path: '/api/v1/auth' };
}

export function clearPkceVerifierCookieOptions(): CookieOptions {
  return { ...baseOptions(), path: '/api/v1/auth' };
}
