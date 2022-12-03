import * as Select from '@radix-ui/react-select'
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
  ComboboxPopover,
} from '@reach/combobox'
import React from 'react'
import type { TranslationLanguage } from '~/models/language.server'
import { getSearchPlaceholder, getSwappedLanguages } from './utils'

interface SearchBarProps {
  languages: TranslationLanguage[]
  suggestions: { id: string; text: string }[]
  searchOnChange: React.ComponentProps<typeof ComboboxInput>['onChange']
}
export function SearchBar({
  languages,
  suggestions,
  searchOnChange,
}: SearchBarProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState(() =>
    languages && languages.length ? 0 : null
  )
  const [inputPlaceholder, setInputPlaceholder] = React.useState(() =>
    getSearchPlaceholder(languages, selectedLanguage)
  )
  const comboboxRef = React.useRef(null)
  const swappedLanguage = React.useMemo(
    () => getSwappedLanguages(selectedLanguage, languages),
    [languages, selectedLanguage]
  )

  return (
    <div className="flex h-10 w-full max-w-5xl">
      <Combobox aria-label="Search" className="w-full self-end">
        <ComboboxInput
          required
          name="search"
          autoComplete="off"
          placeholder={inputPlaceholder}
          className="p-r-4 w-full flex-grow text-ellipsis rounded-none border-b border-gray-500 bg-transparent p-0 py-2 font-inter text-base placeholder-shown:text-ellipsis placeholder-shown:font-inter placeholder-shown:tracking-tight focus-visible:border-b focus-visible:border-b-blue-700 focus-visible:outline-none"
          onChange={searchOnChange}
        />
        {suggestions && (
          <ComboboxPopover className="border bg-white">
            {suggestions.length > 0 ? (
              <ComboboxList ref={comboboxRef}>
                {suggestions.map((word) => (
                  <ComboboxOption
                    className="block p-2 font-inter data-[reach-combobox-option]:font-bold"
                    value={word.text}
                    id={word.id}
                    key={word.id}
                  >
                    <ComboboxOptionText />
                  </ComboboxOption>
                ))}
              </ComboboxList>
            ) : (
              <span className="m-2 block">No suggestions found</span>
            )}
          </ComboboxPopover>
        )}
      </Combobox>

      <div className="flex h-full w-auto items-center justify-center border-b border-gray-500 px-3">
        <div className="h-3/5 w-[0.5px] rounded-lg bg-gray-500"></div>
      </div>
      {Boolean(swappedLanguage) && (
        <button
          id="swap-language-btn"
          type="button"
          onClick={() => {
            setSelectedLanguage(swappedLanguage)
          }}
          className="hidden h-full border-b border-gray-500 pr-3 md:inline-block"
        >
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
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
        </button>
      )}
      <label className="sr-only" id="language-select-label">
        languages
      </label>
      <Select.Root
        name="language"
        defaultValue={
          Array.isArray(languages) && languages.length > 0 ? '0' : undefined
        }
        value={String(selectedLanguage)}
        onValueChange={(value) => {
          const langIndex = Number(value)
          setInputPlaceholder(getSearchPlaceholder(languages, langIndex))
          setSelectedLanguage(langIndex)
        }}
      >
        <Select.Trigger
          aria-labelledby="language-select-label"
          className="flex w-auto items-center gap-2 text-ellipsis whitespace-nowrap border-b border-gray-500 bg-transparent font-inter text-base"
        >
          <Select.Value placeholder="pick a language" />
          <Select.Icon className="w-6">
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
                <Select.Label className="py-2 px-4">Languages</Select.Label>
                {languages &&
                  languages.map((el, i) => {
                    const text = el.languageFromId
                      ? `${el.languageFrom} - ${el.languageTo}`
                      : el.languageTo
                    return (
                      <Select.Item
                        className="whitespace-nowrap px-4 py-2"
                        key={
                          el.languageFromId
                            ? `${el.languageFromId}-${el.languageToId}`
                            : el.languageToId
                        }
                        value={String(i)}
                        textValue={text}
                      >
                        <Select.ItemText>{text}</Select.ItemText>
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
      <button
        className="ml-2 flex h-10 w-10 min-w-[2.5rem] items-center justify-center self-center rounded-full border-transparent bg-yellow-500 font-medium text-white hover:bg-yellow-600 sm:ml-4"
        type="submit"
        name="action"
        value="search"
      >
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
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
    </div>
  )
}
