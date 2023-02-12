import { Prisma } from '@prisma/client'
import { useActionData } from '@remix-run/react'
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { LanguageForm } from '~/components'
import { createLanguage } from '~/models/language.server'
import { requireUser, requireUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  await requireUser(request)
  return json({})
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const code = formData.get('code') as string
  const name = formData.get('name') as string
  if (!code || !name) {
    return json({ error: 'Some values where missing' }, { status: 400 })
  }

  try {
    const language = await createLanguage({ code, name, userId })
    if (language) {
      return redirect(`/dictionary/languages/${language.id}`)
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
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
}

export const meta: MetaFunction<typeof loader> = ({}) => {
  return {
    title: `Languages - Add new`,
  }
}

export default function New() {
  // https://github.com/remix-run/remix/issues/4199
  const actionData = useActionData<typeof action>() as
    | { error: string }
    | undefined
  return <LanguageForm error={actionData?.error} />
}
