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
    roomData.theme = getRandomThemeId()
    await redis.set(roomKey, JSON.stringify(roomData))
    console.log('Game started, roles assigned:', roles)

    return NextResponse.json({ success: true, players: roles })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

 const themeIds = [
      "scary-things",
      "happy-things",
      "sad-things",
      "awkward-things",
      "relaxing-things",
      "stressful-things",
      "gross-things",
      "cute-things",
      "annoying-things",
      "shameful-things",
      "hate-doing",
      "bored-things",
      "always-forget",
      "lazy-things",
      "time-wasting",
      "traffic-rage",
      "shower-things",
      "midnight-things",
      "pretend-understand",
      "avoid-doing",
      "yummy-food",
      "strange-food",
      "gross-food",
      "coffee-things",
      "sleepy-food",
      "expensive-food",
      "cheap-food",
      "liked-food",
      "debatable-food",
      "secret-snacks",
      "games",
      "strong-characters",
      "scary-villains",
      "iconic-heroes",
      "rage-games",
      "sad-movies",
      "funny-movies",
      "boring-movies",
      "scary-movies",
      "addictive-series",
      "long-series",
      "hateable-characters",
      "charismatic-characters",
      "famous-movies",
      "sleepy-movies",
      "upbeat-music",
      "sad-music",
      "annoying-music",
      "nostalgic-music",
      "driving-music",
      "crying-music",
      "famous-music",
      "overplayed-music",
      "relaxing-music",
      "party-music",
      "important-life",
      "overrated",
      "underrated",
      "proud-things",
      "secondhand-embarrassment",
      "should-know",
      "nobody-admits",
      "causes-fights",
      "unite-people",
      "learn-with-time",
      "boring-school",
      "cool-school",
      "hard-subjects",
      "memorable-teachers",
      "useless-school",
      "stressful-work",
      "pretend-at-work",
      "boss-freakouts",
      "intern-things",
      "quit-job",
      "romantic-things",
      "jealousy-things",
      "ruined-dates",
      "fall-in-love",
      "couple-fights",
      "drift-apart",
      "show-love",
      "red-flags",
      "green-flags",
      "awkward-dates",
      "unfair-things",
      "scary-reality",
      "improve-world",
      "worsen-world",
      "everyone-complains",
      "changed-world",
      "collective-fears",
      "gives-hope",
      "should-end",
      "should-return",
      "sleepy-things",
      "energetic-things",
      "unhealthy",
      "healthy-things",
      "causes-pain",
      "relieves-pain",
      "tiring-things",
      "soothing-things",
      "makes-sweat",
      "makes-hungry",
      "awkward-situations",
      "disappear-situations",
      "embarrassing-situations",
      "only-you",
      "public-embarrassment",
      "funny-stories",
      "absurd-situations",
      "seems-fake",
      "family-things",
      "worth-telling",
      "relaxing-places",
      "scary-places",
      "romantic-places",
      "boring-places",
      "expensive-places",
      "cheap-places",
      "bucket-list-places",
      "dangerous-places",
      "scary-at-night",
      "peaceful-places",
      "cool-superpowers",
      "useless-superpowers",
      "weird-wishes",
      "useless-inventions",
      "genius-inventions",
      "should-exist",
      "shouldnt-exist",
      "crazy-ideas",
      "genius-ideas",
      "impossible-things",
      "childhood-games",
      "old-cartoons",
      "childhood-fears",
      "childhood-joy",
      "childhood-beliefs",
      "childhood-lies",
      "cool-toys",
      "useless-toys",
      "breakable-things",
      "childhood-fights",
      "causes-chaos",
      "unlucky-things",
      "lucky-things",
      "problematic-things",
      "unpredictable",
      "never-works",
      "always-wrong",
      "causes-confusion",
      "became-meme",
      "viral-things",
      "hard-to-explain",
      "pretend-understand-things",
      "only-makes-sense",
      "cant-explain",
      "easier-than-seems",
      "harder-than-seems",
      "confusing-things",
      "makes-no-sense",
      "would-never-do",
      "would-do-no-thought",
      "public-awkward",
      "embarrassed-if-seen",
      "lie-about",
      "regrets",
      "would-do-secretly",
      "wont-tell-parents",
      "hide-things",
      "guilt-things",
      "judge-others",
      "pretend-not-like",
      "expensive-things",
      "useless-expensive",
      "looks-cool-isnt",
      "would-buy-rich",
      "would-never-buy",
      "lost-by-everyone",
      "broke-everyone",
      "forgot-everyone",
      "wont-lend",
      "lend-easily",
      "brightens-day",
      "ruins-day",
      "makes-laugh",
      "makes-cry",
      "proud-of",
      "afraid-of",
      "miss-things",
      "want-very-much",
      "never-do",
      "would-do-now",
    ]
    
    function getRandomThemeId(): string {
      return themeIds[Math.floor(Math.random() * themeIds.length)]
    }