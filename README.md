# ARISE

Um app de gamificação de vida real inspirado no "Sistema" de Solo Leveling. Cadastre missões diárias e pontuais, complete-as na vida real, ganhe XP, suba de nível, evolua atributos (Força, Vitalidade, Inteligência, Percepção, Agilidade) e avance de rank (E → S).

## Funcionalidades

- **Status do jogador**: nível, rank, barra de XP e radar de atributos.
- **Missões diárias, semanais e mensais**: geradas automaticamente pelo Sistema a partir de um banco de missões, sem precisar cadastrar nada. Diárias reiniciam à meia-noite, semanais todo domingo e mensais todo dia 1 — cada nível dá mais XP e é mais difícil que o anterior. Completar todas as missões do ciclo mantém uma sequência (streak); não completar reseta a sequência.
- **Missões pontuais**: crie missões livres com dificuldade (E a S) e atributo associado, para o que não é recorrente.
- **Level up**: animação de tela cheia ao subir de nível, com pontos de atributo para distribuir.
- **Zona de penalidade**: opcionalmente perde XP ao deixar uma missão do ciclo (diária/semanal/mensal) incompleta.
- **Histórico**: feed de eventos (missões concluídas, level ups, penalidades, novos ciclos).
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
