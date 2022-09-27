import type { LoaderArgs } from '@remix-run/server-runtime'
import { getAllUserWords } from '../models/words.server'
import { requireUserId } from '../session.server'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const words = await getAllUserWords(userId)
  return json(words)
}

export default function Words() {
  const words = useLoaderData<typeof loader>()
  console.log(words)
  return (
    <div>
      Words Route
      {JSON.stringify(words)}
    </div>
  )
}
