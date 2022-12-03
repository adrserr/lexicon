import React, { useCallback, useState } from 'react'
import { usePortal } from '~/components'
import {
  composeEventHandlers,
  findAllAppearances,
  makeHash,
  useComposeRefs,
} from './utils'

// Combobox context
interface ComboboxContextType {
  inputRef: React.RefObject<HTMLInputElement>
  dropdownRef: React.RefObject<HTMLElement>
  dropdownOpen: boolean
  closeDropdown: () => void
  openDropdown: () => void
  activeDescendant: OptionProps['value']
  setActiveDescendant: React.Dispatch<
    React.SetStateAction<OptionProps['value']>
  >
  inputValue: React.ComponentProps<typeof Combobox.Input>['value']
  setInputValue: React.Dispatch<
    React.ComponentProps<typeof Combobox.Input>['value']
  >
  id: string
}

const ComboboxContext = React.createContext<
  ComboboxContextType | Record<string, never>
>({})

function useComboboxContext() {
  const context = React.useContext(ComboboxContext)
  if (context === undefined) {
    throw new Error('useCombobox must be used within ComboboxProvider')
  }
  return context
}

// Combobox
type ComboboxType = ReturnType<
  typeof React.forwardRef<HTMLDivElement, ComboboxProps>
> & {
  Input: typeof Input
  Label: typeof Label
  Dropdown: typeof Dropdown
  List: typeof List
  Option: typeof Option
  OptionText: typeof OptionText
}

interface ComboboxProps extends React.HTMLProps<HTMLDivElement> {}
const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ children, ...props }: ComboboxProps, forwardedRef) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const dropdownRef = React.useRef<HTMLElement>(null)
    const [dropdownOpen, setDropdownOpen] = React.useState(false)
    const [activeDescendant, setActiveDescendant] =
      React.useState<ComboboxContextType['activeDescendant']>()
    const reactId = React.useId()

    const id = props.id ? props.id : reactId

    const [inputValue, setInputValue] =
      React.useState<ComboboxContextType['inputValue']>()

    const closeDropdown = useCallback(() => setDropdownOpen(false), [])
    const openDropdown = useCallback(() => setDropdownOpen(true), [])
    const contextValue: ComboboxContextType = {
      inputRef,
      dropdownRef,
      dropdownOpen,
      closeDropdown,
      openDropdown,
      activeDescendant,
      setActiveDescendant,
      inputValue,
      setInputValue,
      id,
    }

    return (
      <ComboboxContext.Provider value={contextValue}>
        <div ref={forwardedRef} {...props}>
          {children}
        </div>
      </ComboboxContext.Provider>
    )
  }
) as ComboboxType

// Input
type InputProps = Omit<React.HTMLProps<HTMLInputElement>, 'type' | 'id'>
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, onFocus, onBlur, ...props }: InputProps, forwardedRef) => {
    const {
      inputRef,
      openDropdown,
      closeDropdown,
      dropdownOpen,
      setInputValue,
      id,
    } = useComboboxContext()
    const ref = useComposeRefs(inputRef, forwardedRef)

    const handleDropdownVisibility = () => {
      inputRef.current?.value ? openDropdown() : closeDropdown()
    }

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.target.value ? openDropdown() : closeDropdown()
      setInputValue(e.target.value)
    }

    return (
      <input
        type="text"
        ref={ref}
        {...props}
        autoComplete="off"
        aria-autocomplete="list"
        role="combobox"
        id={`input-${id}`}
        aria-controls={`list-${id}`}
        aria-haspopup="listbox"
        aria-label=""
        aria-labelledby=""
        aria-activedescendant={String(makeHash('Home'))}
        aria-expanded={dropdownOpen}
        onFocus={composeEventHandlers(onFocus, handleDropdownVisibility)}
        // onBlur={composeEventHandlers(onBlur, closeDropdown)}
        onChange={composeEventHandlers(onChange, handleOnChange)}
      />
    )
  }
)

// Label
interface LabelProps
  extends Omit<React.HTMLProps<HTMLLabelElement>, 'htmlFor' | 'id'> {
  /**
   * screen readers only, visually hidden
   */
  srOnly?: boolean
}
const Label = ({ srOnly = false, className, ...labelProps }: LabelProps) => {
  const { id } = useComboboxContext()
  return (
    <label
      htmlFor={`input-${id}`}
      id={`label-${id}`}
      className={`${className} ${srOnly ? 'sr-only' : ''}`}
      {...labelProps}
    >
      {labelProps.children}
    </label>
  )
}

