import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { LanguageForm } from '~/components'
import { requireUser } from '../../../session.server'

export async function loader({ request }: LoaderArgs) {
  await requireUser(request)
  return json({})
}

export async function action({ request }: ActionArgs) {
  return json({})
}
export default function New() {
  return <LanguageForm />
}
