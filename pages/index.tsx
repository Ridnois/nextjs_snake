import type { NextPage } from 'next'
import React, { useState, useEffect, KeyboardEventHandler } from 'react'
import Head from 'next/head'
import styles from '../styles/Snake.module.scss'

type Point = {
  x: number
  y: number
  status: 'empty' | 'snake' | 'food'
}

interface ISnake {
  direction: 'right' | 'left' | 'up' | 'down'
  body: Point[]
}

type IRow = Point[]
type IGrid = IRow[]

export const Grid = (size: number): IGrid => {
  const grid: IGrid = []
  for (let i = 0; i < size; i++) {
    const row: IRow = []
    for (let j = 0; j < size; j++) {
      row[j] = {
        status: 'empty',
        y: i,
        x: j,
      }
    }
    grid[i] = row
  }
  return grid
}

export const CellBox: React.FC<Point> = ({ status }) => {
  return <div className={`${styles.cell} ${styles[`cell--${status}`]}`}></div>
}

export const CellRow: React.FC<{ row: IRow }> = ({ row }) => {
  return (
    <div className={styles['snake__row']}>
      {row.map((cell: Point) => (
        <CellBox key={`${cell.x}${cell.y}`} {...cell} />
      ))}
    </div>
  )
}

export const drawPoint = (grid: IGrid, cell: Point) => {
  return grid.map((row, index) => {
    if (index === cell.y) {
      row.map((c, index) => {
        if (index === cell.x) {
          c.status = cell.status
        }
        return c
      })
    }
    return row
  })
}

export const putRandomFood = (grid: IGrid) => {
  const r1 = Math.floor(Math.random() * grid.length)
  const r2 = Math.floor(Math.random() * grid.length)
  const newGrid = [...grid]
  if (grid[r1][r2].status !== 'snake') {
    newGrid[r1][r2].status = 'food'
  } else {
    putRandomFood(grid)
  }

  return newGrid
}

export const cleanSnakeTrack = (grid: IGrid) => {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.status === 'snake') {
        cell.status = 'empty'
      }
      return cell
    })
  )
}

export const nextHead = (snake: ISnake) => {
  const newHead = { ...snake.body[0] }
  switch (snake.direction) {
    case 'left':
      newHead.x -= 1
      break
    case 'right':
      newHead.x += 1
      break
    case 'up':
      newHead.y -= 1
      break
    case 'down':
      newHead.y += 1
      break
  }
  return newHead
}

// Move body of the snake
export const moveSnake = (snake: ISnake, mustGrow = false) => {
  const [head, ...body] = [...snake.body]
  let newHead = nextHead(snake)
  const newBody = [newHead, head, ...body]

  if (!mustGrow) {
    newBody.pop()
  }
  return { ...snake, body: newBody }
}

export const Snake: NextPage = () => {
  const [grid, setGrid] = useState(Grid(32))
  const [dead, setDead] = useState(false)
  const [snake, setSnake] = useState<ISnake>({
    direction: 'left',
    body: [
      { status: 'snake', x: 16, y: 16 },
      { status: 'snake', x: 17, y: 16 },
      { status: 'snake', x: 18, y: 16 },
    ],
  })

  const control: KeyboardEventHandler<HTMLDivElement> = (e) => {
    console.log('foo')
    switch (e.code) {
      case 'ArrowLeft':
        setDirection('left')
        break
      case 'ArrowRight':
        setDirection('right')
        break
      case 'ArrowUp':
        setDirection('up')
        break
      case 'ArrowDown':
        setDirection('down')
        break
      case 'Space':
        move()
        break
      default:
        return
    }
  }

  const move = () => {
    const { x, y } = nextHead(snake)
    const nextCell: any = grid[y][x] ?? false
    if (!nextCell && nextCell?.status !== 'snake') {
      setDead(true)
      return
    }
    setSnake((snake) => moveSnake(snake, nextCell.status === 'food'))
  }

  const setDirection = (direction: 'right' | 'left' | 'up' | 'down') => {
    setSnake((snake: ISnake) => ({ ...snake, direction }))
  }

  useEffect(() => {
    putRandomFood(grid)
  }, [snake.body.length])

  useEffect(() => {
    cleanSnakeTrack(grid)
    snake.body.map((cell) => {
      setGrid((grid) => drawPoint(grid, { ...cell }))
    })
  }, [snake])

  return (
    <div className={styles.snake} onKeyDown={(e) => control(e)} tabIndex={0}>
      <Head>
        <title>Snake - Ridnois</title>
      </Head>
      <p>Snake: {dead ? 'dead' : 'alive'}</p>
      <button onClick={move}>Move Snake</button>
      <button onClick={() => setDirection('up')}>Up</button>
      <button onClick={() => setDirection('down')}>Down</button>
      <button onClick={() => setDirection('left')}>Left</button>
      <button onClick={() => setDirection('right')}>Right</button>
      <div className={styles['snake__container']}>
        {grid.map((row, index) => (
          <CellRow key={index} row={row} />
        ))}
      </div>
    </div>
  )
}

export default Snake
