import { useActionData, useLoaderData } from '@remix-run/react'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import { LanguageForm } from '~/components'
import {
  deleteLanguageById,
  getLanguageById,
  updateLanguageById,
} from '~/models/language.server'
import { requireUserId } from '~/session.server'
import { Prisma } from '@prisma/client'
import { isPrismaUniqueConstraintError } from '../../../utils/prismaErrors'

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  invariant(params.languageId, 'language id not found')
  const language = await getLanguageById(params.languageId)

  return json({ language })
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.languageId, 'langauge id not found')

  // Delete language
  if (request.method === 'DELETE') {
    const language = await deleteLanguageById(params.languageId)
    if (language) return redirect('/dictionary/languages')
  }

  // Update language
  if (request.method === 'PUT') {
    const formData = await request.formData()

    const code = formData.get('code') as string
    const name = formData.get('name') as string
    if (!code || !name) throw json('Some values where missing', { status: 400 })

    try {
      await updateLanguageById({
        code,
        name,
        id: params.languageId,
      })
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        console.log(
          'There is a unique constraint violation, a new language cannot be created with this name and userId combination'
        )
        return json(
          {
            error: 'You have already created a language with that name',
          },
          { status: 400 }
        )
      }
    }
  }
  return json({})
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `Languages - ${data.language?.name}`,
  }
}

export default function Language() {
  const { language } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>() as
    | { error: string }
    | undefined
  return (
    <>
      {language ? (
        <LanguageForm
          key={language?.id}
          language={language}
          error={actionData?.error}
        />
      ) : (
        <h3
          className="text-center font-inter text-lg font-bold"
          data-testid="language-not-found"
        >
          Opps, the language with that id doesn't exists
        </h3>
      )}
    </>
  )
}
