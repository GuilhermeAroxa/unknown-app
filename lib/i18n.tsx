"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Language = "pt-BR" | "en"

type Translations = {
  [key in Language]: {
    [key: string]: string | { [key: string]: string }
  }
}

const translations: Translations = {
  "pt-BR": {
    common: {
      continue: "Continuar",
      submit: "Enviar",
      waiting: "Aguardando",
      start: "Iniciar",
      simulate: "Simular",
      newRound: "Nova Rodada",
    },
    home: {
      title: "INCOGNITO",
      subtitle: "Um jogo de dedução social onde blefe e estratégia se encontram",
      multiplayerTitle: "Multiplayer Local",
      multiplayerDesc: "Jogue com seus amigos em uma única sala",
      qrTitle: "QR Code",
      qrDesc: "Entre facilmente via celular escaneando o código",
      hostTitle: "Host via PC",
      hostDesc: "Uma pessoa cria e controla a sala pelo computador",
      createRoom: "Criar Sala (Host)",
      joinPlayer: "Entrar como Jogador",
    },
    host: {
      title: "Sala Criada",
      subtitle: "Compartilhe o código ou QR code com os jogadores",
      roomCode: "Código da Sala",
      players: "Jogadores",
      playersConnected: "jogador conectado",
      playersConnectedPlural: "jogadores conectados",
      startGame: "Iniciar Jogo",
      waitingPlayers: "Aguardando jogadores (mín. 3)",
    },
    join: {
      title: "Entrar na Sala",
      subtitle: "Digite seu nome e o código da sala",
      yourName: "Seu Nome",
      namePlaceholder: "Digite seu nome",
      roomCode: "Código da Sala",
      codePlaceholder: "Digite o código",
      joinButton: "Entrar",
    },
    roles: {
      citizen: "Cidadão",
      observer: "Observador",
      infiltrator: "Infiltrado",
      citizenDesc: "Você conhece o tema. Responda a pergunta e ordene as respostas para encontrar o infiltrado",
      observerDesc: "Você conhece o tema e pode revelar 1 número. Use isso para identificar o infiltrado",
      infiltratorDesc: "Você NÃO vê o tema e não tem número. Tente disfarçar sem responder a pergunta",
    },
    player: {
      welcome: "Bem-vindo",
      waitingHost: "Aguardando o host iniciar o jogo...",
      yourRole: "Seu Papel",
      secretNumber: "Seu Número Secreto",
      memorizeNumber:
        "Memorize este número! Após responder a pergunta, você precisará ordenar as respostas dos jogadores de 0 a 100.",
      roundTheme: "O Tema da Rodada é:",
      ready: "Pronto para Responder",
      youAreInfiltrator: "VOCÊ É O INFILTRADO!",
      infiltratorInfo:
        "Você não conhece o tema da rodada e não precisa responder a pergunta. Apenas observe e ordene as respostas!",
      identifyInfiltrator: "Responda a pergunta relacionada ao tema. Tente identificar quem é o infiltrado!",
      yourAnswer: "Sua Resposta",
      roundQuestion: "Pergunta da Rodada:",
      questionText: "Qual é a primeira coisa que você faria no tema desta rodada?",
      yourTheme: "Seu tema é ",
      yourNumber: "seu número é ",
      answerPlaceholder: "Escreva sua resposta aqui...",
      beCreative: "Seja criativo e convincente!",
      submitAnswer: "Enviar Resposta",
      answerSubmitted: "Resposta Enviada!",
      ready2: "Pronto!",
      waitingOthers: "Aguarde enquanto os outros jogadores respondem...",
      waitingAllPlayers: "Aguardando todos os jogadores responderem",
      yourAnswerWas: "Sua resposta:",
      simulateAll: "Simular: Todos Responderam",
      orderAnswers: "Ordene as Respostas",
      orderingInfo:
        "Arraste os cards para ordenar de 0 (topo) a 100 (base). A posição determina o número que você acha que cada jogador tem.",
      infiltratorOrderInfo: "Sua ordenação não conta no resultado final",
      observerOrderInfo: "Você pode revelar 1 número - clique em um card!",
      submitOrder: "Enviar Ordenação",
      orderSubmitted: "Ordenação Enviada!",
      waitingOrders: "Aguarde enquanto os outros jogadores ordenam as respostas...",
      simulateResults: "Simular: Ver Resultados",
      finalResult: "Resultado Final",
      citizensWon: "CIDADÃOS VENCERAM!",
      infiltratorWon: "INFILTRADO VENCEU!",
      correctOrder: "A ordenação estava correta! Os cidadãos identificaram os números.",
      incorrectOrder: "A ordenação estava incorreta! O infiltrado conseguiu confundir os cidadãos.",
      youWereInfiltrator: "Você era o infiltrado",
      won: "venceu",
      lost: "perdeu",
      correctOrderList: "Ordem Correta:",
      noAnswer: "(Sem resposta)",
      realNumber: "Real:",
    },
  },
  en: {
    common: {
      continue: "Continue",
      submit: "Submit",
      waiting: "Waiting",
      start: "Start",
      simulate: "Simulate",
      newRound: "New Round",
    },
    home: {
      title: "INCOGNITO",
      subtitle: "A social deduction game where bluffing and strategy meet",
      multiplayerTitle: "Local Multiplayer",
      multiplayerDesc: "Play with your friends in a single room",
      qrTitle: "QR Code",
      qrDesc: "Easily join via mobile by scanning the code",
      hostTitle: "Host via PC",
      hostDesc: "One person creates and controls the room from the computer",
      createRoom: "Create Room (Host)",
      joinPlayer: "Join as Player",
    },
    host: {
      title: "Room Created",
      subtitle: "Share the code or QR code with the players",
      roomCode: "Room Code",
      players: "Players",
      playersConnected: "player connected",
      playersConnectedPlural: "players connected",
      startGame: "Start Game",
      waitingPlayers: "Waiting for players (min. 3)",
    },
    join: {
      title: "Join Room",
      subtitle: "Enter your name and the room code",
      yourName: "Your Name",
      namePlaceholder: "Enter your name",
      roomCode: "Room Code",
      codePlaceholder: "Enter the code",
      joinButton: "Join",
    },
    roles: {
      citizen: "Citizen",
      observer: "Observer",
      infiltrator: "Infiltrator",
      citizenDesc: "You know the theme. Answer the question and order the answers to find the infiltrator",
      observerDesc: "You know the theme and can reveal 1 number. Use this to identify the infiltrator",
      infiltratorDesc:
        "You DON'T see the theme and don't have a number. Try to disguise yourself without answering the question",
    },
    player: {
      welcome: "Welcome",
      waitingHost: "Waiting for the host to start the game...",
      yourRole: "Your Role",
      secretNumber: "Your Secret Number",
      memorizeNumber:
        "Memorize this number! After answering the question, you'll need to order the players' answers from 0 to 100.",
      roundTheme: "The Round Theme is:",
      ready: "Ready to Answer",
      youAreInfiltrator: "YOU ARE THE INFILTRATOR!",
      infiltratorInfo:
        "You don't know the round's theme and don't need to answer the question. Just observe and order the answers!",
      identifyInfiltrator: "Answer the question related to the theme. Try to identify who is the infiltrator!",
      yourAnswer: "Your Answer",
      roundQuestion: "Round Question:",
      questionText: "What's the first thing you would do in this round's theme?",
      yourTheme: "Your theme is ",
      yourNumber: "your number is ",
      answerPlaceholder: "Write your answer here...",
      beCreative: "Be creative and convincing!",
      submitAnswer: "Submit Answer",
      answerSubmitted: "Answer Submitted!",
      ready2: "Ready!",
      waitingOthers: "Wait while other players answer...",
      waitingAllPlayers: "Waiting for all players to answer",
      yourAnswerWas: "Your answer:",
      simulateAll: "Simulate: All Answered",
      orderAnswers: "Order the Answers",
      orderingInfo:
        "Drag the cards to order from 0 (top) to 100 (bottom). The position determines the number you think each player has.",
      infiltratorOrderInfo: "Your ordering doesn't count in the final result",
      observerOrderInfo: "You can reveal 1 number - click on a card!",
      submitOrder: "Submit Order",
      orderSubmitted: "Order Submitted!",
      waitingOrders: "Wait while other players order the answers...",
      simulateResults: "Simulate: View Results",
      finalResult: "Final Result",
      citizensWon: "CITIZENS WON!",
      infiltratorWon: "INFILTRATOR WON!",
      correctOrder: "The ordering was correct! The citizens identified the numbers.",
      incorrectOrder: "The ordering was incorrect! The infiltrator managed to confuse the citizens.",
      youWereInfiltrator: "You were the infiltrator and",
      won: "won",
      lost: "lost",
      correctOrderList: "Correct Order:",
      noAnswer: "(No answer)",
      realNumber: "Real:",
    },
  },
}

type I18nContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt-BR")

  useEffect(() => {
    const savedLang = localStorage.getItem("incognito-lang") as Language
    if (savedLang && (savedLang === "pt-BR" || savedLang === "en")) {
      setLanguage(savedLang)
    }
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("incognito-lang", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k]
      } else {
        return key
      }
    }

    return typeof value === "string" ? value : key
  }

  return <I18nContext.Provider value={{ language, setLanguage: changeLanguage, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
