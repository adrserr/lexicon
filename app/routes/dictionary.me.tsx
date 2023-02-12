import { Prisma } from '@prisma/client'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import type {
  ActionArgs,
  LoaderArgs,
  MetaFunction,
} from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { changePassword, updateUserInfo } from '~/models/user.server'
import { requireUser } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request)
  return json({ user })
}

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const intent = formData.get('intent')

  if (intent === 'password') {
    const pass = formData.get('password') as string
    const newPass = formData.get('newPassword') as string
    const repeatNewPass = formData.get('repeatNewPassword') as string

    if (newPass.length < 8) {
      return json(
        {
          errors: {
            email: '',
            password: 'Password is too short',
          },
        },
        { status: 400 }
      )
    }

    const result = await changePassword(
      pass,
      newPass,
      repeatNewPass,
      user.email
    )

    if (!result) {
      return json(
        {
          errors: {
            email: '',
            password: 'Password not changed',
          },
        },
        { status: 400 }
      )
    }
  }

  if (intent === 'info') {
    const name = formData.get('name') as string
    const surname = formData.get('surname') as string
    const email = formData.get('email') as string
    try {
      await updateUserInfo({ email, name, surname }, user.id)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (error.code === 'P2002') {
          console.log(
            'There is a unique constraint violation, that user email is already in use'
          )
          return json(
            {
              errors: {
                password: '',
                email: 'The email you entered is already in use',
              },
            },
            { status: 400 }
          )
        }
      }
    }
  }

  return json({
    errors: {
      email: '',
      password: '',
    },
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: `Profile - ${data.user.name} ${data.user.surname}`,
  }
}

export default function Me() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  return (
    <>
      <h1 className="font-basement text-xl">Profile</h1>
      <div className="grid h-full w-full justify-center font-inter">
        <div className="w-full max-w-md">
          <Form
            method="put"
            className="mb-3 space-y-6 font-inter"
            data-testid="user-info-form"
          >
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              required
              type="text"
              name="name"
              id="name"
              defaultValue={user.name}
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-700"
            >
              Surname
            </label>
            <input
              required
              type="text"
              name="surname"
              id="surname"
              defaultValue={user.surname}
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              required
              type="email"
              name="email"
              id="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              defaultValue={user.email}
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            {actionData?.errors?.email && (
              <div className="pt-1 text-red-700" id="password-error">
                {actionData.errors.email}
              </div>
            )}
            <button
              className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              type="submit"
              name="intent"
              value="info"
            >
              Save Changes
            </button>
          </Form>
          <Form
            method="put"
            className="mb-3 space-y-6 font-inter"
            data-testid="password-change-form"
          >
            <h4 className="font-inter text-lg font-semibold">
              Change password
            </h4>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              required
              type="password"
              name="password"
              id="password"
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              required
              type="password"
              name="newPassword"
              id="newPassword"
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            <label
              htmlFor="repeatNewPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Repeat New Password
            </label>
            <input
              required
              type="password"
              name="repeatNewPassword"
              id="repeatNewPassword"
              className="w-full border-b border-gray-500 bg-transparent px-2 py-1 text-lg focus-visible:border-blue-700 focus-visible:outline-none"
            />
            {actionData?.errors?.password && (
              <div className="pt-1 text-red-700" id="password-error">
                {actionData.errors.password}
              </div>
            )}
            <button
              className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
              type="submit"
              name="intent"
              data-testid="pass-form-submit"
              value="password"
            >
              Save New Password
            </button>
          </Form>
        </div>
      </div>
    </>
  )
}
