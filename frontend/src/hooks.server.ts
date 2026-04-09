import type { Handle, HandleFetch } from '@sveltejs/kit';
import { BACKEND_URL } from '$env/static/private';

const backendUrl = new URL(BACKEND_URL);

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  let url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    url.hostname = backendUrl.hostname;
    url.port = backendUrl.port;
    url.protocol = backendUrl.protocol;

    request = new Request(url.toString(), request);

    let cookie = event.request.headers.get('cookie');
    if (cookie) request.headers.set('cookie', cookie);
  }
  return fetch(request).then((res) => {
    let headers = new Headers(res.headers);
    headers.append('Access-Control-Allow-Origin', '*');
    return new Response(res.body, {
      ...res,
      headers
    });
  });
};

export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event, {
    filterSerializedResponseHeaders: () => true
  });
};
