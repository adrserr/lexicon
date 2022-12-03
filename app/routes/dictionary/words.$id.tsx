import { useLoaderData } from '@remix-run/react'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import { WordForm } from '~/components'
import { getWordById } from '~/models/words.server'
import { requireUser } from '~/session.server'

function formatWord(
  word: NonNullable<Awaited<ReturnType<typeof getWordById>>>
) {
  return {
    text: word.text,
    language: word.language.name,
    languageId: word.language.id,
    definitions: word.definitions,
    translations: [
      ...word.TranslationA.map(({ wordB: { language, ...rest } }) => ({
        ...rest,
        languageId: language.id,
        language: language.name,
      })),
      ...word.TranslationB.map(({ wordA: { language, ...rest } }) => ({
        ...rest,
        languageId: language.id,
        language: language.name,
      })),
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

export default function WordEdit() {
  const { word } = useLoaderData<typeof loader>()
  return (
    <WordForm
      word={word.text}
      language={word.language}
      theDefinitions={word.definitions}
      theTranslations={word.translations}
    />
  )
}
