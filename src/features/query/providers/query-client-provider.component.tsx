"use client";

import { ReactQueryDevtoolsLazy } from "@/src/features/query/components/react-query-devtools-lazy.component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

export const QueryClientProviderComponent = ({ children }: IProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtoolsLazy />
    </QueryClientProvider>
  );
};
