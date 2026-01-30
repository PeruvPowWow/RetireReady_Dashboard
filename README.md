# RetireReady Dashboard

A fintech-inspired retirement planning dashboard built with **React, TypeScript, and Tailwind CSS**.  
The app models employee contributions, employer match policies, and projected balances, with a clean participant/admin experience.

> Portfolio project — no backend required. State is persisted locally for a realistic UX.

---

## ✨ Features

- **Participant Dashboard**
  - Annual salary, contribution rate, and starting balance
  - Live calculation of employee contributions and employer match
  - 12-month projected balance estimate

- **Admin Mode**
  - Toggle to edit employer match policy
  - Match percentage and contribution cap controls
  - Changes immediately reflected in participant calculations

- **Activity Log**
  - Audit-style history of user and admin actions
  - Stored in `localStorage` (persists across reloads)
  - Clearable for testing/demo purposes

- **Polished UI**
  - Responsive layout
  - Reusable UI components
  - Tailwind-powered styling

---

## 🧠 Technical Highlights

- React + TypeScript for type-safe UI development
- Domain-focused calculation utilities (contributions, match caps, projections)
- Local persistence via `localStorage`
- Clean component architecture (Card, Field, Toggle)
- No backend — fast to run, easy to demo

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State Persistence:** localStorage

---

## 🚀 Running Locally

```bash
npm install
npm run dev
