import type { LoaderArgs } from '@remix-run/server-runtime'
import { getAllUserWords } from '../../models/words.server'
import { requireUserId } from '../../session.server'
import { Link, useLoaderData } from '@remix-run/react'
import { getLanguages } from '../../models/language.server'
import { json } from '@remix-run/server-runtime'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const words = await getAllUserWords(userId)

  const languages = await getLanguages(userId)
  return json({ words, languages })
}

export default function Words() {
  const { words, languages } = useLoaderData<typeof loader>()
  return (
    <div className="max-h-full">
      <h1 className="font-basement text-2xl">My Words</h1>
      <ul className="overflow-scroll">
        {words.map((el) => {
          const language = languages.find((lang) => lang.id === el.languageId)
          return (
            <li
              className="m-3 h-20  w-60 rounded bg-slate-50 p-6 font-inter text-lg capitalize shadow-lg"
              key={el.id}
            >
              {language ? (
                <Link to={`/dictionary/${language?.name}/${el.text}`}>
                  {el.text} - {language.name}
                </Link>
              ) : (
                `${el.text}`
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
