import rough from 'roughjs/bin/rough'
import { BLOCK, WIDTH, HEIGHT } from './constants.js'

export default function createLayer (mount, style) {
  const el = document.createElement('canvas')
  el.style.position = 'absolute'
  el.style.left = `${BLOCK}px`
  el.style.top = `${BLOCK}px`
  el.width = WIDTH
  el.height = HEIGHT
  mount.append(el)

  return { el, draw }

  function draw (coordinates, overrideStyle) {
    el.getContext('2d').clearRect(0, 0, WIDTH, HEIGHT)
    coordinates = coordinates.map(({ x, y }) => [x * BLOCK, y * BLOCK])
    rough.canvas(el).polygon(coordinates, { ...style, ...overrideStyle })
  }
}
