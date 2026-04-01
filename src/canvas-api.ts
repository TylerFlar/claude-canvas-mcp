export class CanvasAPI {
  private baseUrl: string;
  private token: string;
  private lastRequestTime = 0;
  private minRequestInterval = 600; // ~100 requests/min

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "") + "/api/v1";
    this.token = token;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - elapsed)
      );
    }
    this.lastRequestTime = Date.now();
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | string[] | undefined>
  ): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(`${key}[]`, v);
          }
        } else {
          url.searchParams.set(key, value);
        }
      }
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string | string[] | undefined>,
    body?: Record<string, unknown>
  ): Promise<{ data: T; headers: Headers }> {
    await this.throttle();

    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      Accept: "application/json",
    };

    const init: RequestInit = { method, headers };

    if (body) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      let errorDetail = "";
      try {
        const errorBody = await response.json();
        if (errorBody.errors) {
          errorDetail = JSON.stringify(errorBody.errors);
        } else if (errorBody.message) {
          errorDetail = errorBody.message;
        } else {
          errorDetail = JSON.stringify(errorBody);
        }
      } catch {
        errorDetail = await response.text().catch(() => "Unknown error");
      }
      throw new Error(
        `Canvas API ${method} ${path} failed (${response.status}): ${errorDetail}`
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: {} as T, headers: response.headers };
    }

    const data = (await response.json()) as T;
    return { data, headers: response.headers };
  }

  private parseNextLink(headers: Headers): string | null {
    const link = headers.get("link");
    if (!link) return null;
    const match = link.match(/<([^>]+)>;\s*rel="next"/);
    return match ? match[1] : null;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>
  ): Promise<T> {
    const { data } = await this.request<T>("GET", path, params);
    return data;
  }

  async getPaginated<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>,
    maxPages = 10
  ): Promise<T[]> {
    const allParams = { per_page: "100", ...params };
    const { data, headers } = await this.request<T[]>(
      "GET",
      path,
      allParams
    );
    const results: T[] = [...data];

    let nextUrl = this.parseNextLink(headers);
    let page = 1;

    while (nextUrl && page < maxPages) {
      await this.throttle();
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) break;
      const pageData = (await response.json()) as T[];
      results.push(...pageData);
      nextUrl = this.parseNextLink(response.headers);
      page++;
    }

    return results;
  }

  async post<T>(
    path: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const { data } = await this.request<T>("POST", path, undefined, body);
    return data;
  }

  async put<T>(
    path: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const { data } = await this.request<T>("PUT", path, undefined, body);
    return data;
  }

  async delete<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>
  ): Promise<T> {
    const { data } = await this.request<T>("DELETE", path, params);
    return data;
  }
}
