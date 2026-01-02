import { Card } from "@/components/ui/card"

interface QRCodeDisplayProps {
  roomCode: string
}

export function QRCodeDisplay({ roomCode }: QRCodeDisplayProps) {
  // URL do QR code usando uma API pública
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `${typeof window !== "undefined" ? window.location.origin : ""}/join?room=${roomCode}`,
  )}`

  return (
    <div className="flex justify-center">
      <Card className="p-6 bg-background">
        <a href={`/join?room=${encodeURIComponent(roomCode)}`}>
          <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code para entrar na sala" className="w-64 h-64 rounded-lg" />
        </a>
      </Card>
    </div>
  )
}
