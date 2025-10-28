type ResponseArg = number | ResponseInit | undefined;

const buildInit = (init: ResponseArg): ResponseInit => {
  if (!init) return {};
  if (typeof init === "number") return { status: init };
  return init;
};

const mergeHeaders = (init: ResponseInit, headers: HeadersInit): HeadersInit => {
  const existing = new Headers(init.headers);
  Object.entries(new Headers(headers)).forEach(([key, value]) => {
    existing.set(key, value);
  });
  return existing;
};

export const jsonResponse = (
  data: unknown,
  init: ResponseArg = { status: 200 }
): Response => {
  const baseInit = buildInit(init);
  const headers = mergeHeaders(baseInit, { "Content-Type": "application/json" });

  return new Response(JSON.stringify(data), {
    ...baseInit,
    headers,
  });
};

export const noContent = (): Response => new Response(null, { status: 204 });
