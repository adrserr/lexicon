import type { LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { getLanguages } from '../models/language.server'
import { requireUserId } from '../session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const languages = await getLanguages(userId)

  return json(
    { languages },
    { headers: { 'Cache-Control': 'private, max-age=300' } }
  )
}
