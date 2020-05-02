import * as React from 'react'

interface AppearExitAnimatorProps {
  children: React.ReactNode
}

const onlyElement = (children: React.ReactNode) => {
  const filtered: React.ReactElement[] = []

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      filtered.push(child)
    }
  })

  return filtered
}

export const AppearExitAnimator = ({ children }: AppearExitAnimatorProps) => {
  const cache = React.useRef(new Map<string, React.ReactElement>()).current

  const filteredChildren = onlyElement(children)

  if (!children) return

  React.Children.forEach(filteredChildren, (child) => {
    console.log(filteredChildren)
  })

  return children
}
