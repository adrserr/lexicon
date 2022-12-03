import React from 'react'
import ReactDOM from 'react-dom'

interface PortalProps {
  container?: Element
  children?: React.ReactNode
}

const Portal = (props: PortalProps) => {
  return props.container
    ? ReactDOM.createPortal(props.children, props.container)
    : null
}

const usePortal = (container?: Element) => {
  const [portalContainer, setPortalContainer] = React.useState(container)

  React.useEffect(() => {
    let portal: any
    if (!container) {
      portal = document.createElement('div')
      portal.id = 'portal'
      document.body.appendChild(portal)
      setPortalContainer(portal)
    }
    return () => {
      if (portal) document.body.removeChild(portal)
    }
  }, [container])

  return React.useCallback(
    function HookPortal(props: Omit<PortalProps, 'container'>) {
      return <Portal container={portalContainer} {...props}></Portal>
    },
    [portalContainer]
  )
}

export { usePortal, Portal }
