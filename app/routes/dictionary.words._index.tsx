import type { LoaderArgs } from '@remix-run/server-runtime'
import { getAllUserWords } from '../models/words.server'
import { requireUserId } from '../session.server'
import { Link, useLoaderData } from '@remix-run/react'
import { getLanguages } from '../models/language.server'
import { json } from '@remix-run/server-runtime'

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const words = await getAllUserWords(userId)

  const formattedWords = words
    .sort((a, b) => {
      if (a.text.toLocaleLowerCase() > b.text.toLocaleLowerCase()) return 1
      if (a.text.toLocaleLowerCase() < b.text.toLocaleLowerCase()) return -1
      // a must be equal to b
      return 0
    })
    .map((el) => ({ ...el, language: el.language.name }))

  return json({ words: formattedWords })
}

export default function Words() {
  const { words } = useLoaderData<typeof loader>()
  // const initialLetters = words
  //   .map((el) => el.text[0].toLowerCase())
  //   .filter((el, i, arr) => arr.indexOf(el) === i)

  console.log(words)
  return (
    <div className="max-h-full">
      <h1 className="font-basement text-2xl" data-testid="words-header">
        My Words
      </h1>
      <ul className="overflow-scroll" data-testid="words-list">
        {words.map((el, i, arr) => {
          return (
            <>
              {i <= arr.length - 1 &&
                el.text[0].toLocaleLowerCase() !==
                  arr[i + 1]?.text[0].toLocaleLowerCase() &&
                `${el.text[0].toUpperCase()}`}
              <li
                className="m-3 h-20  w-60 rounded bg-slate-50 p-6 font-inter text-lg capitalize shadow-lg"
                key={el.id}
                data-testid={el.text}
              >
                <Link
                  to={`/dictionary/${el.language}/${el.text}`}
                  className="hover:text-blue-700 hover:underline"
                >
                  {el.text} - {el.language}
                </Link>
              </li>
            </>
          )
        })}
      </ul>
    </div>
  )
}
