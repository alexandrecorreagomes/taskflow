# ✅ TaskFlow — Lista de Tarefas

Aplicação web moderna para gerenciamento de tarefas com autenticação real, categorias personalizadas e persistência em nuvem via Supabase.

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com Supabase Auth (email + senha)
- 📋 **Gerenciamento de tarefas** — criar, completar, deletar com prioridades (Alta / Média / Baixa)
- 🏷️ **Categorias personalizadas** com cores distintas
- 📅 **Visão de calendário** — tarefas organizadas por data
- 📊 **Painel de análise** — estatísticas e progresso
- 🔒 **Dados isolados por usuário** via Row Level Security (RLS) do Supabase

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Interface |
| TypeScript | 6 | Tipagem |
| Vite | 8 | Build tool |
| Tailwind CSS | 4 | Estilização |
| Supabase | 2 | Auth + Banco de dados |
| Lucide React | latest | Ícones |

## 🚀 Como executar localmente

### Pré-requisitos

- Node.js 18+
- Uma conta no [Supabase](https://supabase.com)

### 1. Clone o repositório

```bash
git clone https://github.com/alexandrecorreagomes/taskflow.git
cd taskflow
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

> As credenciais estão disponíveis em: **Supabase Dashboard → Project Settings → API**

### 4. Configure o banco de dados

Execute as seguintes migrations no **Supabase SQL Editor**:

```sql
-- Tabela de categorias
CREATE TABLE categories (
  id           TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  color        TEXT NOT NULL,
  text_color   TEXT NOT NULL,
  border_color TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Tabela de tarefas
CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  completed   BOOLEAN DEFAULT false,
  category_id TEXT,
  priority    TEXT NOT NULL DEFAULT 'média',
  due_date    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "categories_owner" ON categories FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_owner" ON tasks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── AnalyticsTab.tsx   # Painel de análise
│   ├── CalendarTab.tsx    # Visão de calendário
│   ├── CategoryManager.tsx # Gerenciador de categorias
│   ├── Login.tsx          # Tela de login/cadastro
│   ├── Navbar.tsx         # Barra de navegação
│   ├── TaskItem.tsx       # Item de tarefa individual
│   └── TaskTab.tsx        # Aba principal de tarefas
├── services/
│   ├── db.ts              # Camada de acesso ao banco (Supabase)
│   └── supabase.ts        # Cliente Supabase
├── App.tsx                # Componente raiz + gestão de sessão
└── main.tsx               # Ponto de entrada
```

## 🔒 Segurança

- Credenciais armazenadas em variáveis de ambiente (`.env`)
- Row Level Security (RLS) ativo — cada usuário acessa apenas seus dados
- Autenticação via JWT gerenciada pelo Supabase

## 📄 Licença

MIT © [Alexandre Correa Gomes](https://github.com/alexandrecorreagomes)
