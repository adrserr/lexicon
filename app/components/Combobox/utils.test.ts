import { findAllAppearances } from './utils'

const strStartNoEnd =
  'Apple Bannana Apple Application Appearances Other thing approximations approachability'
const strEndNoStart =
  'Bannana Apple Application Appearances Other thing approximations approachability app'
const strStartEnd =
  'Apple Bannana Apple Application Appearances Other thing approximations approachability app'
const strNoStartNoEnd =
  'Bannana Apple Application Appearances Other thing approximations approachability'

const strNoMatch = 'No Match'

const search = 'app'
const searchCapitalize = 'APP'

const join = (result: ReturnType<typeof findAllAppearances>) =>
  result.reduce((prev, cur) => prev + cur.text, '')

const mathcSearch = (value: string, search: string) => {
  return new RegExp(search, 'gi').test(value)
}

test('findAllAppearences should return same input string divided', () => {
  expect(join(findAllAppearances(strEndNoStart, search))).toEqual(strEndNoStart)
  expect(join(findAllAppearances(strStartNoEnd, search))).toEqual(strStartNoEnd)
  expect(join(findAllAppearances(strNoStartNoEnd, search))).toEqual(
    strNoStartNoEnd
  )
  expect(join(findAllAppearances(strStartEnd, search))).toEqual(strStartEnd)

  // Capitalize search
  expect(join(findAllAppearances(strEndNoStart, searchCapitalize))).toEqual(
    strEndNoStart
  )
  expect(join(findAllAppearances(strStartNoEnd, searchCapitalize))).toEqual(
    strStartNoEnd
  )
  expect(join(findAllAppearances(strNoStartNoEnd, searchCapitalize))).toEqual(
    strNoStartNoEnd
  )
  expect(join(findAllAppearances(strStartEnd, searchCapitalize))).toEqual(
    strStartEnd
  )
  expect(join(findAllAppearances(strEndNoStart, 'ban'))).toEqual(strEndNoStart)
})

test('findAllAppearences should mark as highlight matching strings', () => {
  findAllAppearances(strStartEnd, search).forEach((el) => {
    expect(mathcSearch(el.text, search)).toEqual(el.highlight)
  })
  findAllAppearances(strNoStartNoEnd, search).forEach((el) => {
    expect(mathcSearch(el.text, search)).toEqual(el.highlight)
  })
  findAllAppearances(strStartNoEnd, search).forEach((el) => {
    expect(mathcSearch(el.text, search)).toEqual(el.highlight)
  })
  findAllAppearances(strEndNoStart, search).forEach((el) => {
    expect(mathcSearch(el.text, search)).toEqual(el.highlight)
  })

  // Capitalize
  findAllAppearances(strStartEnd, searchCapitalize).forEach((el) => {
    expect(mathcSearch(el.text, searchCapitalize)).toEqual(el.highlight)
  })
  findAllAppearances(strNoStartNoEnd, searchCapitalize).forEach((el) => {
    expect(mathcSearch(el.text, searchCapitalize)).toEqual(el.highlight)
  })
  findAllAppearances(strStartNoEnd, searchCapitalize).forEach((el) => {
    expect(mathcSearch(el.text, searchCapitalize)).toEqual(el.highlight)
  })
  findAllAppearances(strEndNoStart, searchCapitalize).forEach((el) => {
    expect(mathcSearch(el.text, searchCapitalize)).toEqual(el.highlight)
  })
})

test('findAllAppearances should return object when there is no match', () => {
  expect(findAllAppearances(strNoMatch, search)).toEqual<
    ReturnType<typeof findAllAppearances>
  >([{ text: strNoMatch, highlight: false }])
})
