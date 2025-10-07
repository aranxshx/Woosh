type ApiOptions = RequestInit & {
  json?: unknown;
};

export async function apiFetch<T>(input: string, options: ApiOptions = {}) {
  const { json, headers, ...rest } = options;
  const fetchOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...rest,
  };

  if (json !== undefined) {
    fetchOptions.body = JSON.stringify(json);
    if (!fetchOptions.method) {
      fetchOptions.method = "POST";
    }
  }

  const response = await fetch(input, fetchOptions);

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error || response.statusText || "Request failed";
    throw new Error(message);
  }

  return data as T;
}
