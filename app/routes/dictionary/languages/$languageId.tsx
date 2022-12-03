import { useLoaderData } from '@remix-run/react'
import type { ActionArgs, LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import { LanguageForm } from '~/components'
import { getLanguageById, updateLanguageById } from '~/models/language.server'
import { requireUserId } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  invariant(params.languageId, 'language id not found')

  const langauge = await getLanguageById(params.languageId)

  return json({ langauge })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  invariant(params.languageId, 'langauge id not found')

  const code = formData.get('code') as string
  const name = formData.get('name') as string
  if (!code || !name) throw json('Some values where missing', { status: 400 })

  await updateLanguageById({
    code,
    name,
    id: params.languageId,
  })

  return json({})
}

export default function Language() {
  const { langauge } = useLoaderData<typeof loader>()
  console.log('Language ______', langauge)
  return <LanguageForm language={langauge} />
}
