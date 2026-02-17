const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
export async function apiGet(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, { ...opts, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiSend(path: string, method: string, body?: unknown, opts: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    method,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${method} ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}
