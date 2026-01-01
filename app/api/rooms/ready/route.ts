import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName } = await request.json()
    console.log('Player ready:', playerName, 'in room:', roomId)

    if (!roomId || !playerName) {
      return NextResponse.json({ error: 'Room ID and player name are required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)

    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)

    // Inicializar readyPlayers se não existir
    if (!roomData.readyPlayers) {
      roomData.readyPlayers = []
      console.log('Initialized readyPlayers array')
    }

    // Adicionar jogador à lista de prontos se não estiver lá
    if (!roomData.readyPlayers.includes(playerName)) {
      roomData.readyPlayers.push(playerName)
      console.log('Added player to ready list:', playerName, 'Total ready:', roomData.readyPlayers.length)
    } else {
      console.log('Player already in ready list:', playerName)
    }

    await redis.set(roomKey, JSON.stringify(roomData))
    console.log('Player marked as ready:', playerName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking player as ready:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}