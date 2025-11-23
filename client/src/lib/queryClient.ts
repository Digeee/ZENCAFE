import { QueryClient, QueryFunction } from "@tanstack/react-query";
import React, { createContext, useEffect, useState } from "react";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
function buildUrlFromQueryKey(queryKey: unknown[]): string {
  const base = String(queryKey[0] ?? "");
  const pathParts: string[] = [];
  const params: Record<string, string> = {};

  for (let i = 1; i < queryKey.length; i++) {
    const part = queryKey[i];
    if (part == null) continue;
    const t = typeof part;
    if (t === "string" || t === "number" || t === "boolean") {
      pathParts.push(encodeURIComponent(String(part)));
    } else if (t === "object") {
      const obj = part as Record<string, unknown>;
      for (const [k, v] of Object.entries(obj)) {
        if (v == null) continue;
        params[k] = String(v);
      }
    }
  }

  const path = [base, ...pathParts].join("/");
  const qs = Object.keys(params).length
    ? "?" + Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&")
    : "";
  return path + qs;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = buildUrlFromQueryKey(queryKey as unknown[]);
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

type AuthState = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user?: any;
};

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    user: undefined,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        if (!cancelled) {
          setState({
            isAuthenticated: !!data.isAuthenticated,
            isAdmin: !!data.isAdmin,
            isLoading: false,
            user: data.user || undefined,
          });
        }
      } catch {
        if (!cancelled) {
          setState({ isAuthenticated: false, isAdmin: false, isLoading: false, user: undefined });
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return React.createElement(AuthContext.Provider, { value: state }, children);
}
