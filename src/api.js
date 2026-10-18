export const API = "http://localhost:5000";

let onError = () => {};
export const setErrorHandler = fn => (onError = fn);

async function request(path, method = "GET", body) {
  const isForm = body instanceof FormData;
  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: body && !isForm ? JSON.stringify(body) : body,
    });
  } catch {
    onError("Server se connection nahi ho raha. API chal rahi hai?");
    throw new Error("network");
  }
  if (!res.ok) {
    const text = await res.text();
    onError(text || "Kuch ghalat ho gaya");
    throw new Error(text);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: p => request(p),
  post: (p, b) => request(p, "POST", b),
  put: (p, b) => request(p, "PUT", b),
  del: p => request(p, "DELETE"),
};