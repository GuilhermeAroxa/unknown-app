"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MessageSquare, Vote } from "lucide-react"

interface Player {
  id: string
  name: string
  status: string
}

interface GameStateProps {
  players: Player[]
  roomId?: string
}

export function GameState({ players, roomId }: GameStateProps) {
  const [currentPhase, setCurrentPhase] = useState<"discussion" | "voting" | "results">("discussion")
  const [responses, setResponses] = useState<{ playerId: string; text: string }[]>([])

  useEffect(() => {
    if (roomId) {
      const fetchAnswers = async () => {
        try {
          const response = await fetch(`/api/rooms/answers?roomId=${roomId}`)
          const data = await response.json()
          setResponses(data.answers.map((a: any) => ({ playerId: a.player, text: a.text })))
        } catch (error) {
          console.error('Error fetching answers:', error)
        }
      }
      fetchAnswers()
      const interval = setInterval(fetchAnswers, 2000)
      return () => clearInterval(interval)
    }
  }, [roomId])

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-primary neon-glow">INCOGNITO</h1>
          <Badge variant="outline" className="text-lg px-4 py-2 border-primary text-primary">
            Rodada 1
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Game Phase Indicator */}
          <Card className="md:col-span-3 p-6 bg-card border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {currentPhase === "discussion" ? (
                  <MessageSquare className="w-8 h-8 text-primary" />
                ) : (
                  <Vote className="w-8 h-8 text-secondary" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {currentPhase === "discussion" ? "Fase de Discussão" : "Fase de Votação"}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentPhase === "discussion"
                      ? "Os jogadores estão respondendo às perguntas"
                      : "Aguarde os votos dos jogadores"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentPhase(currentPhase === "discussion" ? "voting" : "results")}
                size="lg"
                className="neon-border"
              >
                Próxima Fase
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Players Panel */}
          <Card className="p-6 space-y-4 bg-card">
            <h3 className="text-xl font-bold">Jogadores Ativos</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div key={player.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant="outline" className="border-accent text-accent">
                    Ativo
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Responses Panel */}
          <Card className="md:col-span-2 p-6 space-y-4 bg-card">
            <h3 className="text-xl font-bold">Respostas Anônimas</h3>
            <div className="space-y-3">
              {responses.map((response, index) => (
                <Card key={index} className="p-4 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1">
                      #{index + 1}
                    </Badge>
                    <p className="flex-1 text-foreground">{response.text}</p>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
