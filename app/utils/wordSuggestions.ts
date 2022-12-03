import type { User } from '@prisma/client'
import type { TranslationLanguage } from '../models/language.server'
import { searchUserWords } from '../models/words.server'
import { getUserId } from '../session.server'

export async function getWordSuggestions(
  request: Request,
  userId?: User['id'],
  translationLanguage?: TranslationLanguage
) {
  const theUserId = userId ? userId : await getUserId(request)
  const url = new URL(request.url)
  const searchValue = url.searchParams.get('search') || ''
  return searchValue && theUserId
    ? await searchUserWords(
        theUserId,
        searchValue,
        translationLanguage?.languageFromId || translationLanguage?.languageToId
      )
    : []
}
