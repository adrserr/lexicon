import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  const email = 'adrserr@hotmail.com'
  const email2 = 'test@hotmail.com'

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  })

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

  const user2 = await prisma.user.create({
    data: {
      name: 'John',
      surname: 'Doe',
      email: email2,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  // Languages
  const english = await prisma.language.create({
    data: {
      code: 'en',
      name: 'English',
      userId: user.id,
    },
  })

  const spanish = await prisma.language.create({
    data: {
      code: 'es',
      name: 'Spanish',
      userId: user.id,
    },
  })

  await prisma.language.create({
    data: {
      code: 'es',
      name: 'Spanish',
      userId: user2.id,
    },
  })

  await prisma.note.create({
    data: {
      title: 'My first note',
      body: 'Hello, world!',
      userId: user.id,
    },
  })

  await prisma.note.create({
    data: {
      title: 'My second note',
      body: 'Hello, world!',
      userId: user.id,
    },
  })

  const hola = await prisma.word.create({
    data: {
      text: 'Hola',
      languageId: spanish.id,
      userId: user.id,
    },
  })

  const hello = await prisma.word.create({
    data: {
      text: 'Hello',
      languageId: english.id,
      userId: user.id,
    },
  })

  await prisma.translation.create({
    data: {
      wordAId: hello.id,
      wordBId: hola.id,
    },
  })

  await prisma.definition.create({
    data: {
      wordId: hola.id,
      definition: 'Expresión con que se saluda.',
      languageId: spanish.id,
    },
  })

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
