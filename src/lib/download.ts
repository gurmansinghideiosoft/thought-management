import { http } from './api/axios';

/**
 * Fetch `path` through the authed axios client (so the bearer token and 401
 * refresh apply) and save the response body as a file. The filename comes from
 * the response's `Content-Disposition`, falling back to `fallbackName`.
 */
export async function downloadFromApi(path: string, fallbackName: string): Promise<void> {
  const res = await http.get(path, { responseType: 'blob' });

  const disposition = String(res.headers['content-disposition'] ?? '');
  const name = /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? fallbackName;

  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
