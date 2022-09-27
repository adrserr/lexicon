import type { User, Word } from '@prisma/client'
import { prisma } from '~/db.server'

export type { Note } from '@prisma/client'

export function getAllUserWords(userId: User['id']) {
  return prisma.word.findMany({
    select: { id: true, text: true, languageId: true },
    orderBy: { text: 'desc' },
    where: { userId },
  })
}

export function searchUserWords(user: User['id'], value: string) {
  return prisma.word.findMany({
    select: { id: true, text: true },
    where: { text: { contains: value } },
  })
}
