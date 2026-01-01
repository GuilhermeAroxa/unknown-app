import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { hostName } = await request.json()

    if (!hostName) {
      return NextResponse.json({ error: 'Host name is required' }, { status: 400 })
    }

    const roomId = randomUUID().slice(0, 6).toUpperCase() // Short room code

    const roomData = {
      id: roomId,
      host: hostName,
      players: [{ name: hostName, role: null, number: null }],
      gamePhase: 'waiting',
      answers: [],
      readyPlayers: [],
      orders: [],
      theme: 'Praia',
      createdAt: new Date().toISOString()
    }

    await redis.set(`room:${roomId}`, JSON.stringify(roomData))

    return NextResponse.json({ roomId, roomData })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')

  if (!roomId) {
    return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
  }

  try {
    const roomData = await redis.get(`room:${roomId}`)
    if (!roomData) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(JSON.parse(roomData))
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}