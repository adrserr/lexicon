import type { TranslationLanguage } from '../../models/language.server'

export function getSwappedLanguages(
  selectedLanguage: number | null,
  languages: TranslationLanguage[] | undefined
): number | null {
  if (
    !languages ||
    !selectedLanguage ||
    selectedLanguage > languages.length - 1 ||
    !languages[selectedLanguage].languageFromId
  )
    return null
  const translationLanguages = languages[selectedLanguage]
  return languages.findIndex(
    (el) =>
      el.languageFromId === translationLanguages.languageToId &&
      el.languageToId === translationLanguages.languageFromId
  )
}

export function getSearchPlaceholder(
  languages: TranslationLanguage[],
  selectedLanguage: number | null
) {
  let placeholder = 'Search'
  if (
    selectedLanguage !== undefined &&
    selectedLanguage !== null &&
    selectedLanguage < languages.length
  ) {
    const language = languages[selectedLanguage]
    placeholder = `${placeholder} ${language.languageFrom || ''}${
      language.languageFrom ? ' - ' : ''
    }${language.languageTo}`
  }
  return placeholder
}
