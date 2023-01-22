import type { Language } from '@prisma/client'
import { Form } from '@remix-run/react'

interface LanguageFormProps {
  language?: Language | null
  error?: string
}

export function LanguageForm({ language, error }: LanguageFormProps) {
  return (
    <>
      <div className="flex h-full w-full justify-center font-inter">
        <div className="w-full max-w-md">
          <Form
            data-testid={`language-form${language ? '-' + language.name : ''}`}
            className="space-y-6 font-inter"
            method={language ? 'put' : 'post'}
          >
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              required
              name="name"
              id="name"
              type="text"
              autoComplete="off"
              defaultValue={language?.name}
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Code
            </label>
            <input
              required
              name="code"
              id="code"
              autoComplete="off"
              defaultValue={language?.code}
              type="text"
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            <button
              className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              type="submit"
            >
              {language ? 'Edit' : 'Create'} Language
            </button>
          </Form>
          {language && (
            <Form
              className="mt-3 font-inter"
              method="delete"
              data-testid="delete-language-form"
            >
              <button
                className="w-full rounded bg-red-500  py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
                type="submit"
              >
                Delete Language
              </button>
            </Form>
          )}
          {error && (
            <p
              className="mt-3 flex justify-center gap-2 rounded bg-red-400 p-2 text-center font-inter"
              data-testid="language-form-error"
            >
              <svg
                data-testid="language-form-error-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
