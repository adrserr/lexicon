import { Prisma, PrismaClient } from '@prisma/client'
import type { Language, User, Word } from '@prisma/client'
import { prisma } from '~/db.server'

export type { Note } from '@prisma/client'

/**
 *
 * @param userId user id
 * @param sort order by text, asc or desc
 * @returns all the words of a user
 */
export function getAllUserWords(
  userId: User['id'],
  sort: Prisma.SortOrder = 'asc'
) {
  return prisma.word.findMany({
    select: { id: true, text: true, languageId: true },
    orderBy: { text: sort },
    where: { userId },
  })
}

/**
 *
 * @param userId user id
 * @param value search value
 * @param languageId language of the searched word
 * @returns the words of that language that contain the searhed value
 */
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
/**
 *
 * @param userId user id
 * @param word word to get translations
 * @param langTo language you are searching for translations of the word
 * @returns translations of the language for that word and user
 */
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

/**
 *
 * @param userId user id
 * @param word word to look for definitions
 * @param languageId language of the definitions you are looking for
 * @returns definitions of that word in the selected language
 */
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

/**
 *
 * @param word word text
 * @param definitions array of definitions
 * @param translations array of translations
 * @param userId user id
 * @returns a promise with the created word if there is no error
 */
export function createWord(
  word: Omit<Word, 'id'>,
  definitions: string[],
  translations: { language: string; translation: string }[],
  userId: User['id']
) {
  const createDefinitions = definitions.map((definition) => ({
    definition,
    languageId: word.languageId,
  })) satisfies Prisma.DefinitionUncheckedCreateWithoutWordInput[]

  const createTranslations = translations.map((translation) => ({
    wordB: {
      create: {
        languageId: translation.language,
        text: translation.translation,
        userId,
      },
    },
  })) satisfies {
    wordB: Prisma.WordUncheckedCreateNestedManyWithoutLanguageInput
  }[]

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

/**
 *
 * @param id word id
 * @returns returns the word if found
 */
export function getWordById(id: Word['id']) {
  return prisma.word.findUnique({
    where: { id },
    include: {
      language: { select: { name: true, id: true } },
      definitions: { select: { definition: true, id: true } },
      TranslationA: {
        select: {
          id: true,
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
          id: true,
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

/**
 *
 * @param userId user id
 * @param word word text
 * @returns the id of the found word
 */
export function getWordId(userId: User['id'], word: Word['text']) {
  return prisma.word.findFirst({
    select: { id: true },
    where: { text: word, userId },
  })
}

/**
 * Utility method use in updateWord
 * @param id word id
 * @returns formatted word to use in updateWord fucntion
 */
async function getWordToUpdateById(id: Word['id']) {
  const word = await prisma.word.findUnique({
    where: { id },
    select: {
      userId: true,
      id: true,
      text: true,
      languageId: true,
      definitions: { select: { id: true } },
      TranslationA: { select: { id: true } },
      TranslationB: { select: { id: true } },
    },
  })
  if (!word) return null
  return {
    ...word,
    definitions: word?.definitions.map((el) => el.id),
    TranslationA: word?.TranslationA.map((el) => el.id),
    TranslationB: word?.TranslationB.map((el) => el.id),
  }
}

/**
 *
 * @param word word object
 * @param definitions array of definitions
 * @param definitionIds array of the definitions ids
 * @param translations object containing the translations
 * @returns
 */
export async function updateWord(
  word: Omit<Word, 'userId'>,
  definitions: string[],
  definitionIds: string[],
  translations: Record<
    string,
    Record<'language' | 'translation' | 'type', string>
  >
) {
  const oldWord = await getWordToUpdateById(word.id)

  if(!oldWord) throw new Error("Word Not Found");

  const updatedTranslationIds = Object.keys(translations)

    const {toBeRemovedTranslationsA, toBeUpsertTranslationsAIds} = oldWord?.TranslationA.reduce((translations, id) => {
      !updatedTranslationIds.includes(id) ? translations.toBeRemovedTranslationsA.push(id) : translations.toBeUpsertTranslationsAIds.push(id)
      return translations
    }, {toBeRemovedTranslationsA: [] as string[], toBeUpsertTranslationsAIds: [] as string[]})

    const {toBeRemovedTranslationsB, toBeUpsertTranslationsBIds} = oldWord?.TranslationB.reduce((translations, id) => {
      !updatedTranslationIds.includes(id) ? translations.toBeRemovedTranslationsB.push(id) : translations.toBeUpsertTranslationsBIds.push(id)
      return translations
    }, {toBeRemovedTranslationsB: [] as string[], toBeUpsertTranslationsBIds: [] as string[]})

  const toBeUpsertTranslationsA = (toBeUpsertTranslationsAIds.map((id) => {
    const translation = translations[id]
    return {
      where: {id},
      create: {
        wordAId: word.id,
        wordB: {
          create: {
            languageId: translation.language,
            text: translation.translation,
            userId: oldWord.userId,
            TranslationA: {}
          },
        },
      },
      update: {
        wordB: {
          update: {
            languageId: translation.language,
            text: translation.translation,
          },
        },
      },
    }
  }) || []) satisfies Prisma.TranslationUpsertArgs[]

  const toBeUpsertTranslationsB = (toBeUpsertTranslationsBIds.map((id) => {
    const translation = translations[id]
    return {
      where: { id },
      create: {
        wordA: {
          create: {
            languageId: translation.language,
            text: translation.translation,
            userId: oldWord.userId,
          },
        },
      },
      update: {
        wordA: {
          update: {
            languageId: translation.language,
            text: translation.translation,
          },
        },
      },
    }
  }) || []) satisfies Prisma.TranslationUpsertArgs[]

  // DEFINITIONS
  const toBeRemovedDefinitions = oldWord?.definitions.filter(
    (id) => !definitionIds.includes(id)
  )

  const upsertDefinitions = definitionIds.map((id, i) => {
    return {
      where: { id },
      create: { definition: definitions[i], languageId: word.languageId },
      update: { definition: definitions[i] },
    }
  }) satisfies Prisma.DefinitionUpsertWithWhereUniqueWithoutWordInput[]

  // UPDATE
  return prisma.word.update({
    where: { id: word.id },
    data: {
      ...word,
      definitions: {
        upsert: upsertDefinitions,
        deleteMany: { id: { in: toBeRemovedDefinitions } },
      },

      TranslationA: {
        deleteMany: { id: { in: toBeRemovedTranslationsA } },
        // upsert: toBeUpsertTranslationsA,
      },
      TranslationB: {
        deleteMany: { id: { in: toBeRemovedTranslationsB } },
        upsert: toBeUpsertTranslationsB
      },
    },
  })
}

export function deleteWordById(id: Word['id']) {
  return prisma.word.delete({ where: { id } })
}
