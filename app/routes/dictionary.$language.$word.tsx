import { Link, useLoaderData, useParams } from '@remix-run/react'
import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import invariant from 'tiny-invariant'
import { getLanguageByNameAndUser } from '../models/language.server'
import {
  getWordDefinitions,
  getWordId,
  getWordTranslationsToLanguage,
} from '../models/words.server'
import { requireUserId } from '../session.server'

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.language, 'Expected params.language')
  invariant(params.word, 'Expected params.word')

  const userId = await requireUserId(request)

  const languageNames = params.language.includes('-')
    ? params.language.split('-')
    : [params.language]

  const languageTo =
    languageNames.length === 2
      ? await getLanguageByNameAndUser(languageNames[1], userId)
      : await getLanguageByNameAndUser(languageNames[0], userId)

  let words: Awaited<ReturnType<typeof getWordTranslationsToLanguage>> = []
  let definitions: Awaited<ReturnType<typeof getWordDefinitions>> = []

  if (languageNames.length === 2) {
    words = await getWordTranslationsToLanguage(
      userId,
      params.word,
      languageTo?.id as string
    )
  }
  if (languageNames.length === 1) {
    definitions = await getWordDefinitions(
      userId,
      params.word,
      languageTo?.id as string
    )
  }

  const wordId = await getWordId(userId, params.word)

  return json({
    words: words,
    language: languageTo,
    definitions,
    wordId: wordId?.id,
  })
}

export const meta: MetaFunction<typeof loader> = ({ params, data }) => {
  invariant(params.language, 'Expected params.language')
  invariant(params.word, 'Expected params.word')

  if (data.words.length === 0 && data.definitions.length === 0) {
    return {
      title: `${params.word} not found. Do you want to add it? - Lexicon`,
    }
  }

  const isTranslation = params.language.includes('-')
  const language = isTranslation
    ? params.language.split('-').pop()
    : params.language
  return {
    title: isTranslation
      ? `${params.word} in ${language} - Lexicon`
      : `${params.word} | ${language} meaning - Lexicon`,
  }
}

export default function Word() {
  const { words, definitions, wordId } = useLoaderData<typeof loader>()
  const params = useParams<{ word: string; language: string }>()
  return (
    <section>
      {words.length === 0 && definitions.length === 0 && !wordId && (
        <h3 className="font-inter text-xl font-bold">
          {params.word} not found.{' '}
          <Link
            className="text-blue-600 underline hover:text-blue-800 "
            to={`/dictionary/words/new?word=${params.word}&language=${
              params.language?.includes('-')
                ? params.language.split('-').shift()
                : params.language
            }`}
          >
            Do You want to add it?
          </Link>
        </h3>
      )}
      {wordId && (
        <h3
          className="pb-4 font-basement text-2xl font-bold capitalize"
          data-testid="word-header"
        >
          {params.word}
          {words.length > 0 ? ' - ' + params.language : ''}
          <Link
            data-testid="edit-link"
            to={`/dictionary/words/${wordId}`}
            className="mx-2 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-200 dark:text-blue-800"
          >
            edit
          </Link>
        </h3>
      )}
      {wordId && words.length === 0 && definitions.length === 0 && (
        <p className="font-inter">No definitions or translation created yet</p>
      )}
      {words.length > 0 && (
        <ul className="list-inside list-disc">
          {words.map((el) => (
            <li key={el.translatedWordId}>{el.translatedWord}</li>
          ))}
        </ul>
      )}

      {definitions.length > 0 && (
        <ul data-testid="definitions-list" className="list-inside list-disc">
          {definitions.map((el) => (
            <li key={el.id}>{el.definition}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
