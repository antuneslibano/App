# ARISE

Um app de gamificação de vida real inspirado no "Sistema" de Solo Leveling. Cadastre missões diárias e pontuais, complete-as na vida real, ganhe XP, suba de nível, evolua atributos (Força, Vitalidade, Inteligência, Percepção, Agilidade) e avance de rank (E → S).

## Funcionalidades

- **Status do jogador**: nível, rank, barra de XP e radar de atributos.
- **Missões diárias**: reiniciam todo dia; mantêm sequência (streak).
- **Missões pontuais**: crie missões livres com dificuldade (E a S) e atributo associado.
- **Level up**: animação de tela cheia ao subir de nível, com pontos de atributo para distribuir.
- **Zona de penalidade**: opcionalmente perde XP ao deixar uma missão diária incompleta.
- **Histórico**: feed de eventos (missões concluídas, level ups, penalidades).
- Progresso salvo automaticamente no navegador (localStorage) — sem necessidade de backend ou login.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

## Build de produção

```bash
npm run build
```

## Stack

React + TypeScript + Vite, Tailwind CSS v4, Zustand (estado + persistência), Framer Motion (animações).
