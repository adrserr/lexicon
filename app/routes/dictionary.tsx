import { Form, Outlet, useFetcher, useLoaderData } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { requireUser } from '~/session.server'
import type { TranslationLanguage } from '~/models/language.server'
import {
  getLanguagesWithDefinitions,
  getTranslationLanguagePairs,
} from '~/models/language.server'
import { getWordSuggestions } from '~/utils/wordSuggestions'
import { AvatarMenu, SearchBar } from '~/components'
import type { FetcherData } from '../types'

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)

  // url query params
  const url = new URL(request.url)
  const action = url.searchParams.get('action')
  const search = url.searchParams.get('search')
  const language = url.searchParams.get('language')

  const languages = (await getLanguagesWithDefinitions(user.id)).map(
    ({ name, id }) =>
      ({ languageTo: name, languageToId: id } as TranslationLanguage)
  )
  const languageCombinations = await getTranslationLanguagePairs(user.id)
  const allLanguages = [...languages, ...languageCombinations]
  const suggestionWords = language
    ? await getWordSuggestions(request, user.id, allLanguages[Number(language)])
    : []

  if (action === 'search' && search && language && !isNaN(Number(language))) {
    const selectedLanguage = allLanguages[Number(language)]
    const redirectUrl = `/dictionary/${
      selectedLanguage.languageFrom ? selectedLanguage.languageFrom + '-' : ''
    }${selectedLanguage.languageTo || ''}/${search}`
    return redirect(redirectUrl)
  }

  return json({
    user,
    suggestionWords,
    languages: allLanguages,
  })
}

export default function Dictionary() {
  const { user, languages } = useLoaderData<typeof loader>()
  const search = useFetcher<FetcherData<typeof loader>>()

  return (
    <>
      <header className="h-44 w-full p-6 sm:h-28">
        <div className="grid grid-cols-[auto_1fr] items-center gap-4 sm:grid-cols-[auto_2fr_auto] sm:grid-rows-none sm:gap-6 2xl:grid-cols-[1fr_2fr_1fr]">
          <div className="grid-row-2 grid">
            <h1 className="font-basement text-xl md:text-2xl lg:text-4xl">
              Lexicon
            </h1>
            <p className="font-inter text-sm font-extralight tracking-widest md:text-base lg:text-xl">
              Your digital glossary
            </p>
          </div>

          <div className="justify-self-end sm:order-3">
            <AvatarMenu userName={user.name} />
          </div>
          <Form className="col-span-2 sm:col-span-1 2xl:flex 2xl:justify-center">
            <SearchBar
              suggestions={search.data?.suggestionWords || []}
              languages={languages}
              searchOnChange={(e) => {
                search.submit(e.target.form)
              }}
            />
          </Form>
        </div>
      </header>
      <main className="flex-[1_0_auto] p-6">
        <Outlet />
      </main>
      <footer className="flex h-14 shrink-0 items-center justify-center border-t font-basement text-sm font-bold">
        adrserr © 2022
      </footer>
    </>
  )
}
