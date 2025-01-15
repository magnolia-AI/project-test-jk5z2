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
  const paddleWidth = 12
  const paddleHeight = 80
  const ballSize = 8
  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      setPaddleY(prev => {
        const newPosition = mouseY - paddleHeight / 2
        return Math.max(0, Math.min(600 - paddleHeight, newPosition))
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Function to draw retro-style rectangle
    const drawRetroRect = (x: number, y: number, width: number, height: number, color: string) => {
      ctx.fillStyle = color
      ctx.fillRect(Math.floor(x), Math.floor(y), width, height)
      // Add scanline effect
      for (let i = Math.floor(y); i < Math.floor(y) + height; i += 4) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.fillRect(Math.floor(x), i, width, 2)
      }
    }
    // Function to draw dotted center line
    const drawCenterLine = () => {
      const lineWidth = 4
      const segmentHeight = 20
      const gap = 15
      ctx.fillStyle = '#7FFF00'
      for (let y = 0; y < 600; y += segmentHeight + gap) {
        ctx.fillRect(398, y, lineWidth, segmentHeight)
      }
    }
    const gameLoop = setInterval(() => {
      // Clear canvas with dark background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, 800, 600)
      // Add CRT screen effect
      ctx.fillStyle = 'rgba(0, 255, 0, 0.03)'
      for (let i = 0; i < 600; i += 2) {
        ctx.fillRect(0, i, 800, 1)
      }
      // Draw center line
      drawCenterLine()
      // Draw paddles with retro green color
      drawRetroRect(50, paddleY, paddleWidth, paddleHeight, '#7FFF00')
      drawRetroRect(740, computerPaddleY, paddleWidth, paddleHeight, '#7FFF00')
      // Draw ball
      drawRetroRect(ballX, ballY, ballSize, ballSize, '#7FFF00')
      // Draw score with retro font
      ctx.font = 'bold 40px "Press Start 2P", monospace'
      ctx.fillStyle = '#7FFF00'
      ctx.fillText(score.player.toString(), 300, 60)
      ctx.fillText(score.computer.toString(), 460, 60)
      // Add screen glare effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.fillRect(0, 0, 800, 600)
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
        const relativeIntersectY = (paddleY + (paddleHeight / 2)) - ballY
        const normalizedIntersectY = relativeIntersectY / (paddleHeight / 2)
        const bounceAngle = normalizedIntersectY * 0.75
        setBallSpeedX(prev => Math.abs(prev) + 0.5)
        setBallSpeedY(prev => -7 * bounceAngle)
      }
      if (
        ballX >= 730 && 
        ballY >= computerPaddleY && 
        ballY <= computerPaddleY + paddleHeight
      ) {
        const relativeIntersectY = (computerPaddleY + (paddleHeight / 2)) - ballY
        const normalizedIntersectY = relativeIntersectY / (paddleHeight / 2)
        const bounceAngle = normalizedIntersectY * 0.75
        setBallSpeedX(prev => -(Math.abs(prev) + 0.5))
        setBallSpeedY(prev => -7 * bounceAngle)
      }
      // Computer AI
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
      // Score points
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
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black">
      <Card className="p-4 bg-black border-green-500 border-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-500 font-mono">PONG</h1>
        <p className="text-center mb-4 text-green-400 font-mono">Move mouse to control paddle</p>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="border-2 border-green-500 rounded-sm"
            style={{ 
              cursor: 'none',
              boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(rgba(0, 255, 0, 0.03) 50%, transparent 50%)',
            backgroundSize: '100% 4px',
          }}></div>
        </div>
      </Card>
    </main>
  )
}