import { Suspense } from "react"
import PlayerContent from "@/components/player-content"

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayerContent />
    </Suspense>
  )
}
