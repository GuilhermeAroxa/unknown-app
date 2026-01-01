import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, playerName } = body

    console.log('Join request:', { roomId, playerName })

    if (!roomId || !playerName) {
      console.log('Missing roomId or playerName')
      return NextResponse.json({ error: 'Room ID and player name are required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    console.log('Room key:', roomKey)
    const roomDataStr = await redis.get(roomKey)
    console.log('Room data str:', roomDataStr)

    if (!roomDataStr) {
      console.log('Room not found')
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)
    console.log('Room data:', roomData)

    if (roomData.players.some((p: any) => p.name === playerName)) {
      console.log('Player name already taken')
      return NextResponse.json({ error: 'Player name already taken' }, { status: 400 })
    }

    // Adicionar jogador sem role (será atribuído ao iniciar o jogo)
    roomData.players.push({ name: playerName, role: null, number: null })

    await redis.set(roomKey, JSON.stringify(roomData))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}