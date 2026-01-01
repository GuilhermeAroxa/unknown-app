"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Smartphone, Monitor } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-primary neon-glow">{t("home.title")}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground">{t("home.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg bg-card border border-border space-y-2">
            <Users className="w-10 h-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">{t("home.multiplayerTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.multiplayerDesc")}</p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-2">
            <Smartphone className="w-10 h-10 mx-auto text-secondary" />
            <h3 className="font-semibold text-lg">{t("home.qrTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.qrDesc")}</p>
          </div>

          <div className="p-6 rounded-lg bg-card border border-border space-y-2">
            <Monitor className="w-10 h-10 mx-auto text-accent" />
            <h3 className="font-semibold text-lg">{t("home.hostTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("home.hostDesc")}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link href="/host">
            <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 neon-border">
              {t("home.createRoom")}
            </Button>
          </Link>
          <Link href="/join">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg h-14 px-8">
              {t("home.joinPlayer")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
