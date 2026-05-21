export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

export function deleteCookie(name: string, path = '/') {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; path=${path}`;
}

export const AUTH_COOKIES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  SESSION_FLAG: 'has_session',
} as const;
