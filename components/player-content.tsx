"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Eye, UserX, CheckCircle, Hash, GripVertical, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { useRouter } from "next/navigation"

const roles = [
  {
    name: "citizen",
    icon: Users,
    color: "text-primary",
    hasNumber: true,
    answersQuestion: true,
    canReveal: false,
  },
  {
    name: "observer",
    icon: Eye,
    color: "text-secondary",
    hasNumber: true,
    answersQuestion: true,
    canReveal: true,
  },
  {
    name: "infiltrator",
    icon: UserX,
    color: "text-destructive",
    hasNumber: false,
    answersQuestion: true,
    canReveal: false,
  },
]

export default function PlayerContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const router = useRouter()
  const playerName = searchParams.get("name")
  const roomId = searchParams.get("room")

  if (!playerName || !roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">Erro</h1>
            <p>Nome do jogador ou código da sala não fornecido.</p>
            <p>Volte para a página inicial e tente novamente.</p>
          </div>
        </Card>
      </div>
    )
  }

  const [currentRole, setCurrentRole] = useState<any>(null)
  const [secretNumber, setSecretNumber] = useState<number | null>(null)
  const [hasJoined, setHasJoined] = useState(false)
  const [themeId, setThemeId] = useState("")
  const [hostName, setHostName] = useState("")
  const [gamePhase, setGamePhase] = useState<
    | "waiting"
    | "role-reveal"
    | "number-reveal"
    | "theme"
    | "answer"
    | "submitted"
    | "ordering"
    | "order-submitted"
    | "results"
  >("waiting")
  const [answer, setAnswer] = useState("")
  // iniciar vazio para forçar fetch na entrada em 'ordering'
  const [answers, setAnswers] = useState<Array<{ player: string; text: string; number: number }>>([])
  const [orderedAnswers, setOrderedAnswers] = useState<Array<{ player: string; text: string; number: number }>>([])
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [revealedNumber, setRevealedNumber] = useState<string | null>(null)
  const [players, setPlayers] = useState<Array<{ name: string; role: string }>>([])
  const [readyCount, setReadyCount] = useState(0)
  const advanceInProgressRef = useRef(false)
  const [orderCount, setOrderCount] = useState(0)
  const [winner, setWinner] = useState<'citizens' | 'infiltrator' | null>(null)
  const isHost = playerName === hostName

  useEffect(() => {
    if (roomId && playerName && !hasJoined) {
      console.log('Checking if player already joined:', { roomId, playerName })
      const checkPlayerStatus = async () => {
        try {
          // Primeiro, buscar dados da sala para ver se o jogador já está lá
          const roomResponse = await fetch(`/api/rooms?roomId=${roomId}`)
          if (roomResponse.ok) {
            const roomData = await roomResponse.json()
            const existingPlayer = roomData.players.find((p: any) => p.name === playerName)
            if (existingPlayer) {
              console.log('Player already in room:', existingPlayer)
              if (roomData.host) setHostName(roomData.host)
              // Se role já foi atribuída, definir currentRole
              if (existingPlayer.role) {
                const roleObj = roles.find(r => r.name === existingPlayer.role)
                setCurrentRole(roleObj)
                setSecretNumber(existingPlayer.number)
              }
              setGamePhase(roomData.gamePhase || "waiting")
              setHasJoined(true)
              // Carregar estado de revelação do localStorage
              const storedRevealed = localStorage.getItem(`revealed-${roomId}-${playerName}`)
              if (storedRevealed) {
                setRevealedNumber(storedRevealed)
              }
              return
            }
          }

          // Se não está na sala, tentar fazer join
          console.log('Player not in room, joining:', { roomId, playerName })
          const joinResponse = await fetch('/api/rooms/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerName })
          })
          console.log('Join response:', joinResponse.status)
          if (joinResponse.ok) {
            const data = await joinResponse.json()
            console.log('Join data:', data)
            if (data.role) {
              const roleObj = roles.find(r => r.name === data.role)
              setCurrentRole(roleObj)
              setSecretNumber(data.number)
            }
            setHasJoined(true)
          } else {
            const errorData = await joinResponse.json()
            console.error('Join error:', errorData)
          }
        } catch (error) {
          console.error('Error checking player status:', error)
        }
      }
      checkPlayerStatus()
    }
  }, [roomId, playerName, hasJoined])

  // Polling separado para estado da sala
  useEffect(() => {
    if (roomId) {
      const pollRoom = async () => {
        try {
          const response = await fetch(`/api/rooms?roomId=${roomId}`)
          const data = await response.json()
          console.log('Polling gamePhase:', data.gamePhase, 'current:', gamePhase)

          // Atualizar lista de jogadores e contagem de prontos
          if (data.players) {
            setPlayers(data.players)
            console.log('Updated players:', data.players.length)
            
            // Atualizar currentRole se foi atribuído
            const currentPlayer = data.players.find((p: any) => p.name === playerName)
            if (currentPlayer && currentPlayer.role && !currentRole) {
              console.log('Role assigned to player:', currentPlayer.role)
              const roleObj = roles.find(r => r.name === currentPlayer.role)
              setCurrentRole(roleObj)
              setSecretNumber(currentPlayer.number)
            }
          }

          if (data.host) {
            setHostName(data.host)
          }
          if (data.theme) {
            setThemeId(data.theme)
          }
          if (data.readyPlayers) {
            setReadyCount(data.readyPlayers.length)
            console.log('Updated ready count:', data.readyPlayers.length, 'Ready players:', data.readyPlayers)
          } else {
            setReadyCount(0)
            console.log('No ready players found, setting count to 0')
          }

          if (data.orders) {
            setOrderCount(data.orders.length)
            console.log('Updated order count:', data.orders.length)
          } else {
            setOrderCount(0)
          }

          if (data.winner) {
            setWinner(data.winner)
          }

          // Verificar se todos os jogadores estão prontos (sempre verificar, independente da fase local)
          if (data.players && data.readyPlayers) {
            const totalPlayers = data.players.length
            const readyPlayersCount = data.readyPlayers.length
            console.log(`[${playerName}] Checking ready status - Total players: ${totalPlayers}, Ready players: ${readyPlayersCount}, Server gamePhase: ${data.gamePhase}, Local gamePhase: ${gamePhase}`)

            // Usar a fase do servidor como gatilho para avançar (evita race conditions)
            if (readyPlayersCount >= totalPlayers && !advanceInProgressRef.current) {
              advanceInProgressRef.current = true
              console.log(`[${playerName}] All players ready on server, attempting advance to ordering`)
              try {
                const advanceResponse = await fetch('/api/rooms/advance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId, nextPhase: "ordering" })
                })
                console.log(`[${playerName}] Advance API response:`, advanceResponse.status)
                if (!advanceResponse.ok) {
                  console.error(`[${playerName}] Failed to advance:`, await advanceResponse.text())
                }
              } catch (error) {
                console.error(`[${playerName}] Error calling advance API:`, error)
              } finally {
                // Resetar para permitir novas tentativas em caso de falha
                advanceInProgressRef.current = false
              }
            }
          } else {
            console.log(`[${playerName}] Missing data - players: ${!!data.players}, readyPlayers: ${!!data.readyPlayers}`)
          }

          // Verificar se todos submeteram ordens
          if (data.players && data.orders) {
            const totalPlayers = data.players.length
            const orderCount = data.orders.length
            console.log(`[${playerName}] Checking order status - Total players: ${totalPlayers}, Orders: ${orderCount}, Server gamePhase: ${data.gamePhase}`)

            if (orderCount >= totalPlayers && !advanceInProgressRef.current) {
              advanceInProgressRef.current = true
              console.log(`[${playerName}] All players submitted orders, attempting advance to results`)
              try {
                const advanceResponse = await fetch('/api/rooms/advance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId, nextPhase: "results" })
                })
                console.log(`[${playerName}] Advance API response:`, advanceResponse.status)
                if (!advanceResponse.ok) {
                  console.error(`[${playerName}] Failed to advance:`, await advanceResponse.text())
                }
              } catch (error) {
                console.error(`[${playerName}] Error calling advance API:`, error)
              } finally {
                advanceInProgressRef.current = false
              }
            }
          }

          // Lógica normal de avanço de fase
          const phaseOrder = ["waiting", "role-reveal", "number-reveal", "theme", "answer", "submitted", "ordering", "order-submitted", "results"]
          const serverPhaseIndex = phaseOrder.indexOf(data.gamePhase)
          const currentPhaseIndex = phaseOrder.indexOf(gamePhase)

          if (serverPhaseIndex > currentPhaseIndex) {
            console.log('Updating gamePhase to:', data.gamePhase)
            setGamePhase(data.gamePhase)
          }
          
          // Se voltou para waiting e é o host, redirecionar para tela de host (sempre)
          if (data.gamePhase === "waiting" && data.host === playerName) {
            console.log('Game reset detected, redirecting host to /host')
            router.push(`/host?roomId=${roomId}&host=${encodeURIComponent(playerName)}`)
          }
        } catch (error) {
          console.error('Error polling room:', error)
        }
      }
      const interval = setInterval(pollRoom, 2000)
      return () => clearInterval(interval)
    }
  }, [roomId, gamePhase])

  useEffect(() => {
    if (currentRole && gamePhase === "waiting") {
      // Não força mais, espera o polling atualizar
    }
  }, [currentRole, gamePhase])

  useEffect(() => {
    // Marcar jogador como pronto quando chega na tela submitted
    if (gamePhase === "submitted" && roomId && playerName) {
      console.log('Player reached submitted phase, marking as ready:', playerName)
      const markAsReady = async () => {
        try {
          console.log('Marking player as ready:', playerName)
          const response = await fetch('/api/rooms/ready', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerName })
          })
          console.log('Ready API response for', playerName, ':', response.status)
          if (response.ok) {
            console.log('Player marked as ready successfully:', playerName)
          } else {
            console.error('Failed to mark as ready:', playerName, await response.text())
          }
        } catch (error) {
          console.error('Error marking as ready:', playerName, error)
        }
      }
      markAsReady()
    }
  }, [gamePhase, roomId, playerName])

  useEffect(() => {
    // Se está em order-submitted, tentar reenviar a ordem a cada 3 segundos até ter sucesso
    if (gamePhase === "order-submitted" && roomId && playerName) {
      let retryCount = 0
      const maxRetries = 10 // 30 segundos
      
      const retrySubmitOrder = async () => {
        try {
          const response = await fetch('/api/rooms/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId, playerName, orderedAnswers })
          })
          
          if (response.ok) {
            console.log('Order retry successful for:', playerName)
            return true
          } else {
            console.log('Order retry failed, will retry again...')
            return false
          }
        } catch (error) {
          console.error('Order retry error:', error)
          return false
        }
      }

      const interval = setInterval(async () => {
        retryCount++
        const success = await retrySubmitOrder()
        if (success || retryCount >= maxRetries) {
          clearInterval(interval)
          if (retryCount >= maxRetries) {
            console.warn('Max retries reached for order submission')
          }
        }
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [gamePhase, roomId, playerName, orderedAnswers])

  useEffect(() => {
    if (gamePhase === "ordering" && roomId && answers.length === 0) {
      // Buscar respostas automaticamente quando entra na fase de ordenação
      const fetchAnswers = async () => {
        try {
          const response = await fetch(`/api/rooms/answers?roomId=${roomId}`)
          const data = await response.json()
          setAnswers(data.answers || [])
          setOrderedAnswers(data.answers || [])
        } catch (error) {
          console.error('Error fetching answers:', error)
        }
      }
      fetchAnswers()
    }
  }, [gamePhase, roomId, answers.length])
    setDraggedItem(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null || draggedItem === index) return

    const newOrdered = [...orderedAnswers]
    const draggedCard = newOrdered[draggedItem]
    newOrdered.splice(draggedItem, 1)
    newOrdered.splice(index, 0, draggedCard)
    setOrderedAnswers(newOrdered)
    setDraggedItem(index)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleRevealNumber = (player: string) => {
    if (currentRole.canReveal && !revealedNumber) {
      setRevealedNumber(player)
      localStorage.setItem(`revealed-${roomId}-${playerName}`, player)
    }
  }

  const forceAdvance = async (nextPhase: "ordering" | "results") => {
    if (!roomId) return
    try {
      const response = await fetch('/api/rooms/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, nextPhase })
      })
      if (!response.ok) {
        console.error('Failed to force advance:', await response.text())
      }
      setGamePhase(nextPhase)
    } catch (error) {
      console.error('Error forcing advance:', error)
    }
  }

  if (gamePhase === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">
              {t("player.welcome")}, {playerName}!
            </h1>
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground">{t("player.waitingHost")}</p>
          </div>
        </Card>
      </div>
    )
  }

  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">
              {t("player.joining")}, {playerName}!
            </h1>
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-muted-foreground">Assigning role...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (gamePhase === "role-reveal") {
    const RoleIcon = currentRole.icon
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-base px-4 py-1">
              {playerName}
            </Badge>
            <h1 className="text-3xl font-bold text-primary neon-glow">{t("home.title")}</h1>
          </div>

          <Card className="p-8 space-y-6 bg-card border-primary/30 neon-border animate-in fade-in duration-500">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className={`p-6 rounded-full bg-background ${currentRole.color}`}>
                  <RoleIcon className="w-16 h-16" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{t("player.yourRole")}</h2>
                <p className={`text-5xl font-bold ${currentRole.color} neon-glow`}>{t(`roles.${currentRole.name}`)}</p>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">{t(`roles.${currentRole.name}Desc`)}</p>
            </div>
          </Card>

          <Button
            onClick={() => setGamePhase(currentRole.hasNumber ? "number-reveal" : "theme")}
            className="w-full h-14 text-lg neon-border"
            size="lg"
          >
            {t("common.continue")}
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === "number-reveal" && currentRole.hasNumber) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-base px-4 py-1">
              {playerName}
            </Badge>
          </div>

          <Card className="p-8 space-y-8 bg-card border-primary/30 neon-border animate-in fade-in duration-500">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-6 rounded-full bg-primary/20">
                  <Hash className="w-16 h-16 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{t("player.secretNumber")}</h2>
                <p className="text-8xl font-bold text-primary neon-glow">{secretNumber}</p>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{t("player.memorizeNumber")}</p>
            </div>
          </Card>

          <Button onClick={() => setGamePhase("theme")} className="w-full h-14 text-lg neon-border" size="lg">
            {t("common.continue")}
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === "theme") {
    const isInfiltrator = currentRole.name === "infiltrator"

    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-base px-4 py-1">
              {playerName}
            </Badge>
          </div>

          <Card className="p-8 space-y-8 bg-card border-primary/30 neon-border animate-in fade-in duration-500">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-6 rounded-full bg-primary/20">
                    <currentRole.icon className="w-16 h-16 text-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">{t("player.roundTheme")}</h2>
                  <p className="text-6xl font-bold text-primary neon-glow">{t(`themes.${themeId}`)}</p>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{t("player.identifyInfiltrator")}</p>
              </div>
          </Card>

          <Button
            onClick={() => setGamePhase(currentRole.answersQuestion ? "answer" : "submitted")}
            className="w-full h-14 text-lg neon-border"
            size="lg"
          >
            {currentRole.answersQuestion ? t("player.ready") : t("common.continue")}
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === "answer" && currentRole.answersQuestion) {
    return (
      <div className="min-h-screen p-4 flex flex-col">
        <div className="flex-1 max-w-md mx-auto w-full space-y-6 py-8">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-base px-4 py-1">
              {playerName}
            </Badge>
            <h1 className="text-3xl font-bold text-primary neon-glow">{t("player.yourAnswer")}</h1>
          </div>

          <Card className="p-6 space-y-4 bg-card">
            <label htmlFor="answer" className="font-semibold text-lg block">
              {t("player.yourTheme")} {t(`themes.${themeId}`)} {currentRole.name !== "infiltrator" ? ", " + t("player.yourNumber") : ""} {secretNumber}
            </label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t("player.answerPlaceholder")}
              className="min-h-[150px] text-lg resize-none"
              maxLength={200}
            />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{t("player.beCreative")}</span>
              <span>{answer.length}/200</span>
            </div>
          </Card>

          <Button
            onClick={async () => {
              if (roomId) {
                try {
                  await fetch('/api/rooms/answers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ roomId, playerName, answer, number: secretNumber })
                  })
                } catch (error) {
                  console.error('Error submitting answer:', error)
                }
              }
              setGamePhase("submitted")
            }}
            disabled={answer.trim().length < 2}
            className="w-full h-14 text-lg neon-border"
            size="lg"
          >
            {t("player.submitAnswer")}
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === "submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card text-center animate-in fade-in duration-500">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-primary/20">
                <CheckCircle className="w-20 h-20 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-primary neon-glow">
                {currentRole.answersQuestion ? t("player.answerSubmitted") : t("player.ready2")}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{t("player.waitingOthers")}</p>
            </div>
            {currentRole.answersQuestion && (
              <Card className="p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground italic">{t("player.yourAnswerWas")}</p>
                <p className="text-base mt-2">{answer}</p>
              </Card>
            )}
            {isHost && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => forceAdvance("ordering")}
              >
                Forçar continuar (ignorar faltantes)
              </Button>
            )}
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t("player.waitingAllPlayers")} ({readyCount} de {players.length})
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (gamePhase === "ordering") {
    const isInfiltrator = currentRole.name === "infiltrator"
    const isObserver = currentRole.name === "observer"

    return (
      <div className="min-h-screen p-4 flex flex-col">
        <div className="flex-1 max-w-md mx-auto w-full space-y-6 py-8">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-base px-4 py-1">
              {playerName}
            </Badge>
            <h1 className="text-2xl font-bold text-primary neon-glow">{t("player.orderAnswers")}</h1>
            {isInfiltrator && <p className="text-sm text-destructive">{t("player.infiltratorOrderInfo")}</p>}
            {isObserver && !revealedNumber && <p className="text-sm text-secondary">{t("player.observerOrderInfo")}</p>}
          </div>

          <Card className="p-6 space-y-4 bg-muted/50 border-primary/30">
            <div className="text-center space-y-2">
              <p className="text-base leading-relaxed">"{t(`themes.${themeId}`)}"</p>
            </div>
          </Card>
          <div className="space-y-2">
            {orderedAnswers.map((ans, index) => {
              const isRevealed = revealedNumber === ans.player
              const displayNumber = typeof ans.number === 'number' ? ans.number : '?'

              return (
                <Card
                  key={ans.player}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 space-y-3 bg-card cursor-move hover:border-primary/50 transition-all ${
                    draggedItem === index ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{ans.text}</span>
                        <div className="flex items-center gap-2">
                          {isObserver && !isRevealed && (
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-secondary/20"
                              onClick={() => handleRevealNumber(ans.player)}
                            >
                              <Eye className="w-4 h-4" />
                            </Badge>
                          )}
                          {isRevealed && (
                            <Badge variant="secondary" className="text-lg font-bold">
                              {t("player.realNumber")} {displayNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{ans.player || t("player.noAnswer")}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Button onClick={async () => {
            if (roomId && playerName) {
              try {
                const response = await fetch('/api/rooms/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId, playerName, orderedAnswers })
                })
                if (response.ok) {
                  console.log('Order submitted successfully:', playerName)
                  setGamePhase("order-submitted")
                } else {
                  const error = await response.text()
                  console.error('Failed to submit order:', error)
                  alert(`Erro ao enviar ordenação: ${error}`)
                }
              } catch (error) {
                console.error('Error submitting order:', error)
                alert(`Erro ao enviar ordenação: ${error}`)
              }
            }
          }} className="w-full h-14 text-lg neon-border" size="lg">
            {t("player.submitOrder")}
          </Button>
        </div>
      </div>
    )
  }

  if (gamePhase === "order-submitted") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card text-center animate-in fade-in duration-500">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-primary/20">
                <CheckCircle className="w-20 h-20 text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-primary neon-glow">{t("player.orderSubmitted")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{t("player.waitingOrders")}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t("player.waitingAllPlayers")} ({orderCount} de {players.length})
            </p>
            {isHost && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => forceAdvance("results")}
              >
                Forçar mostrar resultado (ignorar faltantes)
              </Button>
            )}
          </div>
        </Card>
      </div>
    )
  }

  if (gamePhase === "results") {
    const isInfiltrator = currentRole.name === "infiltrator"
    const correctOrder = [...answers]
      .filter((a) => typeof a.number === 'number')
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
    const citizensWon = winner === 'citizens'

    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <Card className="p-8 space-y-6 bg-card border-primary/30 neon-border animate-in fade-in duration-500">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className={`p-6 rounded-full ${citizensWon ? "bg-primary/20" : "bg-destructive/20"}`}>
                  {citizensWon ? (
                    <Users className="w-16 h-16 text-primary" />
                  ) : (
                    <UserX className="w-16 h-16 text-destructive" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold">{t("player.finalResult")}</h2>
                <p className={`text-5xl font-bold neon-glow ${citizensWon ? "text-primary" : "text-destructive"}`}>
                  {citizensWon ? t("player.citizensWon") : t("player.infiltratorWon")}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-lg text-muted-foreground">
                  {citizensWon ? t("player.correctOrder") : t("player.incorrectOrder")}
                </p>
                {isInfiltrator && (
                  <p className="text-destructive font-semibold">
                    {t("player.youWereInfiltrator")} {citizensWon ? t("player.lost") : t("player.won")}!
                  </p>
                )}
              </div>

              <Card className="p-4 bg-muted/50 text-left">
                <h3 className="font-semibold mb-3">{t("player.correctOrderList")}</h3>
                <div className="space-y-2">
                  {correctOrder.map((ans) => (
                    <div key={ans.player} className="flex justify-between items-center">
                      <span>{ans.text}</span>
                      <Badge variant="outline">{ans.number}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </Card>

          <Button onClick={async () => {
            if (roomId) {
              try {
                await fetch('/api/rooms/reset', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ roomId })
                })
                // Resetar estado local
                setGamePhase("waiting")
                setCurrentRole(null)
                setSecretNumber(null)
                setAnswer("")
                setAnswers([])
                setOrderedAnswers([])
                setRevealedNumber(null)
              } catch (error) {
                console.error('Error resetting room:', error)
              }
            }
          }} className="w-full h-14 text-lg neon-border" size="lg">
            {t("common.newRound")}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
