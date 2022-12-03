import type { Definition, Language, User, Word } from '@prisma/client'
import { prisma } from '~/db.server'

export type { Note } from '@prisma/client'

export function getAllUserWords(userId: User['id']) {
  return prisma.word.findMany({
    select: { id: true, text: true, languageId: true },
    orderBy: { text: 'desc' },
    where: { userId },
  })
}

export function searchUserWords(
  userId: User['id'],
  value: string,
  languageId?: Language['id']
) {
  return prisma.word.findMany({
    select: { id: true, text: true },
    where: { text: { contains: value }, userId, languageId },
  })
}
interface WordTranslations {
  originalWord: string
  translatedWord: string
  originalWordId: string
  translatedWordId: string
}
export function getWordTranslationsToLanguage(
  userId: User['id'],
  word: string,
  langTo: Language['id']
) {
  return prisma.$queryRaw<
    WordTranslations[]
  >`SELECT w1.text as originalWord, w2.text as translatedWord, w1.id as originalWordId, w2.id as translatedWordId 
                          FROM Word w1, Word w2, Translation t1 
                          WHERE w1.userId = ${userId} AND w1.text LIKE ${word}
                                                                        AND (
                                                                          ( t1.wordAId = w1.id AND t1.wordBId = w2.id ) 
                                                                          OR ( t1.wordAId = w2.id AND t1.wordBId = w1.id )
                                                                          )
                                                                          AND w2.languageId = ${langTo}`
}

export function getWordDefinitions(
  userId: User['id'],
  word: string,
  languageId: Language['id']
) {
  return prisma.definition.findMany({
    select: {
      id: true,
      wordId: true,
      word: true,
      definition: true,
      languageId: true,
      language: { select: { name: true } },
    },
    where: { word: { text: word, userId, languageId } },
  })
}

export function createWord(
  word: Omit<Word, 'id'>,
  definitions: string[],
  translations: { language: string; translation: string }[],
  userId: User['id']
) {
  const createDefinitions = definitions.map<Omit<Definition, 'id' | 'wordId'>>(
    (definition) => ({ definition, languageId: word.languageId })
  )

  const createTranslations = translations.map<{
    wordB: { create: Omit<Word, 'id'> }
  }>((translation) => ({
    wordB: {
      create: {
        languageId: translation.language,
        text: translation.translation,
        userId,
      },
    },
  }))

  return prisma.word.create({
    data: {
      userId,
      languageId: word.languageId,
      text: word.text,
      definitions: {
        create: createDefinitions,
      },
      TranslationA: {
        create: createTranslations,
      },
    },
  })
}

export function getWordById(id: Word['id']) {
  return prisma.word.findUnique({
    where: { id },
    include: {
      language: { select: { name: true, id: true } },
      definitions: { select: { definition: true, id: true } },
      TranslationA: {
        select: {
          wordB: {
            select: {
              text: true,
              id: true,
              language: { select: { id: true, name: true } },
            },
          },
        },
      },
      TranslationB: {
        select: {
          wordA: {
            select: {
              text: true,
              id: true,
              language: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  })
}

export function getWordId(userId: User['id'], word: Word['text']) {
  return prisma.word.findFirst({
    select: { id: true },
    where: { text: word, userId },
  })
}
