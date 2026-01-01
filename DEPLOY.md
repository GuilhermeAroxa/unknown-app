# Guia de Deploy - INCOGNITO

## 📋 Requisitos

- Node.js 18+
- Redis (desenvolvimento local ou serviço cloud)
- Gerenciador de pacotes: npm, yarn ou pnpm
- Conta no GitHub

## 🚀 Deploy Automático com GitHub + Vercel (Recomendado)

### 1. Preparar o Repositório GitHub

```bash
# Se ainda não tem um repositório:
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub (vá em github.com/new)
# Depois conectar:
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

### 2. Conectar Vercel ao GitHub

#### Opção A: Via Interface Web (Mais Fácil)

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório do seu jogo
5. Configure as variáveis de ambiente:
   - Clique em **"Environment Variables"**
   - Adicione: `REDIS_URL` com a URL do seu Redis (veja seção Upstash abaixo)
6. Clique em **"Deploy"**

**Pronto!** A partir de agora:
- Todo `git push` para branch `main` → Deploy automático em produção
- Pull Requests → Deploy de preview automático
- Você receberá uma URL tipo: `seu-projeto.vercel.app`

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Na pasta do projeto:
vercel

# Seguir o wizard e conectar ao GitHub
# Adicionar variáveis de ambiente:
vercel env add REDIS_URL
# Cole a URL do Redis quando solicitado

# Deploy em produção:
vercel --prod
```

### 3. Configurar Upstash Redis (Gratuito)

1. Acesse https://upstash.com e crie uma conta
2. Clique em **"Create Database"**
3. Escolha:
   - Type: **Redis**
   - Region: Escolha a mais próxima dos seus usuários
   - Name: `incognito-redis` (ou qualquer nome)
4. Após criado, copie a **"REDIS_URL"** (formato: `rediss://...`)
5. Adicione no Vercel:
   - Vercel Dashboard → Seu Projeto → **Settings** → **Environment Variables**
   - Name: `REDIS_URL`
   - Value: Cole a URL copiada
   - Click **"Save"**

### 4. Testar o Deploy

1. Acesse a URL fornecida pela Vercel (ex: `seu-projeto.vercel.app`)
2. Teste criar uma sala e jogar

### 5. Fluxo de Trabalho (Depois de Configurado)

```bash
# Fazer alterações no código
git add .
git commit -m "feat: adiciona nova funcionalidade"
git push origin main

# Vercel detecta automaticamente e faz deploy em ~2 minutos
# Você recebe notificação por email quando concluir
```

---

## 🔄 Deploy Automático - Branches e Ambientes

### Branch Strategy

**Vercel deploy automático:**
- `main` → Produção (seu-projeto.vercel.app)
- Outras branches → Preview (unique-url.vercel.app)
- Pull Requests → Preview com comentário automático no PR

### Exemplo de Workflow

```bash
# Criar branch para feature
git checkout -b feature/nova-funcionalidade

# Fazer alterações
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub
# Vercel automaticamente cria um preview deploy
# Testar no preview URL
# Merge no main → Deploy automático em produção
```

---

## 🔧 Configurar Domínio Customizado (Opcional)

### Na Vercel:

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio: `seudominio.com`
3. Siga as instruções para apontar DNS:
   - **Tipo A**: `76.76.21.21`
   - **Tipo CNAME**: `cname.vercel-dns.com`
4. Aguarde propagação (pode levar até 48h)
5. SSL é configurado automaticamente pela Vercel

---

## 🛠️ Alternativa: Railway (Deploy Completo)

### Se preferir tudo em um só lugar (sem Upstash separado):

1. Acesse https://railway.app
2. Login com GitHub
3. **"New Project"** → **"Deploy from GitHub repo"**
4. Selecione seu repositório
5. Railway detecta Next.js automaticamente
6. Adicione Redis:
   - Clique **"+ New"** → **"Database"** → **"Add Redis"**
7. Conecte ao projeto:
   - Settings do projeto Next.js → Variables
   - Adicione: `REDIS_URL = ${{Redis.REDIS_URL}}`
8. Deploy automático configurado!

**Railway também faz deploy automático** a cada push no GitHub.

---

## 📊 Monitoramento de Deploys

### Vercel Dashboard
- Ver logs em tempo real
- Analytics de performance
- Histórico de deploys
- Rollback com um clique

### Acessar Logs:
```bash
# Via CLI
vercel logs

# Ou no dashboard: vercel.com/seu-usuario/seu-projeto
```

---

## ❌ Cancelar Deploy Automático (se necessário)

### Temporariamente:
No Vercel Dashboard → Settings → Git → Pause Automatic Deployments

### Branches específicas:
Settings → Git → Ignored Build Step → Adicionar lógica customizada

---

## 🐛 Troubleshooting

### Deploy falha com "Redis connection error"
- Verifique se `REDIS_URL` está configurada nas Environment Variables
- Para Upstash, use `rediss://` (com 's' no final)
- Teste a conexão do Redis no Upstash Dashboard

### Deploy demora muito
- Vercel normalmente leva 1-3 minutos
- Se passar de 5 minutos, verifique os logs

### Mudanças não aparecem
- Verifique se o commit foi feito: `git log`
- Verifique se o push foi feito: `git push origin main`
- Aguarde ~2 minutos para o deploy completar
- Force rebuild no Vercel Dashboard se necessário

---

## 💡 Dicas de Produção

1. **Use Preview Deploys**: Teste features em URLs temporárias antes do deploy em produção
2. **Configure Webhooks**: Notificações no Discord/Slack quando deploy completar
3. **Proteção de Branch**: Configure no GitHub para exigir PR reviews antes de merge em main
4. **Environment Variables por Ambiente**: Vercel permite diferentes valores para Production/Preview/Development
5. **Analytics**: Ative Vercel Analytics para ver performance real dos usuários

---

## 📞 Links Úteis

- Vercel Dashboard: https://vercel.com/dashboard
- Documentação Vercel: https://vercel.com/docs
- Upstash Dashboard: https://console.upstash.com
- Railway Dashboard: https://railway.app/dashboard
- Next.js Deploy Docs: https://nextjs.org/docs/deployment

---

## ✅ Checklist Pós-Deploy

- [ ] Repositório GitHub criado e código pushado
- [ ] Vercel conectado ao repositório
- [ ] Redis configurado (Upstash ou Railway)
- [ ] `REDIS_URL` adicionada nas variáveis de ambiente
- [ ] Deploy inicial funcionando
- [ ] Testado criar sala e jogar
- [ ] Domínio customizado configurado (opcional)
- [ ] Branch protection configurada no GitHub (opcional)
