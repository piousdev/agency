// Proxy authentication requests to the Hono API backend
export async function GET(request: Request) {
  const url = new URL(request.url);
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`;

  return fetch(backendUrl, {
    method: 'GET',
    headers: request.headers,
    credentials: 'include',
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}${url.pathname}${url.search}`;

  return fetch(backendUrl, {
    method: 'POST',
    headers: request.headers,
    body: await request.text(),
    credentials: 'include',
  });
}
