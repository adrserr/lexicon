import type { LoaderFunction } from '@remix-run/server-runtime'

export type FetcherData<Loader extends LoaderFunction> = Awaited<
  ReturnType<Awaited<ReturnType<Loader>>['json']>
>
