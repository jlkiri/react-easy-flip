import React, { useState, useRef } from 'react'
import { nanoid } from 'nanoid'
import {
  useFlip,
  FlipProvider,
  AnimateInOut,
  fadeOut,
  fadeIn
} from 'react-easy-flip'
import './App.css'

export { FlipProvider }

const TrashCan = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="white"
  >
    <path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z" />
  </svg>
)

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

  useFlip(todoItemsId, {
    duration: 500,
    stagger: 100
  })

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
  const isPaused = useRef(false)

  const todoItemsId = 'flip-todo-items'

  const { pause, resume } = useFlip(todoItemsId, {
    duration: 500,
    stagger: 300
  })

  return (
    <div className="container">
      <button
        onClick={() => {
          if (isPaused.current) {
            resume()
            isPaused.current = false
            return
          }
          pause()
          isPaused.current = true
        }}
      >
        Pause
      </button>
      <div className="named-list">
        <h2>TODO</h2>
        <ul data-flip-root-id={todoItemsId} className="list">
          <AnimateInOut itemAmount={todoItems.length}>
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
                    <TrashCan />
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
          <AnimateInOut itemAmount={todoItems.length}>
            {todoItems
              .filter((i) => i.done)
              .map((item, _) => (
                <li
                  data-flip-id={`flip-id-${item.id}`}
                  key={item.id}
                  style={{ backgroundColor: '#5209d5' }}
                  className="checked list-item"
                >
                  <button
                    onClick={() =>
                      setTodoItems(todoItems.filter((i) => i.id !== item.id))
                    }
                  >
                    <TrashCan />
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
