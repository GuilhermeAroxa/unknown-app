import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName, answer, number } = await request.json()

    if (!roomId || !playerName || !answer) {
      return NextResponse.json({ error: 'Room ID, player name, and answer are required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)

    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)

    // Add or update answer
    const existingIndex = roomData.answers.findIndex((a: any) => a.player === playerName)
    if (existingIndex >= 0) {
      roomData.answers[existingIndex] = { player: playerName, text: answer, number }
    } else {
      roomData.answers.push({ player: playerName, text: answer, number })
    }

    await redis.set(roomKey, JSON.stringify(roomData))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting answer:', error)
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
    const roomDataStr = await redis.get(`room:${roomId}`)
    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)
    return NextResponse.json({ answers: roomData.answers })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}