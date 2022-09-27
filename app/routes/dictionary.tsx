import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { getUserId, requireUser } from '../session.server'
import { searchUserWords } from '../models/words.server'
import type { User } from '@prisma/client'
import { getLanguagesWithDefinitions } from '../models/language.server'

async function getWordSuggestions(request: Request, userId?: User['id']) {
  const theUserId = userId ? userId : await getUserId(request)
  const url = await new URL(request.url)
  const searchValue = url.searchParams.get('search') || ''
  return searchValue && theUserId
    ? await searchUserWords(theUserId, searchValue)
    : []
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)

  const lang = await getLanguagesWithDefinitions(user.id)
  const words = await getWordSuggestions(request, user.id)
  return json({ user, words, lang })
}

export default function Dictionary() {
  const { user, lang } = useLoaderData<typeof loader>()
  const suggestions = useFetcher<{
    words: Awaited<ReturnType<typeof getWordSuggestions>>
  }>()

  return (
    <div>
      Welcome {user.name} to Lexicon your personal glossary
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
      </Form>
      <suggestions.Form>
        <div className="my-24 border">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Search
          </label>
          <div className="mt-1 flex">
            <input
              // ref={emailRef}
              id="search"
              required
              // autoFocus={true}
              name="search"
              type="text"
              pattern="[a-zA-Z]"
              onChange={(event) => suggestions.submit(event.target.form)}
              // autoComplete="email"
              // aria-invalid={actionData?.errors?.email ? true : undefined}
              // aria-describedby="email-error"
              className="w-5/12 rounded-l-full border border-r-0 border-gray-500 px-2 py-1 text-lg"
            />
            <div></div>
            <select
              name="language"
              className="w-4/12 rounded-r-full border border-l-0 border-gray-500 px-2 py-1 text-lg"
            >
              <option value="value1">Value 1</option>
              <option value="value2" selected>
                Value 2
              </option>
              <option value="value3">Value 3</option>
            </select>
          </div>
        </div>
      </suggestions.Form>
    </div>
  )
}
