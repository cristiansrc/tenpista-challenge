export async function handleJsonResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(
      errorData.message ?? `HTTP ${response.status}`
    ) as Error & { status: number; response: Response };
    err.status = response.status;
    err.response = response;
    throw err;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
