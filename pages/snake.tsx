import type { NextPage } from 'next'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Snake.module.scss'

type Point = {
  x: number
  y: number
}

interface ISnake {
  direction: 'right' | 'left' | 'up' | 'down'
  body: Point[]
}

interface ICell extends Point {
  status: 'empty' | 'snake' | 'food'
}

type IRow = ICell[]
type IGrid = IRow[]

export const Grid = (size: number): IGrid => {
  const grid: IGrid = []
  for (let i = 0; i < size; i++) {
    const row: IRow = [] 
    for(let j = 0; j < size; j++) {
      row[j] = {
        status: 'empty',
        y: i,
        x: j,
      }
    }
    grid[i] = row;
  }
  return grid;
}

export const CellBox: React.FC<ICell> = ({status}) => {
  return (
    <div className={`${styles.cell} ${styles[`cell--${status}`]}`}></div>
  )
}

export const CellRow: React.FC<{row: IRow}> = ({row}) => {
  return (
    <div className={styles['snake__row']}>
      {
        row.map((cell: ICell) => (<CellBox key={`${cell.x}${cell.y}`} {...cell}/>))
      }
    </div>
  )
}

export const drawPoint = (grid: IGrid, cell: ICell) => {
  return grid.map((row, index) => {
    if (index === cell.y) {
      row.map((c, index) => {
        if(index === cell.x) {
          c.status = cell.status;
        }
        return c;
      })
    }
    return row
  })
}

export const putRandomFood = (grid: IGrid) => {
  const r1 = Math.floor(Math.random() * grid.length)
  const r2 = Math.floor(Math.random() * grid.length)
  const newGrid = [...grid]
  if(grid[r1][r2].status !== 'snake') {
    newGrid[r1][r2].status = 'food'
  } else {
    putRandomFood(grid)
  }

  return newGrid
}


export const cleanSnakeTrack = (grid: IGrid) => {
  return grid.map(row => row.map(cell => {
    if (cell.status === 'snake') {
      cell.status = 'empty';
    }
    return cell;
  }))
}
// Move body of the snake
export const moveSnake = (snake: ISnake, mustGrow = false) => {
  let head = snake.body[0]
  let newHead = {status: 'snake', ...head};
  switch(snake.direction) {
    case 'up':
      newHead.y = head.y - 1
      break;
    case 'down':
      newHead.y = head.y + 1
      break;
    case 'right':
      newHead.x = head.x + 1
      break;
    case 'left':
      newHead.x = head.x - 1
  }
  console.log([newHead, ...snake.body]) 
  return {...snake, body: [newHead, ...snake.body]}
}

export const Snake: NextPage = () => {
  const [grid, setGrid] = useState(Grid(32));
  const [snake, setSnake] = useState<ISnake>({
      direction: 'left',
      body: [
        {x: 16, y: 16},
        {x: 17, y: 16},
        {x: 18, y: 16},
      ]
    })
  const move = () => {
    setSnake(snake => moveSnake(snake))
  }
  const setDirection = (direction: 'right' | 'left' | 'up' | 'down') => {
    console.log(direction)
    setSnake((snake: ISnake) => ({...snake, direction} as any))
  }
  useEffect(() => {
    putRandomFood(grid)
  }, [])
  useEffect(() => {
    cleanSnakeTrack(grid)
    snake.body.map((cell) => {
      setGrid((grid) => drawPoint(grid, {status: 'snake', ...cell}))
    })
  }, [snake])
  return (
    <div className={styles.snake}>
      <Head>
        <title>Snake - Ridnois</title>
      </Head>
      <p>Snake</p>
      <button onClick={move}>Move Snake</button>
      <button onClick={() => setDirection('up')}>Up</button>
      <button onClick={() => setDirection('down')}>Down</button>
      <button onClick={() => setDirection('left')}>Left</button>
      <button onClick={() => setDirection('right')}>Right</button>
      <div className={styles['snake__container']}>
        {
          grid.map((row, index) => (<CellRow key={index} row={row}/>))
        }
      </div>
    </div>
  )
}

export default Snake
