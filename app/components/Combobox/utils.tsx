import React from 'react'

type NullableRef<T> = React.Ref<T> | undefined

/**
 * Add a given value to a given ref
 * Takes into consideration callback refs and RefObjects
 */
function setRef<T>(ref: NullableRef<T>, value: T) {
  if (typeof ref === 'function') ref(value)
  if (ref !== null && ref !== undefined)
    (ref as React.MutableRefObject<T>).current = value
}

function composeRefs<T>(...refs: NullableRef<T>[]) {
  return (node: T) => refs.forEach((ref) => setRef(ref, node))
}

function useComposeRefs<T>(...refs: NullableRef<T>[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useCallback(composeRefs(...refs), refs)
}

// Compose event handlers
type EventHandler<EventType extends React.SyntheticEvent | Event> = (
  event: EventType
) => unknown

function composeEventHandlers<EventType extends React.SyntheticEvent | Event>(
  userHandler: EventHandler<EventType> | undefined,
  libHandler: EventHandler<EventType>
) {
  return (event: EventType) => {
    userHandler && userHandler(event)
    if (!event.defaultPrevented) return libHandler(event)
  }
}

/**
 * Escape regexp special characters in `str`
 *
 * @see https://github.com/component/escape-regexp/blob/5ce923c1510c9802b3da972c90b6861dd2829b6b/index.js
 * @param str
 */

function escapeRegexp(str: string) {
  return String(str).replace(/([.*+?=^!:${}()|[\]/\\])/g, '\\$1')
}

/**
 *
 */
function findAllAppearances(
  str: string,
  search: string
): Array<{ text: string; highlight: boolean }> {
  const regex = new RegExp(search, 'gi')
  const appearancesIndexes = [...str.matchAll(regex)].map((a) => a.index)

  if (appearancesIndexes.length === 0) return [{ text: str, highlight: false }]

  return appearancesIndexes.reduce((prev, current, i) => {
    if (i === 0 && current !== undefined && current !== 0) {
      prev.push({ text: str.slice(0, current), highlight: false })
    }

    if (
      current !== undefined &&
      current >= 0 &&
      current < str.length - search.length - 1 &&
      i < appearancesIndexes.length - 1
    ) {
      const coincidence = {
        text: str.slice(current, current + search.length),
        highlight: true,
      }
      prev.push(coincidence)
      if (i + 1 <= appearancesIndexes.length - 1)
        prev.push({
          text: str.slice(
            current + search.length,
            appearancesIndexes[i + 1] as number
          ),
          highlight: false,
        })
    }

    if (current !== undefined && i === appearancesIndexes.length - 1) {
      prev.push({
        text: str.slice(current, current + search.length),
        highlight: true,
      })
      if (current + search.length < str.length)
        prev.push({
          text: str.slice(current + search.length, str.length),
          highlight: false,
        })
    }
    return prev
  }, [] as Array<{ text: string; highlight: boolean }>)
}

/**
 * We don't want to track the active descendant with indexes because nothing is
 * more annoying in a combobox than having it change values RIGHT AS YOU HIT
 * ENTER. That only happens if you use the index as your data, rather than
 * *your data as your data*. We use this to generate a unique ID based on the
 * value of each item.  This function is short, sweet, and good enough™ (I also
 * don't know how it works, tbqh)
 *
 * @see https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
 * @param str
 */
function makeHash(str: string) {
  let hash = 0
  if (str.length === 0) {
    return hash
  }
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return hash
}

export {
  useComposeRefs,
  composeRefs,
  composeEventHandlers,
  escapeRegexp,
  findAllAppearances,
  makeHash,
}
