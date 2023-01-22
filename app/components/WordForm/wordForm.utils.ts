/**
 *
 * @param data word form
 * @returns parsed definitions and translations of a word
 */
export function getTranslationsAndDefinitionsFromWordForm(
  data: Record<string, string>
) {
  return Object.keys(data).reduce(
    (acc, current) => {
      if (/^definition[a-zA-Z0-9]+/.test(current)) {
        acc.definitions.push(data[current])
        acc.definitionIds.push(current.replace('definition', ''))
      } else if (/^language[a-zA-Z0-9]+/.test(current)) {
        const key = current.replace('language', '')
        if (key && !key.includes('language'))
          acc.translations[key] = {
            ...acc.translations[key],
            language: data[current],
          }
      } else if (/^translationType[a-zA-Z0-9]+/.test(current)) {
        const key = current.replace('translationType', '')
        if (key && !key.includes('translationType'))
          acc.translations[key] = {
            ...acc.translations[key],
            type: data[current],
          }
      } else if (/^translation[a-zA-Z0-9]+/.test(current)) {
        const key = current.replace('translation', '')
        if (key && !key.includes('translation'))
          acc.translations[key] = {
            ...acc.translations[key],
            translation: data[current],
          }
      }
      return acc
    },
    {
      definitions: [] as string[],
      definitionIds: [] as string[],
      translations: {} as Record<
        string,
        Record<'language' | 'translation' | 'type', string>
      >,
    }
  )
}
