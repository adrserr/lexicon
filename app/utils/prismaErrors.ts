import { Prisma } from '@prisma/client'

/**
 * https://www.prisma.io/docs/reference/api-reference/error-reference#p2002
 * @param error unkown error
 * @returns true if Unique constraint failed
 */
export function isPrismaUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientUnknownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
    ? true
    : false
}
