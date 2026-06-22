'use client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { logger } from './logger';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            logger.error('QUERY_ERROR', {
              queryKey: query.queryKey,
              error: error instanceof Error ? error.message : String(error),
            });
          },
          onSuccess: (_data, query) => {
            logger.debug('QUERY_SUCCESS', {
              queryKey: query.queryKey,
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error, variables, _mutation) => {
            logger.error('MUTATION_ERROR', {
              variables,
              error: error instanceof Error ? error.message : String(error),
            });
          },
          onSuccess: (_data, variables, _mutation) => {
            logger.info('MUTATION_SUCCESS', {
              variables,
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
