export async function apiFetch(url, options = {}) {
  let token;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    token = user?.authToken || user?.token;
  } catch {
    /* No valid session. */
  }
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", "Bearer " + token);
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-expired"));
  }
  return response;
}
