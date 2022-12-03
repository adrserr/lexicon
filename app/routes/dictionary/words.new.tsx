import { Form, useSearchParams } from '@remix-run/react'
import type { MetaFunction } from '@remix-run/react/dist/routeModules'
import type { ActionArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import React from 'react'
import invariant from 'tiny-invariant'
import { LanguageSelect } from '~/components'
import { createWord } from '../../models/words.server'
import { requireUserId } from '../../session.server'

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
  const data = Array.from(form.keys()).reduce(
    (acc, current) => ({ ...acc, [current]: form.get(current) }),
    {}
  ) as Record<string, string>

  invariant(data.word, 'Word not found')
  invariant(data.wordLanguage, 'Word not found')

  const theData = Object.keys(data).reduce(
    (acc, current) => {
      if (/^definition[0-9]+/.test(current)) acc.definitions.push(data[current])
      if (/^language[0-9]+/.test(current)) {
        const match = current.match(/\d+/)
        if (match && match.length > 0)
          acc.translations[match[0]] = {
            ...acc.translations[match[0]],
            language: data[current],
          }
      }
      if (/^translation[0-9]+/.test(current)) {
        const match = current.match(/\d+/)
        if (match && match.length > 0)
          acc.translations[match[0]] = {
            ...acc.translations[match[0]],
            translation: data[current],
          }
      }
      return acc
    },
    {
      definitions: [] as string[],
      translations: {} as Record<
        string,
        Record<'language' | 'translation', string>
      >,
    }
  )
  await createWord(
    { text: data.word, languageId: data.wordLanguage, userId },
    theData.definitions,
    Object.keys(theData.translations).map((el) => theData.translations[el]),
    userId
  )

  return json({})
}

function getDefinitionField(key: number, deleteFn: (key: number) => void) {
  return {
    key,
    element: (
      <>
        <div className="mb-1 flex justify-between">
          <label
            htmlFor={`definition${key}`}
            className="block text-sm font-medium text-gray-700"
          >
            Definition
          </label>
          <button
            type="button"
            onClick={() => deleteFn(key)}
            className="h-auto rounded bg-red-500 p-0.5 hover:bg-red-600 focus:bg-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <textarea
          autoFocus
          required
          name={`definition${key}`}
          id={`definition${key}`}
          className="mb-1 w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
        />
      </>
    ),
  }
}

function getTranalationField(key: number, deleteFn: (key: number) => void) {
  return {
    key,
    element: (
      <>
        <div>
          <div className="mb-1 flex justify-between">
            <label
              htmlFor={`translation${key}`}
              className="block text-sm font-medium text-gray-700"
            >
              Translation
            </label>
            <button
              type="button"
              onClick={() => deleteFn(key)}
              className="h-auto rounded bg-red-500 p-0.5 hover:bg-red-600 focus:bg-red-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center">
            <input
              autoFocus
              required
              className="mb-1 w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
              id={`translation${key}`}
              name={`translation${key}`}
            />
            <LanguageSelect name={`language${key}`} label={`language${key}`} />
          </div>
        </div>
      </>
    ),
  }
}

export default function WordNew() {
  const [searchParams] = useSearchParams()
  const language = searchParams.get('language')
  const word = searchParams.get('word')

  const nextDefinitionKey = React.useRef(0)
  const nextTranslationKey = React.useRef(0)

  const [definitions, setDefinitions] = React.useState<
    { key: number; element: JSX.Element }[]
  >([])
  const [translations, setTransaltions] = React.useState<
    { key: number; element: JSX.Element }[]
  >([])

  return (
    <div className="flex h-full w-full justify-center font-inter">
      <div className="w-full max-w-md">
        <Form
          method="post"
          encType="multipart/form-data"
          className="space-y-6 font-inter"
        >
          <h2 className="font-inter text-2xl font-semibold tracking-tighter">
            Create Word
          </h2>
          <div className="flex flex-col">
            <label
              htmlFor="word"
              className="block text-sm font-medium text-gray-700"
            >
              Word
            </label>
            <input
              autoFocus
              required
              id="word"
              name="word"
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
              defaultValue={word || undefined}
              type="text"
            />
          </div>
          <div className="flex flex-col">
            <LanguageSelect
              name="wordLanguage"
              label="Language"
              hiddenLabel={false}
              defaultValue={language || undefined}
            />
          </div>
          <fieldset className="flex flex-col">
            {translations.length > 0 &&
              translations.map(({ element, key }) =>
                React.cloneElement(element, { key })
              )}
            {definitions.length > 0 &&
              definitions.map(({ element, key }) =>
                React.cloneElement(element, { key })
              )}
          </fieldset>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTransaltions((trans) => [
                  ...trans,
                  getTranalationField(
                    nextTranslationKey.current,
                    (key: number) => {
                      setTransaltions((trans) =>
                        trans.filter((el) => el.key !== key)
                      )
                    }
                  ),
                ])
                nextTranslationKey.current = nextTranslationKey.current + 1
              }}
              className="w-1/2 rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Add Translation
            </button>
            <button
              type="button"
              onClick={() => {
                setDefinitions((defs) => [
                  ...defs,
                  getDefinitionField(
                    nextDefinitionKey.current,
                    (key: number) => {
                      setDefinitions((defs) =>
                        defs.filter((el) => el.key !== key)
                      )
                    }
                  ),
                ])
                nextDefinitionKey.current = nextDefinitionKey.current + 1
              }}
              className="w-1/2 rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Add Definition
            </button>
          </div>

          <button
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            type="submit"
          >
            Create Word
          </button>
        </Form>
      </div>
    </div>
  )
}
