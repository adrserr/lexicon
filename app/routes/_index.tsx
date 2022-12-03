import { Link } from '@remix-run/react'
import { json, redirect } from '@remix-run/server-runtime'
import type { LoaderArgs } from '@remix-run/server-runtime'
import { getUserId } from '~/session.server'

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) return redirect('/dictionary')
  return json({})
}

export default function Index() {
  return (
    <main className="relative flex min-h-full items-center justify-center">
      <div className="grid">
        <h1 className="text-center font-basement text-5xl md:text-6xl lg:text-8xl">
          Lexicon
        </h1>
        <p className="text-center font-inter text-base font-extralight tracking-widest md:text-xl lg:text-3xl">
          Your digital glossary
        </p>
        <div className="mx-auto mt-5 max-w-sm sm:mt-10 sm:flex sm:max-w-none sm:justify-center">
          <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
            <Link
              to="/join"
              className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-yellow-700 shadow-sm hover:bg-yellow-50 sm:px-8"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
