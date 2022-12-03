import type { Language } from '@prisma/client'
import { Form } from '@remix-run/react'

interface LanguageFormProps {
  language?: Language | null
}

export function LanguageForm({ language }: LanguageFormProps) {
  return (
    <>
      <div className="flex h-full w-full justify-center font-inter">
        <div className="w-full max-w-md">
          <Form
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
        </div>
      </div>
    </>
  )
}
