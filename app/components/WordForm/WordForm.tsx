import type { Definition } from '@prisma/client'
import { Form } from '@remix-run/react'
import React from 'react'
import { LanguageSelect } from '~/components'

function getDefinitionField(
  key: number | string,
  deleteFn: (key: number | string) => void,
  definition?: string
) {
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
          defaultValue={definition}
          name={`definition${key}`}
          id={`definition${key}`}
          className="mb-1 w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
        />
      </>
    ),
  }
}

function getTranalationField(
  key: number | string,
  deleteFn: (key: number | string) => void,
  translation?: string,
  language?: string,
  type?: 'A' | 'B'
) {
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
              defaultValue={translation}
              className="mb-1 w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
              id={`translation${key}`}
              name={`translation${key}`}
            />
            <input
              type="hidden"
              id={`translationType${key}`}
              name={`translationType${key}`}
              value={type}
            />
            <LanguageSelect
              name={`language${key}`}
              label={`language${key}`}
              defaultValue={language}
            />
          </div>
        </div>
      </>
    ),
  }
}

interface WordFormProps {
  language: string | undefined
  word: string | undefined
  wordId?: string
  theDefinitions?: Pick<Definition, 'id' | 'definition'>[]
  theTranslations?: {
    languageId: string
    language: string
    id: string
    text: string
    wordId: string
    translationA: boolean
    translationB: boolean
  }[]
}
export function WordForm({
  language,
  word,
  theDefinitions = [],
  theTranslations = [],
  wordId,
}: WordFormProps) {
  const nextDefinitionKey = React.useRef(0)
  const nextTranslationKey = React.useRef(0)

  const [definitions, setDefinitions] = React.useState<
    { key: number | string; element: JSX.Element }[]
  >(
    () =>
      theDefinitions.map((el) =>
        getDefinitionField(
          el.id,
          (key: string | number) => {
            setDefinitions((defs) => defs.filter((el) => el.key !== key))
          },
          el.definition
        )
      ) || []
  )
  const [translations, setTransaltions] = React.useState<
    { key: number | string; element: JSX.Element }[]
  >(
    theTranslations.map((el) =>
      getTranalationField(
        el.id,
        (key: number | string) => {
          setTransaltions((trans) => trans.filter((el) => el.key !== key))
        },
        el.text,
        el.language,
        el.translationA ? 'A' : 'B'
      )
    ) || []
  )
  return (
    <div className="flex h-full w-full justify-center font-inter">
      <div className="w-full max-w-md">
        <Form
          method={wordId ? 'put' : 'post'}
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
                    (key: number | string) => {
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
                    (key: string | number) => {
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
            {wordId ? 'Edit Word' : 'Create Word'}
          </button>
        </Form>
        {wordId && (
          <Form
            className="mt-3 font-inter"
            method="delete"
            data-testid="delete-language-form"
          >
            <button
              className="w-full rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
              type="submit"
            >
              Delete Word
            </button>
          </Form>
        )}
      </div>
    </div>
  )
}
