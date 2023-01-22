import type { Password, User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { error } from 'console'

import { prisma } from '~/db.server'

export type { User } from '@prisma/client'

/**
 * Get user by id
 * @param id user id
 * @returns
 */
export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } })
}

/**
 * Get user by email
 * @param email user email
 * @returns
 */
export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } })
}

/**
 * Create a new user
 * @param email email
 * @param password password of at leasth 8 characters length
 * @param name user name
 * @param surname user surname
 * @returns
 */
export async function createUser(
  email: User['email'],
  password: string,
  name: string,
  surname: string
) {
  const hashedPassword = await bcrypt.hash(password, 10)

  return prisma.user.create({
    data: {
      name,
      surname,
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })
}

/**
 * Delete user by email
 * @param email
 * @returns
 */
export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } })
}

/**
 * Verify if a user with this email and password exists
 * @param email
 * @param password
 * @returns
 */
export async function verifyLogin(
  email: User['email'],
  password: Password['hash']
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  return userWithoutPassword
}

/**
 * Change current password
 * @param oldPassword original password
 * @param newPassword new password
 * @param newPasswordRepetition repeated new password
 * @param email user email
 * @returns
 */
export async function changePassword(
  oldPassword: Password['hash'],
  newPassword: string,
  newPasswordRepetition: string,
  email: User['email']
) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { password: true },
  })

  if (!user || !user.password) return null

  const isValid = await bcrypt.compare(oldPassword, user?.password?.hash)

  const areEqual = newPassword === newPasswordRepetition

  if (!isValid) throw error("Old password doesn't match")
  if (!areEqual) throw error("New passwords doesn't match")

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  return prisma.password.update({
    where: { userId: user.id },
    data: { hash: hashedPassword },
  })
}

/**
 * Update user name, surname and email
 * @param user user info
 * @param userId user id
 * @returns
 */
export async function updateUserInfo(
  user: Pick<User, 'name' | 'surname' | 'email'>,
  userId: User['id']
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...user,
    },
  })
}
