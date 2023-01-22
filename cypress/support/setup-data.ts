/* eslint-disable @typescript-eslint/no-unused-vars */
import type { User, Language, Word, Definition } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'
import { prisma } from '../../app/db.server'

import { installGlobals } from '@remix-run/node'
import { createUserSession } from '../../app/session.server'
import { parse } from 'cookie'

installGlobals()

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
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

async function seed(email: string, login: 'true' | 'false' = 'false') {
  // My test user
  const hashedPassword = await bcrypt.hash('12345678', 10)

  const user = await prisma.user.create({
    data: {
      name: 'John',
      surname: 'Doe',
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  if (login === 'true') {
    const response = await createUserSession({
      request: new Request('test://test'),
      userId: user.id,
      remember: false,
      redirectTo: '/',
    })

    const cookieValue = response.headers.get('Set-Cookie')
    if (!cookieValue) {
      throw new Error('Cookie missing from createUserSession response')
    }
    const parsedCookie = parse(cookieValue)
    // we log it like this so our cypress command can parse it out and set it as
    // the cookie value.
    console.log(
      `
  <cookie>
    ${parsedCookie.__session}
  </cookie>
    `.trim()
    )
  }

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

// Use this to delete a user by their email
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts username@example.com
// and that user will get deleted

async function setupData(email: string, login: 'true' | 'false') {
  try {
    await seed(email, login)
  } catch (error) {
    console.log('ERROR______________', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupData(process.argv[2], process.argv[3] as 'true' | 'false')
