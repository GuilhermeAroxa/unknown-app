"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function JoinPage() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const initialRoom = searchParams?.get("room") ?? ""
  const [name, setName] = useState("")
  const [roomCode, setRoomCode] = useState(initialRoom.toUpperCase())
  const router = useRouter()

  useEffect(() => {
    const r = searchParams?.get("room") ?? ""
    setRoomCode(r.toUpperCase())
  }, [searchParams])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && roomCode) {
      router.push(`/player?name=${encodeURIComponent(name)}&room=${roomCode}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card className="w-full max-w-md p-8 space-y-6 bg-card">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary neon-glow">{t("join.title")}</h1>
        </div>

        <p className="text-muted-foreground">{t("join.subtitle")}</p>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base">
              {t("join.yourName")}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t("join.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomCode" className="text-base">
              {t("join.roomCode")}
            </Label>
            <Input
              id="roomCode"
              type="text"
              placeholder={t("join.codePlaceholder")}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="h-12 text-lg uppercase tracking-widest text-center"
              maxLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg neon-border" size="lg">
            {t("join.joinButton")}
          </Button>
        </form>
      </Card>
    </div>
  )
}
