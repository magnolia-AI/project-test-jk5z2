'use client'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [paddleY, setPaddleY] = useState(250)
  const [ballX, setBallX] = useState(400)
  const [ballY, setBallY] = useState(300)
  const [ballSpeedX, setBallSpeedX] = useState(-5)
  const [ballSpeedY, setBallSpeedY] = useState(3)
  const [computerPaddleY, setComputerPaddleY] = useState(250)
  const [score, setScore] = useState({ player: 0, computer: 0 })
  const paddleWidth = 10
  const paddleHeight = 100
  const ballSize = 10
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && paddleY > 0) {
        setPaddleY(prev => Math.max(prev - 20, 0))
      }
      if (e.key === 'ArrowDown' && paddleY < 500) {
        setPaddleY(prev => Math.min(prev + 20, 500))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paddleY])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const gameLoop = setInterval(() => {
      // Clear canvas
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, 800, 600)
      // Draw paddles
      ctx.fillStyle = 'white'
      ctx.fillRect(50, paddleY, paddleWidth, paddleHeight)
      ctx.fillRect(740, computerPaddleY, paddleWidth, paddleHeight)
      // Draw ball
      ctx.fillRect(ballX, ballY, ballSize, ballSize)
      // Draw score
      ctx.font = '30px Arial'
      ctx.fillText(score.player.toString(), 300, 50)
      ctx.fillText(score.computer.toString(), 500, 50)
      // Move ball
      setBallX(prev => prev + ballSpeedX)
      setBallY(prev => prev + ballSpeedY)
      // Ball collision with top and bottom
      if (ballY <= 0 || ballY >= 590) {
        setBallSpeedY(prev => -prev)
      }
      // Ball collision with paddles
      if (
        ballX <= 60 && 
        ballY >= paddleY && 
        ballY <= paddleY + paddleHeight
      ) {
        setBallSpeedX(prev => -prev)
      }
      if (
        ballX >= 730 && 
        ballY >= computerPaddleY && 
        ballY <= computerPaddleY + paddleHeight
      ) {
        setBallSpeedX(prev => -prev)
      }
      // Computer paddle movement
      setComputerPaddleY(prev => {
        if (ballY > prev + paddleHeight / 2) {
          return Math.min(prev + 5, 500)
        }
        if (ballY < prev + paddleHeight / 2) {
          return Math.max(prev - 5, 0)
        }
        return prev
      })
      // Score points
      if (ballX <= 0) {
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }))
        setBallX(400)
        setBallY(300)
      }
      if (ballX >= 800) {
        setScore(prev => ({ ...prev, player: prev.player + 1 }))
        setBallX(400)
        setBallY(300)
      }
    }, 1000 / 60)
    return () => clearInterval(gameLoop)
  }, [ballX, ballY, ballSpeedX, ballSpeedY, paddleY, computerPaddleY, score])
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-zinc-900 to-black">
      <Card className="p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Pong Game</h1>
        <p className="text-center mb-4">Use ↑ and ↓ arrow keys to move your paddle</p>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-600"
        />
      </Card>
    </main>
  )
}