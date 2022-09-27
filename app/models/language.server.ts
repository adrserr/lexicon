import type { Language, User } from '@prisma/client'
import { prisma } from '~/db.server'

export function getLanguage(languageId: Language['id']) {
  return prisma.language.findUnique({
    select: { code: true, id: true, name: true },
    where: { id: languageId },
  })
}

export function getLanguages(userId: User['id']) {
  return prisma.language.findMany({
    select: { name: true, code: true, id: true },
    where: { userId },
  })
}

export function getLanguagesWithDefinitions(userId: User['id']) {
  return prisma.language.findMany({
    select: { id: true, name: true, code: true },
    where: { userId, definitions: { some: {} } },
  })
}

// export function getTranslationLanguagePairs(id: User['id']) {
//   return prisma.translation.findMany({
//     select: {
//       wordA: { select: { languageId: true } },
//       wordB: { select: { languageId: true } },
//     },
//   })
// }
