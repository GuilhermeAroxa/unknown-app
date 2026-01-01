import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json()
    console.log('Starting game for room:', roomId)

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)

    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)
    const players = roomData.players

    // Atribuir roles: 1 observador, 1 infiltrado, resto cidadão
    const roles: { name: string; role: string; number: number | null }[] = []
    
    // Primeiro jogador (geralmente o host) - pode ser qualquer coisa
    // Vamos começar com os papéis especiais
    let observerAssigned = false
    let infiltratorAssigned = false

    players.forEach((player: any, index: number) => {
      let role: string
      let number: number | null = null

      // Atribuir observer (primeira vez)
      if (!observerAssigned) {
        role = 'observer'
        observerAssigned = true
      }
      // Atribuir infiltrator (segunda vez)
      else if (!infiltratorAssigned) {
        role = 'infiltrator'
        infiltratorAssigned = true
      }
      // Resto é cidadão
      else {
        role = 'citizen'
        number = Math.floor(Math.random() * 101)
      }

      // Gerar número se não for infiltrador
      if (role === 'observer') {
        number = Math.floor(Math.random() * 101)
      }

      roles.push({ name: player.name, role, number })
    })

    // Atualizar jogadores com suas roles
    roomData.players = roles
    roomData.gamePhase = 'role-reveal'
    await redis.set(roomKey, JSON.stringify(roomData))
    console.log('Game started, roles assigned:', roles)

    return NextResponse.json({ success: true, players: roles })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}