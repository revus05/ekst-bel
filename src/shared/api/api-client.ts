type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];
type ApiParseMode = "json" | "text" | "response";

type ApiRequestOptions<TBody> = Omit<RequestInit, "body"> & {
  baseUrl?: string;
  body?: TBody;
  parseAs?: ApiParseMode;
  query?: Record<string, QueryValue>;
};

class ApiClientError<TPayload = unknown> extends Error {
  readonly status: number;
  readonly payload: TPayload | null;

  constructor(
    message: string,
    status: number,
    payload: TPayload | null = null,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

function appendQueryParams(
  path: string,
  query?: Record<string, QueryValue>,
): string {
  if (!query) {
    return path;
  }

  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);

  for (const [key, rawValue] of Object.entries(query)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (value === null || value === undefined || value === "") {
        continue;
      }

      params.append(key, String(value));
    }
  }

  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

async function parseResponsePayload<TResponse>(
  response: Response,
  parseAs: ApiParseMode,
): Promise<TResponse | Response | string | null> {
  if (parseAs === "response") {
    return response;
  }

  if (response.status === 204) {
    return null;
  }

  if (parseAs === "text") {
    return response.text();
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as TResponse;
}

async function request<TResponse, TBody = undefined>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const {
    baseUrl = "",
    body,
    headers,
    parseAs = "json",
    query,
    ...init
  } = options;

  const requestHeaders = new Headers(headers);
  const requestUrl = `${baseUrl}${appendQueryParams(path, query)}`;

  let payload: BodyInit | undefined;

  if (body !== undefined) {
    if (isBodyInit(body)) {
      payload = body;
    } else {
      payload = JSON.stringify(body);

      if (!requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
      }
    }
  }

  if (!requestHeaders.has("Accept") && parseAs === "json") {
    requestHeaders.set("Accept", "application/json");
  }

  const response = await fetch(requestUrl, {
    ...init,
    body: payload,
    headers: requestHeaders,
  });

  const responsePayload = await parseResponsePayload<TResponse>(
    response,
    parseAs,
  );

  if (!response.ok) {
    throw new ApiClientError(
      `Request failed with status ${response.status}`,
      response.status,
      responsePayload,
    );
  }

  return responsePayload as TResponse;
}

const apiClient = {
  request,
  get: <TResponse>(
    path: string,
    options?: Omit<ApiRequestOptions<never>, "method">,
  ) => request<TResponse>(path, { ...options, method: "GET" }),
  post: <TResponse, TBody = undefined>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body" | "method">,
  ) => request<TResponse, TBody>(path, { ...options, method: "POST", body }),
  put: <TResponse, TBody = undefined>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body" | "method">,
  ) => request<TResponse, TBody>(path, { ...options, method: "PUT", body }),
  patch: <TResponse, TBody = undefined>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body" | "method">,
  ) => request<TResponse, TBody>(path, { ...options, method: "PATCH", body }),
  delete: <TResponse>(
    path: string,
    options?: Omit<ApiRequestOptions<never>, "method">,
  ) => request<TResponse>(path, { ...options, method: "DELETE" }),
};

export type { ApiParseMode, ApiRequestOptions, QueryValue };
export { ApiClientError, apiClient };
