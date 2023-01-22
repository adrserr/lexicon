import type { Language, User } from '@prisma/client'
import { prisma } from '~/db.server'

/**
 * Get a language by Id
 * @param languageId
 * @returns
 */
export function getLanguageById(languageId: Language['id']) {
  return prisma.language.findUnique({
    where: { id: languageId },
  })
}

/**
 * Get a language searching by userId and the language name
 * @param name language name
 * @param userId user id
 * @returns
 */
export function getLanguageByNameAndUser(
  name: Language['name'],
  userId: Language['userId']
) {
  return prisma.language.findUnique({
    select: { code: true, id: true, name: true },
    where: { name_userId: { name, userId } },
  })
}

/**
 * Get all languages of a user
 * @param userId user id
 * @returns
 */
export function getLanguages(userId: User['id']) {
  return prisma.language.findMany({
    select: { name: true, code: true, id: true },
    where: { userId },
  })
}

/**
 * Get all user languages that contain definitions
 * @param userId user id
 * @returns
 */
export function getLanguagesWithDefinitions(userId: User['id']) {
  return prisma.language.findMany({
    select: { id: true, name: true, code: true },
    where: { userId, definitions: { some: {} } },
  })
}

export interface TranslationLanguage {
  languageFrom: string
  languageTo: string
  languageFromId: string
  languageToId: string
}
/**
 * Get all user language combinations that have at least one translation in common
 * @param id user id
 * @returns
 */
export function getTranslationLanguagePairs(id: User['id']) {
  return prisma.$queryRaw<
    TranslationLanguage[]
  >`SELECT DISTINCT l1.name as languageFrom, l2.name as languageTo, l1.id as languageFromId, l2.id as languageToId
                          FROM Language l1, Language l2, Word w1, Word w2, Translation t1
                          WHERE l1.userId = ${id} AND l2.userId = ${id}
                                                  AND w1.languageId = l1.id
                                                  AND w2.languageId = l2.id
                                                  AND ( t1.wordAId = w1.id OR t1.wordBId = w1.id )
                                                  AND ( t1.wordAId = w2.id OR t1.wordBId = w2.id )
                                                  AND l1.id != l2.id
                                                  ORDER BY l1.name ASC, l2.name ASC`
}

/**
 * Update a language by Id
 * @param language language omitting user Id
 * @returns
 */
export function updateLanguageById(language: Omit<Language, 'userId'>) {
  return prisma.language.update({
    where: { id: language.id },
    data: {
      name: language.name,
      code: language.code,
    },
  })
}

/**
 * Create a new language
 * @param language language omitting the id
 * @returns
 */
export function createLanguage(language: Omit<Language, 'id'>) {
  return prisma.language.create({ data: { ...language } })
}

/**
 * Delete a language by id
 * @param id language id
 * @returns
 */
export function deleteLanguageById(id: Language['id']) {
  return prisma.language.delete({ where: { id } })
}
