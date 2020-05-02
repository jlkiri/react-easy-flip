import React, {
  useState,
  useLayoutEffect,
  useRef,
  useContext,
  useReducer,
  useCallback
} from 'react'
import { nanoid } from 'nanoid'
import { useFlip, FlipContext, FlipProvider } from 'react-easy-flip'
import './App.css'

export { FlipProvider }

const fadeOut = { from: { opacity: 1 }, to: { opacity: 0 } }

/* const useLeaveAnimation = (animation: any) => {
  const forceRender = useContext(FlipContext)
  return {
    forceRender,
    animation
  }
} */

interface AppearExitAnimatorProps {
  children: React.ReactNode
  /* onLeave: ReturnType<typeof useLeaveAnimation> */
  animation: any
}

const getChildKey = (child: React.ReactElement) => {
  return `${child.key}` || ''
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

const AnimateLeave = (props: any) => {
  const ref = useRef<Element>()
  const cachedAnimation = useRef<Animation>()

  useLayoutEffect(() => {
    if (!ref.current) return

    if (
      document.querySelector(
        `[data-flip-id=${props.childProps['data-flip-id']}`
      )
    ) {
      return
    }

    const currAnimation = cachedAnimation.current

    if (currAnimation && currAnimation.playState === 'running') {
      currAnimation.finish()
      props.callback()
      return
    }

    const animation = ref.current.animate(
      [props.animation.from, props.animation.to],
      {
        duration: 1000,
        fill: 'both'
      }
    )

    animation.onfinish = () => {
      props.callback()
    }

    cachedAnimation.current = animation
  })

  return (
    <React.Fragment>
      {React.cloneElement(props.children, {
        ...props.childProps,
        'data-flip-id': undefined,
        ref
      })}
    </React.Fragment>
  )
}

export const AnimateInOut = ({
  children,
  animation
}: AppearExitAnimatorProps): any => {
  const cache = React.useRef(new Map<string, React.ReactElement>()).current
  const exiting = React.useRef(new Set<string>()).current
  const forceRender = useContext(FlipContext)

  const filteredChildren = onlyElement(children)

  const presentChildren = React.useRef(filteredChildren)

  React.Children.forEach(filteredChildren, (child) => {
    if (cache.get(getChildKey(child))) return

    cache.set(getChildKey(child), child)
  })

  const presentKeys = presentChildren.current.map(getChildKey)
  const targetKeys = filteredChildren.map(getChildKey)

  useLayoutEffect(() => {
    exiting.forEach((key) => {
      if (
        document.querySelector(
          `[data-flip-id=${cache.get(key)!.props[`data-flip-id`]}]`
        )
      ) {
        exiting.delete(key)

        const removeIndex = presentChildren.current.findIndex(
          (child) => child.key === key
        )

        presentChildren.current.splice(removeIndex, 1)

        if (exiting.size === 0) {
          presentChildren.current = filteredChildren
          forceRender()
        }
      }
    })
  })

  for (const key of presentKeys) {
    if (!targetKeys.includes(key)) {
      if (cache.get(key)) {
        exiting.add(key)
      }
    } else {
      // In case this key has re-entered, remove from the exiting list
      exiting.delete(key)
    }
  }

  let renderedChildren = [...filteredChildren]

  exiting.forEach((key) => {
    // If this component is actually entering again, early return
    if (targetKeys.indexOf(key) !== -1) return

    const child = cache.get(key)

    if (!child) return

    const removeFromCache = () => {
      // cache.delete(key)
      exiting.delete(key)

      const removeIndex = presentChildren.current.findIndex(
        (child) => child.key === key
      )

      presentChildren.current.splice(removeIndex, 1)

      if (exiting.size === 0) {
        presentChildren.current = filteredChildren
        forceRender()
      }
    }

    const index = presentKeys.indexOf(key)
    const currProps = child.props

    renderedChildren.splice(
      index,
      0,
      <AnimateLeave
        key={key}
        animation={animation}
        callback={removeFromCache}
        childProps={currProps}
      >
        {child}
      </AnimateLeave>
    )
  })

  presentChildren.current = renderedChildren

  return renderedChildren
}

const shuffle = function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const _items = Array(10)
  .fill(0)
  .map((_, i) => {
    const id = nanoid()
    return {
      id: id,
      isMarked: i === 0,
      text: `Item with id: ${id}`
    }
  })

const todos = [
  'Wash dishes',
  'Feed the cat',
  'Read a book',
  'Do laundry',
  'Learn Russian',
  'Cook pasta',
  'Buy coffee beans',
  'Do a quick workout',
  'Fix some bugs',
  'Buy fresh bread'
]

const _items2 = Array(10)
  .fill(0)
  .map((_, i) => {
    const id = nanoid()
    return {
      id: id,
      done: i === 0,
      nid: i + 1,
      text: todos[i]
    }
  })

function ShuffleApp() {
  const [todoItems, setTodoItems] = useState(_items)

  const todoItemsId = 'flip-todo-items'

  useFlip(todoItemsId)

  return (
    <div>
      <button onClick={() => setTodoItems(shuffle([...todoItems]))}>
        Shuffle
      </button>
      <ul data-flip-root-id={todoItemsId} className="list">
        {todoItems.map((item, _) => (
          <li
            data-flippable
            key={item.id}
            data-flip-id={`flip-id-${item.id}`}
            className="list-item"
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function TodoApp() {
  const [todoItems, setTodoItems] = useState(_items2)

  const todoItemsId = 'flip-todo-items'

  useFlip(todoItemsId)

  return (
    <div className="container">
      <div className="named-list">
        <h2>TODO</h2>
        <ul data-flip-root-id={todoItemsId} className="list">
          <AnimateInOut animation={fadeOut}>
            {todoItems
              .filter((i) => !i.done)
              .map((item, _) => (
                <li
                  data-flip-id={`flip-id-${item.id}`}
                  key={item.id}
                  className="list-item"
                >
                  <button
                    onClick={() =>
                      setTodoItems(todoItems.filter((i) => i.id !== item.id))
                    }
                  >
                    X
                  </button>
                  <label htmlFor={item.id}>
                    {item.text}
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={item.done}
                      onChange={() => {
                        setTodoItems(
                          [
                            ...todoItems.filter((i) => i.id !== item.id),
                            { ...item, done: true }
                          ].sort((a, b) => a.nid - b.nid)
                        )
                      }}
                    />
                  </label>
                </li>
              ))}
          </AnimateInOut>
        </ul>
      </div>

      <div className="named-list">
        <h2>DONE</h2>
        <ul data-flip-root-id={todoItemsId} className="list">
          <AnimateInOut animation={fadeOut}>
            {todoItems
              .filter((i) => i.done)
              .map((item, _) => (
                <li
                  data-flip-id={`flip-id-${item.id}`}
                  key={item.id}
                  className="checked list-item"
                >
                  <button
                    onClick={() =>
                      setTodoItems(todoItems.filter((i) => i.id !== item.id))
                    }
                  >
                    X
                  </button>
                  <label htmlFor={item.id}>
                    {item.text}
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={item.done}
                      onChange={() =>
                        setTodoItems(
                          [
                            ...todoItems.filter((i) => i.id !== item.id),
                            { ...item, done: false }
                          ].sort((a, b) => a.nid - b.nid)
                        )
                      }
                    />
                  </label>
                </li>
              ))}
          </AnimateInOut>
        </ul>
      </div>
    </div>
  )
}

export default TodoApp
