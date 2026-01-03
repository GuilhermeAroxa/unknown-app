import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerName, orderedAnswers } = await request.json()

    if (!roomId || !playerName || !orderedAnswers) {
      return NextResponse.json({ error: 'Room ID, player name, and ordered answers are required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)
    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)
    const player = roomData.players.find((p: any) => p.name === playerName)
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 404 })
    }

    // Verificar se já submeteu
    if (!roomData.orders) roomData.orders = []
    const existingIndex = roomData.orders.findIndex((o: any) => o.playerName === playerName)
    if (existingIndex >= 0) {
      // Atualizar ordem existente em vez de rejeitar
      console.log('Updating existing order for player:', playerName)
      roomData.orders[existingIndex] = { playerName, order: orderedAnswers }
    } else {
      roomData.orders.push({ playerName, order: orderedAnswers })
    }

    await redis.set(roomKey, JSON.stringify(roomData))
    console.log('Order submitted for player:', playerName, 'Total orders:', roomData.orders.length)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting order:', error)
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
    return NextResponse.json({ orders: roomData.orders || [] })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}