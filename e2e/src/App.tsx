import React, { useState } from 'react'
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

  console.log('render')

  useFlip(todoItemsId)

  return (
    <div className="container">
      <div className="named-list">
        <h2>TODO</h2>
        <ul data-flip-root-id={todoItemsId} className="list">
          <AnimateInOut in={fadeIn} out={fadeOut}>
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
          <AnimateInOut in={fadeIn} out={fadeOut}>
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
