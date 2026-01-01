import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function POST(request: NextRequest) {
  try {
    const { roomId, nextPhase } = await request.json()
    console.log('Advancing game phase for room:', roomId, 'to:', nextPhase)

    if (!roomId || !nextPhase) {
      return NextResponse.json({ error: 'Room ID and next phase are required' }, { status: 400 })
    }

    const roomKey = `room:${roomId}`
    const roomDataStr = await redis.get(roomKey)

    if (!roomDataStr) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomData = JSON.parse(roomDataStr)
    roomData.gamePhase = nextPhase

    if (nextPhase === 'results') {
      // Considerar apenas jogadores com número válido (cidadãos/observador)
      const validNumberPlayers = new Set(
        (roomData.answers || [])
          .filter((a: any) => typeof a.number === 'number')
          .map((a: any) => a.player)
      )

      // Calcular o vencedor baseado na média das ordens apenas de cidadãos/observador
      const citizenObserverOrders = (roomData.orders || []).filter((o: any) => {
        const player = roomData.players.find((p: any) => p.name === o.playerName)
        return player && (player.role === 'citizen' || player.role === 'observer')
      })

      if (citizenObserverOrders.length > 0) {
        const positionSums: { [key: string]: number } = {}

        citizenObserverOrders.forEach((orderData: any) => {
          orderData.order.forEach((item: any, index: number) => {
            if (!validNumberPlayers.has(item.player)) return
            positionSums[item.player] = (positionSums[item.player] || 0) + index
          })
        })

        // Ordem média apenas dos jogadores válidos
        const averagedOrder = Object.entries(positionSums)
          .sort((a, b) => a[1] - b[1])
          .map(([player]) => player)

        // Ordem correta baseada apenas em quem tem número
        const correctOrder = (roomData.answers || [])
          .filter((a: any) => typeof a.number === 'number')
          .sort((a: any, b: any) => a.number - b.number)
          .map((a: any) => a.player)

        roomData.winner = JSON.stringify(averagedOrder) === JSON.stringify(correctOrder) ? 'citizens' : 'infiltrator'
      } else {
        roomData.winner = 'infiltrator' // fallback
      }
    }

    await redis.set(roomKey, JSON.stringify(roomData))
    console.log('Game phase advanced to:', nextPhase)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error advancing game phase:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}