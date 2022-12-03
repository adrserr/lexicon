/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User, Language, Word, Definition } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

function shuffle<T>(array: Array<T>) {
  const newArray = structuredClone(array)
  return newArray.sort(() => Math.random() - 0.5)
}

async function createRandomUser() {
  const sex = faker.name.sexType()
  const name = faker.name.firstName(sex)
  const surname = faker.name.lastName()
  const email = faker.internet.email(name, surname)
  const hashedPassword = await bcrypt.hash('12345678', 10)

  return prisma.user.create({
    data: {
      name,
      email,
      surname,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

async function createLanguageForUser(
  userId: User['id'],
  name?: Language['name'],
  code?: Language['code']
) {
  return prisma.language.create({
    data: {
      userId,
      name: name || faker.word.noun(5),
      code: code || faker.word.preposition(),
    },
  })
}

async function createWordForUserAndLanguage(
  userId: User['id'],
  languageId: Language['id'],
  word?: Word['text'],
  definitions?: Definition['definition'][]
) {
  const theDefinitions = definitions
    ? definitions?.map((el) => ({
        languageId,
        definition: el,
      }))
    : Array(getRandomArbitrary(0, 11))
        .fill(0)
        .map(() => ({
          languageId,
          definition: faker.lorem.sentence(),
        }))

  return prisma.word.create({
    data: {
      text: word || faker.random.word(),
      languageId,
      userId,
      definitions: {
        create: theDefinitions,
      },
    },
  })
}

async function createTranslation(wordAId: Word['id'], wordBId: Word['id']) {
  return prisma.translation.create({
    data: {
      wordAId,
      wordBId,
    },
  })
}

async function seed() {
  // Create Users
  // const users = await Promise.all(
  //   Array(20)
  //     .fill(0)
  //     .map(async () => {
  //       return await createRandomUser()
  //     })
  // )

  // Create User Languages
  // const usersWithLanguages: { user: User; languages: Language[] }[] =
  //   await Promise.all(
  //     users.map(async (user) => {
  //       const languages = await Promise.all(
  //         Array(getRandomArbitrary(1, 10))
  //           .fill(0)
  //           .map(async () => await createLanguageForUser(user.id))
  //       )
  //       return { user, languages }
  //     })
  //   )

  // Create User Words
  // const usersWithLanguagesAndWords: {
  //   user: User
  //   languages: Language[]
  //   words: Word[]
  // }[] = await Promise.all(
  //   usersWithLanguages.map(async (el) => {
  //     const words = await Promise.all(
  //       Array(getRandomArbitrary(10, 40))
  //         .fill(0)
  //         .map(
  //           async () =>
  //             await createWordForUserAndLanguage(
  //               el.user.id,
  //               el.languages[getRandomArbitrary(1, el.languages.length - 1)].id
  //             )
  //         )
  //     )
  //     return { ...el, words }
  //   })
  // )

  // Create Word Translations
  // await Promise.all(
  //   usersWithLanguagesAndWords.map(async (el) => {
  //     const translations = await el.languages.reduce<Promise<Translation[]>>(
  //       async (prev, currentLanguage) => {
  //         const langWords = shuffle(
  //           el.words.filter((w) => w.languageId === currentLanguage.id)
  //         )
  //         const nonLangWords = shuffle(
  //           el.words.filter((w) => w.languageId !== currentLanguage.id)
  //         )

  //         const numberOfTranslations = getRandomArbitrary(
  //           0,
  //           langWords.length - 1 >= 0 ? langWords.length - 1 : 0
  //         )

  //         const langTranslations =
  //           nonLangWords.length !== 0 && langWords.length !== 0
  //             ? await Promise.all(
  //                 Array(numberOfTranslations)
  //                   .fill(0)
  //                   .map(async (_, i) => {
  //                     return await createTranslation(
  //                       langWords[i].id,
  //                       nonLangWords[
  //                         getRandomArbitrary(
  //                           0,
  //                           nonLangWords.length - 1 >= 0
  //                             ? nonLangWords.length - 1
  //                             : 0
  //                         )
  //                       ].id
  //                     )
  //                   })
  //               )
  //             : []

  //         return [...(await prev), ...langTranslations]
  //       },
  //       [] as unknown as Promise<Translation[]>
  //     )

  //     return { ...el, translations }
  //   })
  // )

  // My test user
  const email = 'adrserr@hotmail.com'

  // // cleanup the existing database
  // await prisma.user.delete({ where: { email } }).catch(() => {
  //   // no worries if it doesn't exist yet
  // })

  const hashedPassword = await bcrypt.hash('12345678', 10)

  const user = await prisma.user.create({
    data: {
      name: 'Adrián',
      surname: 'Serrano',
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  // My languages
  const english = await createLanguageForUser(user.id, 'English', 'en')
  const spanish = await createLanguageForUser(user.id, 'Spanish', 'es')
  const italian = await createLanguageForUser(user.id, 'Italian', 'it')
  const french = await createLanguageForUser(user.id, 'French', 'fr')
  const portuguese = await createLanguageForUser(user.id, 'Portuguese', 'pt')

  // My Words
  const lexiconEn = await createWordForUserAndLanguage(
    user.id,
    english.id,
    'lexicon',
    [
      '(a list of) all the words used in a particular language or subject, or a dictionary.',
      'all the words used in a particular language or subject, or a dictionary.',
      'inventory or record.',
      'a wordbook or dictionary, especially of Greek, Latin, or Hebrew.',
    ]
  )

  const lexiconEs = await createWordForUserAndLanguage(
    user.id,
    spanish.id,
    'lexicón',
    [
      'Conocimiento léxico que un hablante posee sobre una lengua.',
      'diccionario',
    ]
  )

  const glossaryEs = await createWordForUserAndLanguage(
    user.id,
    spanish.id,
    'glosario',
    [
      'Conjunto de glosas o comentarios, normalmente sobre textos de un mismo autor.',
      'Catálogo de palabras de una misma disciplina, de un mismo campo de estudio, de una misma obra, etc., definidas o comentadas',
    ]
  )

  const glossaryIt = await createWordForUserAndLanguage(
    user.id,
    italian.id,
    'glossario',
    [
      'Raccolta di vocaboli meno com. o propri di una determinata disciplina, accompagnati ognuno dalla dichiarazione del sign. o da altre osservazioni.',
    ]
  )

  const flabbergastedEn = await createWordForUserAndLanguage(
    user.id,
    english.id,
    'flabbergasted',
    [
      'feeling shocked, usually because of something you were not expecting',
      'very surprised',
    ]
  )

  const flabbergastedEs = await createWordForUserAndLanguage(
    user.id,
    spanish.id,
    'atónito',
    ['Pasmado o espantado de un objeto o suceso raro.']
  )

  const stunnedEs = await createWordForUserAndLanguage(
    user.id,
    spanish.id,
    'pasmado',
    ['Dicho de una persona: Alelada, absorta o distraída.']
  )

  const stunnedEn = await createWordForUserAndLanguage(
    user.id,
    english.id,
    'stunned',
    ['very shocked or surprised']
  )

  const goodMorningIt = await createWordForUserAndLanguage(
    user.id,
    italian.id,
    'buongiorno',
    [
      "Formula di saluto durante la mattinata nell'incontrarsi o nell'accomiatarsi",
    ]
  )

  const goodMorningEs = await createWordForUserAndLanguage(
    user.id,
    spanish.id,
    'Buenos días',
    [
      'Expresión cordial y formal de saludo usada entre el amanecer y el mediodía.',
    ]
  )

  const goodMorningEn = await createWordForUserAndLanguage(
    user.id,
    english.id,
    'Good morning',
    ['expressing good wishes on meeting or parting during the morning.']
  )

  const howDoYouDoEn = await createWordForUserAndLanguage(
    user.id,
    english.id,
    'How do you do?',
    [
      'a formal greeting for someone that you have not met before',
      'words that are said by a person to someone he is being introduced to',
    ]
  )

  const howDoYouDoEs = await createWordForUserAndLanguage(
    user.id,
    spanish.id,
    'Encantado',
    [
      'Que está satisfecho o contento.',
      'Se emplea como fórmula de saludo en las presentaciones sociales.',
    ]
  )

  const howDoYouDoPt = await createWordForUserAndLanguage(
    user.id,
    portuguese.id,
    'Muito prazer',
    []
  )

  // My Translations
  const lexiconEsEn = await createTranslation(lexiconEs.id, lexiconEn.id)
  const glossaryEsEn = await createTranslation(glossaryEs.id, lexiconEn.id)
  const glossaryEsIt = await createTranslation(glossaryEs.id, glossaryIt.id)

  const flabbergastedEnEs = await createTranslation(
    flabbergastedEn.id,
    flabbergastedEs.id
  )
  const stunnedEnEs = await createTranslation(stunnedEn.id, stunnedEs.id)
  const stunnedFlabbergastedEnEs = await createTranslation(
    stunnedEn.id,
    flabbergastedEs.id
  )

  const goodMorningEnEs = await createTranslation(
    goodMorningEn.id,
    goodMorningEs.id
  )
  const goodMorningEnIt = await createTranslation(
    goodMorningEn.id,
    goodMorningIt.id
  )
  const goodMorningEsIt = await createTranslation(
    goodMorningEs.id,
    goodMorningIt.id
  )

  const howDoYouDoEnEs = await createTranslation(
    howDoYouDoEn.id,
    howDoYouDoEs.id
  )
  const howDoYouDoEnPt = await createTranslation(
    howDoYouDoEn.id,
    howDoYouDoPt.id
  )
  const howDoYouDoPtEs = await createTranslation(
    howDoYouDoPt.id,
    howDoYouDoEs.id
  )

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
