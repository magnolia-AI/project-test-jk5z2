'use client'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [paddleY, setPaddleY] = useState(250)
  const [ballX, setBallX] = useState(400)
  const [ballY, setBallY] = useState(300)
  const [ballSpeedX, setBallSpeedX] = useState(-7)
  const [ballSpeedY, setBallSpeedY] = useState(3)
  const [computerPaddleY, setComputerPaddleY] = useState(250)
  const [score, setScore] = useState({ player: 0, computer: 0 })
  const [keysPressed, setKeysPressed] = useState<{ [key: string]: boolean }>({})
  const paddleWidth = 10
  const paddleHeight = 100
  const ballSize = 10
  const paddleSpeed = 8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed(keys => ({ ...keys, [e.key]: true }))
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(keys => ({ ...keys, [e.key]: false }))
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  // Smooth paddle movement
  useEffect(() => {
    const movePaddle = () => {
      if (keysPressed['ArrowUp']) {
        setPaddleY(prev => Math.max(prev - paddleSpeed, 0))
      }
      if (keysPressed['ArrowDown']) {
        setPaddleY(prev => Math.min(prev + paddleSpeed, 500))
      }
      requestAnimationFrame(movePaddle)
    }
    const animationId = requestAnimationFrame(movePaddle)
    return () => cancelAnimationFrame(animationId)
  }, [keysPressed])
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
        // Calculate angle based on where ball hits the paddle
        const relativeIntersectY = (paddleY + (paddleHeight / 2)) - ballY
        const normalizedIntersectY = relativeIntersectY / (paddleHeight / 2)
        const bounceAngle = normalizedIntersectY * 0.75
                setBallSpeedX(prev => Math.abs(prev) + 0.5) // Increase speed slightly
        setBallSpeedY(prev => -7 * bounceAngle) // Angle based on hit position
      }
      if (
        ballX >= 730 && 
        ballY >= computerPaddleY && 
        ballY <= computerPaddleY + paddleHeight
      ) {
        // Similar angle calculation for computer paddle
        const relativeIntersectY = (computerPaddleY + (paddleHeight / 2)) - ballY
        const normalizedIntersectY = relativeIntersectY / (paddleHeight / 2)
        const bounceAngle = normalizedIntersectY * 0.75
                setBallSpeedX(prev => -(Math.abs(prev) + 0.5))
        setBallSpeedY(prev => -7 * bounceAngle)
      }
      // Improved computer AI
      const computerSpeed = 6
      const paddleCenter = computerPaddleY + paddleHeight / 2
      const ballPrediction = ballY + (ballSpeedY * (740 - ballX) / ballSpeedX)
            setComputerPaddleY(prev => {
        if (paddleCenter < ballPrediction - 10) {
          return Math.min(prev + computerSpeed, 500)
        }
        if (paddleCenter > ballPrediction + 10) {
          return Math.max(prev - computerSpeed, 0)
        }
        return prev
      })
      // Score points and reset ball
      if (ballX <= 0) {
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }))
        setBallX(400)
        setBallY(300)
        setBallSpeedX(-7)
        setBallSpeedY(3)
      }
      if (ballX >= 800) {
        setScore(prev => ({ ...prev, player: prev.player + 1 }))
        setBallX(400)
        setBallY(300)
        setBallSpeedX(7)
        setBallSpeedY(3)
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