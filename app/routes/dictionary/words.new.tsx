import { Form, useActionData, useSearchParams } from '@remix-run/react'
import type { MetaFunction } from '@remix-run/react/dist/routeModules'
import type { ActionArgs } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import React from 'react'
import invariant from 'tiny-invariant'
import {
  getTranslationsAndDefinitionsFromWordForm,
  WordForm,
} from '~/components'
import { getLanguageById } from '../../models/language.server'
import { createWord } from '../../models/words.server'
import { requireUserId } from '../../session.server'
import { formDataToObject } from '../../utils/formData'
import { isPrismaUniqueConstraintError } from '../../utils/prismaErrors'

export const meta: MetaFunction = ({ location }) => {
  const searchParams = new URLSearchParams(location.search)
  const word = searchParams.get('word')
  const language = searchParams.get('language')
  return {
    title: `Add ${word || 'word'}${language ? ' | ' + language : ''}`,
  }
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request)
  const form = await request.formData()
  const data = formDataToObject(form)

  invariant(data.word, 'Word not found')
  invariant(data.wordLanguage, 'Word not found')

  const theData = getTranslationsAndDefinitionsFromWordForm(data)

  try {
    const word = await createWord(
      { text: data.word, languageId: data.wordLanguage, userId },
      theData.definitions,
      Object.keys(theData.translations).map((el) => theData.translations[el]),
      userId
    )
    if (word) {
      const lang = await getLanguageById(data.wordLanguage)
      return redirect(`/dictionary/${lang?.name}/${word.text}`)
    }
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      console.log(error.message)
      return json(
        {
          error: `You have already created ${data.word} for this language`,
        },
        { status: 400 }
      )
    }
  }
}

export default function WordNew() {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const language = searchParams.get('language') || undefined
  const word = searchParams.get('word') || undefined
  console.log(actionData)
  return (
    <div className="flex h-full w-full justify-center font-inter">
      <div className="w-full max-w-md">
        <WordForm word={word} language={language} />
      </div>
    </div>
  )
}
