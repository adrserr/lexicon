import * as Select from '@radix-ui/react-select'
import { useFetcher } from '@remix-run/react'
import React from 'react'
import type { loader } from '../../routes/resources/languages'
import type { FetcherData } from '../../types'

interface LanguageSelectProps {
  name?: string
  label?: string
  hiddenLabel?: boolean
  defaultValue?: string
  required?: boolean
}
export function LanguageSelect({
  name = 'language',
  label = 'language',
  hiddenLabel = true,
  defaultValue = undefined,
  required = true,
}: LanguageSelectProps) {
  const { data, ...languagesFetcher } = useFetcher<FetcherData<typeof loader>>()
  const languages = React.useMemo(
    () => data?.languages || [],
    [data?.languages]
  )

  const [value, setValue] = React.useState<string>()

  React.useEffect(() => {
    if (languagesFetcher.type === 'init') {
      languagesFetcher.load('/resources/languages')
    }
  }, [languagesFetcher])

  React.useEffect(() => {
    if (languagesFetcher.type === 'done' && !value && defaultValue) {
      const theLanguage = languages.find((el) => el.name === defaultValue)
      setValue(theLanguage?.id)
    }
  }, [defaultValue, languages, languagesFetcher.type, value])

  return (
    <>
      <label
        className={`${
          hiddenLabel ? 'sr-only' : ''
        } block font-inter text-sm font-medium text-gray-700`}
        id="language-select-label"
      >
        {label}
      </label>
      <Select.Root
        name={name}
        required={required}
        value={value}
        onValueChange={setValue}
        disabled={languagesFetcher.type !== 'done'}
      >
        <Select.Trigger
          aria-labelledby="language-select-label"
          className="flex w-auto items-center justify-between gap-2 text-ellipsis whitespace-nowrap border-b border-gray-500 bg-transparent py-1 font-inter text-base"
        >
          <Select.Value placeholder="pick a language" />
          <Select.Icon className="w-6 self-end">
            <svg
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
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal className="rounded-lg bg-white p-3 shadow-xl">
          <Select.Content className="font-inter text-black">
            <Select.ScrollUpButton />
            <Select.Viewport>
              <Select.Group>
                <Select.Label className="py-2 px-4 font-semibold underline">
                  Languages
                </Select.Label>
                {languages &&
                  languages.map((el, i) => {
                    return (
                      <Select.Item
                        className="whitespace-nowrap px-4 py-2"
                        key={el.id}
                        value={el.id}
                        textValue={el.name}
                      >
                        <Select.ItemText>{el.name}</Select.ItemText>
                        <Select.ItemIndicator />
                      </Select.Item>
                    )
                  })}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  )
}
