import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, CheckCircle2, UserMinus } from "lucide-react"

interface Player {
  id: string
  name: string
  status: string
}

interface PlayerListProps {
  players: Player[]
  onKick?: (playerName: string) => void
  canKick?: boolean
  hostName?: string
}

export function PlayerList({ players, onKick, canKick = false, hostName = "Host" }: PlayerListProps) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {players.map((player) => (
        <Card
          key={player.id}
          className="p-4 flex items-center justify-between bg-muted/50 border-border hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">{player.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 border-accent text-accent">
              <CheckCircle2 className="w-3 h-3" />
              Conectado
            </Badge>
            {canKick && onKick && player.name !== hostName && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onKick(player.name)}
                className="gap-2"
              >
                <UserMinus className="w-4 h-4" />
                Kick
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
