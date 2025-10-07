"use client";

import { ThemeProvider } from "@/components/theme/theme-context";
import { ReactNode, useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createContext, useContext } from "react";
import { type User } from "@supabase/supabase-js";

const AuthContext = createContext<User | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function Providers({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const userValue = useMemo(() => initialUser, [initialUser]);

  return (
    <AuthContext.Provider value={userValue}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
}
