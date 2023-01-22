import type { LoaderArgs, MetaFunction } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { requireUserId } from '../../session.server'
import { getLanguages } from '~/models/language.server'
import { Link, Outlet, useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)

  const languages = await getLanguages(userId)

  return json({ languages })
}

export const meta: MetaFunction<typeof loader> = () => {
  return {
    title: `Languages - Lexicon`,
  }
}

export default function Languages() {
  const { languages } = useLoaderData<typeof loader>()
  return (
    <>
      <h3
        data-testid="languages-header"
        className="pb-4 font-basement text-2xl font-bold capitalize"
      >
        Languages
        <Link
          to="new"
          data-testid="add-language"
          className="mx-2 rounded bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 hover:bg-blue-300"
        >
          add
        </Link>
      </h3>
      <div className="grid sm:grid-cols-[auto_1fr]">
        <ul>
          {languages.map((el) => (
            <li
              className="py-2 px-3 hover:rounded hover:bg-blue-100 active:bg-blue-200"
              key={el.id}
            >
              <Link data-testid={`${el.name}-link`} to={el.id}>
                {el.name}
              </Link>
            </li>
          ))}
        </ul>
        <Outlet />
      </div>
    </>
  )
}
