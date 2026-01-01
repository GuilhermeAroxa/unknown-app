import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName } = await request.json()

    if (!roomId || !playerName) {
      return NextResponse.json({ error: 'Room ID and player name are required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)

    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)

    // Não permitir kick do host
    if (roomData.host === playerName) {
      return NextResponse.json({ error: 'Cannot kick host' }, { status: 400 })
    }

    // Só permitir kick antes do jogo começar
    if (roomData.gamePhase && roomData.gamePhase !== 'waiting') {
      return NextResponse.json({ error: 'Cannot kick after game started' }, { status: 400 })
    }

    const playerIndex = roomData.players.findIndex((p: any) => p.name === playerName)
    if (playerIndex === -1) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    // Remover jogador das listas relevantes
    roomData.players.splice(playerIndex, 1)

    if (roomData.readyPlayers) {
      roomData.readyPlayers = roomData.readyPlayers.filter((p: string) => p !== playerName)
    }

    if (roomData.answers) {
      roomData.answers = roomData.answers.filter((a: any) => a.player !== playerName)
    }

    if (roomData.orders) {
      roomData.orders = roomData.orders.filter((o: any) => o.playerName !== playerName)
    }

    await redis.set(roomKey, JSON.stringify(roomData))

    return NextResponse.json({ success: true, players: roomData.players })
  } catch (error) {
    console.error('Error kicking player:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