// Dropdown
interface DropdownProps {
  children?: React.ReactNode
}
const Dropdown = React.forwardRef(
  ({ children }: DropdownProps, forwardedRef) => {
    const { dropdownOpen, dropdownRef, inputRef } = useComboboxContext()
    const Portal = usePortal()
    const ref = useComposeRefs(dropdownRef, forwardedRef)
    const [inputDOMRect, setInputDOMRect] = useState<DOMRect>()

    // Sync dropdown size and position with input
    React.useEffect(
      function syncDropdownSizeAndPosition() {
        const getInputMeasures = () =>
          setInputDOMRect(inputRef.current?.getBoundingClientRect())
        const resizeObserver = new ResizeObserver((entries) => {
          getInputMeasures()
        })
        if (inputRef.current) resizeObserver.observe(inputRef.current)
        window.addEventListener('resize', getInputMeasures)
        return () => {
          window.removeEventListener('resize', getInputMeasures)
          resizeObserver.disconnect()
        }
      },
      [inputRef]
    )

    if (!Portal || !dropdownOpen || !inputRef.current) return null

    return (
      <Portal>
        <div
          ref={ref}
          data-test-id="combobox-dropdown"
          style={{
            top: `${(inputDOMRect?.top || 0) + (inputDOMRect?.height || 0)}px`,
            left: `${inputDOMRect?.left}px`,
            width: `${inputDOMRect?.width}px`,
          }}
          tabIndex={-1}
          className={`absolute border bg-white`}
        >
          {children}
        </div>
      </Portal>
    )
  }
)

function hasChildren(children: React.ReactNode | React.ReactNode[]): boolean {
  if (Array.isArray(children) && children.length === 0) return false
  if (children !== undefined && children !== null) return true
  return false
}

// List
interface ListProps {
  children?: React.ReactNode | React.ReactNode[]
}
const List = React.forwardRef<HTMLUListElement, JSX.IntrinsicElements['ul']>(
  ({ children, ...props }: ListProps, forwardedRef) => {
    // const { listId } = useComboboxContext()
    return (
      <ul
        ref={forwardedRef}
        data-test-id="combobox-dropdown-list"
        role="listbox"
        // id={listId}
        {...props}
      >
        {children}
      </ul>
    )
  }
)

// Option Context
const OptionContext = React.createContext<{ value: OptionProps['value'] }>({
  value: undefined,
})

// Options
type OptionProps = JSX.IntrinsicElements['li']
const Option = React.forwardRef<HTMLLIElement, JSX.IntrinsicElements['li']>(
  ({ children, value, onClick, ...props }: OptionProps, forwardedRef) => {
    const { setInputValue, inputRef, closeDropdown } = useComboboxContext()
    return (
      <OptionContext.Provider value={{ value }}>
        <li
          role="option"
          tabIndex={-1}
          aria-selected="true" // TODO:
          onClick={composeEventHandlers(onClick, () => {
            closeDropdown()
            if (inputRef.current) inputRef.current.value = value as string
            setInputValue(value)
          })}
          id={String(makeHash(String(value)))}
          ref={forwardedRef}
          className="px-2 py-1 hover:bg-slate-200 focus:bg-red-200"
          {...props}
        >
          {hasChildren(children) ? children : value}
        </li>
      </OptionContext.Provider>
    )
  }
)

interface OptionTextProps {}
const OptionText = (props: OptionTextProps) => {
  const { inputValue } = useComboboxContext()
  const { value } = React.useContext(OptionContext)

  const results = React.useMemo(
    () => findAllAppearances(String(value), String(inputValue || '')),
    [inputValue, value]
  )

  return (
    <>
      {results.map((el, i) => (
        <span
          key={String(el.text + i)}
          className={el.highlight ? 'bg-blue-200 font-bold' : undefined}
        >
          {el.text}
        </span>
      ))}
    </>
  )
}

// Display names
Combobox.displayName = 'Combobox'
Input.displayName = 'ComboboxInput'
Dropdown.displayName = 'ComboboxDropdown'
List.displayName = 'ComboboxList'
Option.displayName = 'ComboboxOption'
OptionText.displayName = 'ComboboxOptionText'

// Add components to Combobox
Combobox.Input = Input
Combobox.Label = Label
Combobox.Dropdown = Dropdown
Combobox.List = List
Combobox.Option = Option
Combobox.OptionText = OptionText

export default Combobox

// function useKeyDown() {
//   const {} = useComboboxContext()

//   return function handleKeyDown(event: React.KeyboardEvent) {}
// }
