import type { LoaderArgs } from '@remix-run/server-runtime'
import { getLanguages } from '../models/language.server'
import { requireUserId } from '../session.server'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const languages = await getLanguages(userId)
  return json(languages)
}

export default function Languages() {
  const languages = useLoaderData<typeof loader>()
  return <div>Languages {JSON.stringify(languages, null, 2)}</div>
}
