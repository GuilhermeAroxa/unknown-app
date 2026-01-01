import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)
    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)

    // Resetar estado do jogo para nova rodada
    roomData.gamePhase = 'waiting'
    roomData.answers = []
    roomData.readyPlayers = []
    roomData.orders = []
    roomData.winner = null

    // Resetar roles para null (serão atribuídas ao iniciar)
    roomData.players.forEach((player: { role: string | null; number: number | null }) => {
      player.role = null
      player.number = null
    })

    await redis.set(roomKey, JSON.stringify(roomData))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}