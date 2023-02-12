import { Prisma } from '@prisma/client'
import { useActionData, useLoaderData } from '@remix-run/react'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import {
  getTranslationsAndDefinitionsFromWordForm,
  WordForm,
} from '~/components'
import { deleteWordById, getWordById, updateWord } from '~/models/words.server'
import { requireUser } from '~/session.server'
import { formDataToObject } from '../utils/formData'
import { isPrismaUniqueConstraintError } from '../utils/prismaErrors'

function formatWord(
  word: NonNullable<Awaited<ReturnType<typeof getWordById>>>
) {
  return {
    id: word.id,
    text: word.text,
    language: word.language.name,
    languageId: word.language.id,
    definitions: word.definitions,
    translations: [
      ...word.TranslationA.map(
        ({ id, wordB: { language, id: wordId, ...rest } }) => ({
          ...rest,
          wordId,
          languageId: language.id,
          language: language.name,
          id,
          translationA: true,
          translationB: false,
        })
      ),
      ...word.TranslationB.map(
        ({ id, wordA: { id: wordId, language, ...rest } }) => ({
          ...rest,
          wordId,
          languageId: language.id,
          language: language.name,
          id,
          translationA: false,
          translationB: true,
        })
      ),
    ],
  }
}

export async function loader({ params, request }: LoaderArgs) {
  await requireUser(request)
  invariant(params.id, 'Word Id not found')
  const word = await getWordById(params.id)

  if (!word) throw new Response('Not Found', { status: 404 })
  const formattedWord = formatWord(word)
  return json({ word: formattedWord })
}

export async function action({ params, request }: ActionArgs) {
  invariant(params.id, 'Word Id not found')

  if (request.method === 'PUT') {
    const form = await request.formData()

    const data = formDataToObject(form)
    const theData = getTranslationsAndDefinitionsFromWordForm(data)

    invariant(data.word, 'Word not found')
    invariant(data.wordLanguage, 'Word language not found')

    try {
      const result = await updateWord(
        {
          id: params.id,
          languageId: data.wordLanguage,
          text: data.word,
        },
        theData.definitions,
        theData.definitionIds,
        theData.translations
      )
      console.log('Updated Restult__________', result)
      return json({})
    } catch (error) {
      console.log('Updated Error__________', error)
      if (isPrismaUniqueConstraintError(error))
        console.log('Updated Error Unique__________', error.stack)
      if (error instanceof Prisma.PrismaClientValidationError) {
        return json({ error: error.message })
      }
    }
  }

  if (request.method === 'DELETE') {
    try {
      const deleteResult = await deleteWordById(params.id)
      if (deleteResult) return redirect('/dictionary')
    } catch (error) {
      console.log(error)
      return json({ error })
    }
  }
  return json({})
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `Edit ${data.word.text} | ${data.word.language} - Lexicon`,
  }
}

export default function WordEdit() {
  const { word } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <WordForm
      word={word.text}
      wordId={word.id}
      language={word.language}
      theDefinitions={word.definitions}
      theTranslations={word.translations}
    />
  )
}
