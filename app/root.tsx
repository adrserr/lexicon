import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import tailwindStylesheetUrl from './styles/tailwindOutput.css'
import globalStylesUrl from './styles/global.css'
import { getUser } from './session.server'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindStylesheetUrl },
    { rel: 'stylesheet', href: globalStylesUrl },
  ]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Lexicon',
  viewport: 'width=device-width,initial-scale=1',
})

export async function loader({ request }: LoaderArgs) {
  return json({
    user: await getUser(request),
  })
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-full flex-col">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
