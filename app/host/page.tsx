"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { PlayerList } from "@/components/player-list"
import { GameState } from "@/components/game-state"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

function HostPageContent() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const existingRoomId = searchParams.get("roomId")
  const existingHostName = searchParams.get("host")
  const [gameStarted, setGameStarted] = useState(false)
  const [roomCode, setRoomCode] = useState(existingRoomId || "")
  const [hostName, setHostName] = useState(existingHostName || "")
  const [players, setPlayers] = useState<{ id: string; name: string; status: string; role?: string; number?: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [hostRole, setHostRole] = useState<any>(null)
  const [roomCreated, setRoomCreated] = useState(!!existingRoomId)
  const [creatingRoom, setCreatingRoom] = useState(false)

  useEffect(() => {
    // Se já tem um roomId (vindo de reset), apenas buscar a sala
    if (existingRoomId) {
      const fetchExistingRoom = async () => {
        try {
          const response = await fetch(`/api/rooms?roomId=${existingRoomId}`)
          const data = await response.json()
          setRoomCode(existingRoomId)
          setPlayers(data.players.map((p: any, index: number) => ({
            id: (index + 1).toString(),
            name: p.name,
            status: 'connected',
            role: p.role,
            number: p.number
          })))
          if (data.host) setHostName(data.host)
          setRoomCreated(true)
          setLoading(false)
        } catch (error) {
          console.error('Error fetching room:', error)
          setLoading(false)
        }
      }
      fetchExistingRoom()
      return
    }

    // Sem roomId: mostrar UI para criar sala
    setLoading(false)
  }, [existingRoomId])

  useEffect(() => {
    if (roomCode) {
      const fetchRoom = async () => {
        try {
          const response = await fetch(`/api/rooms?roomId=${roomCode}`)
          const data = await response.json()
          setPlayers(data.players.map((p: any, index: number) => ({
            id: (index + 1).toString(),
            name: p.name,
            status: 'connected',
            role: p.role,
            number: p.number
          })))
          if (data.host) setHostName(data.host)
        } catch (error) {
          console.error('Error fetching room:', error)
        }
      }
      const interval = setInterval(fetchRoom, 2000)
      return () => clearInterval(interval)
    }
  }, [roomCode])

  const handleCreateRoom = async () => {
    const trimmedName = hostName.trim() || 'Host'
    setCreatingRoom(true)
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: trimmedName })
      })
      const data = await response.json()
      setRoomCode(data.roomId)
      setPlayers(data.roomData.players.map((p: any, index: number) => ({
        id: (index + 1).toString(),
        name: p.name,
        status: 'connected',
        role: p.role,
        number: p.number
      })))
      setHostName(trimmedName)
      setRoomCreated(true)
    } catch (error) {
      console.error('Error creating room:', error)
    } finally {
      setCreatingRoom(false)
    }
  }

  const handleStartGame = async () => {
    try {
      await fetch('/api/rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode })
      })
      setGameStarted(true)
      // Redirecionar host para página de player após iniciar o jogo
      router.push(`/player?name=${encodeURIComponent(hostName || 'Host')}&room=${roomCode}`)
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  const handleKickPlayer = async (playerName: string) => {
    if (!roomCode) return
    try {
      const response = await fetch('/api/rooms/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode, playerName })
      })

      if (!response.ok) {
        console.error('Failed to kick player:', await response.text())
        return
      }

      setPlayers((prev) => prev.filter((p) => p.name !== playerName))
    } catch (error) {
      console.error('Error kicking player:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Tela inicial para o host escolher o nome e criar a sala
  if (!roomCreated && !roomCode) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-primary neon-glow">{t("home.title")}</h1>
          </div>

          <Card className="p-8 space-y-6 bg-card border-primary/30">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">{t("host.title")}</h2>
              <p className="text-muted-foreground">Escolha seu nome para criar a sala.</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Seu nome</label>
              <Input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Host"
                maxLength={24}
              />
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={creatingRoom || hostName.trim().length < 2}
              className="w-full h-12 text-lg neon-border"
              size="lg"
            >
              {creatingRoom ? "Criando..." : "Criar sala"}
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (gameStarted) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Host Role Section */}
          {hostRole && (
            <Card className="p-8 space-y-6 bg-card border-primary/30">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Seu Papel</h2>
                <div className={`text-6xl font-bold ${hostRole.color} neon-glow`}>
                  {t(`roles.${hostRole.name}`)}
                </div>
                <p className="text-lg text-muted-foreground">
                  {t(`roles.${hostRole.name}Desc`)}
                </p>
                {hostRole.hasNumber && (
                  <p className="text-2xl">Seu número: <span className="font-bold text-primary">{players.find(p => p.name === 'Host')?.number}</span></p>
                )}
              </div>
            </Card>
          )}

          <GameState players={players} roomId={roomCode} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary neon-glow">{t("home.title")}</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-8 space-y-6 bg-card border-primary/30">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t("host.title")}</h2>
              <p className="text-muted-foreground">{t("host.subtitle")}</p>
            </div>

            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{t("host.roomCode")}</p>
                <div className="text-6xl font-bold tracking-widest text-primary neon-glow">{roomCode}</div>
              </div>

              <QRCodeDisplay roomCode={roomCode} />
            </div>
          </Card>

          <Card className="p-8 space-y-6 bg-card">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{t("host.players")}</h2>
              <p className="text-muted-foreground">
                {players.length} {players.length !== 1 ? t("host.playersConnectedPlural") : t("host.playersConnected")}
              </p>
            </div>

            <PlayerList
              players={players}
              onKick={handleKickPlayer}
              canKick={!gameStarted}
              hostName={hostName || "Host"}
            />

            <Button
              onClick={handleStartGame}
              disabled={players.length < 3}
              className="w-full h-12 text-lg neon-border"
              size="lg"
            >
              {players.length < 3 ? t("host.waitingPlayers") : t("host.startGame")}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function HostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HostPageContent />
    </Suspense>
  )
}
