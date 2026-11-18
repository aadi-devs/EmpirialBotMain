# 🚀 Empirial [AFX] Ticket Command — Deployment & Setup Guide

This project contains the complete, production-ready **AFX Ticket Command System**, featuring:
1. **Administrator Web Management Dashboard** (React 19 + TanStack Router + Tailwind CSS v4)
2. **Proprietary Discord Bot Engine** (discord.js v14)

---

## 📁 Project Architecture

```
pixel-perfect-replica-main/
├── src/
│   ├── routes/
│   │   └── index.tsx          # Complete Admin Web Dashboard & Chat Drawer
│   ├── components/afx/
│   │   └── ticket-data.ts     # Ticket models, categories, & canned responses
│   └── styles.css             # AFX FinTech Dark Luxury Theme (OKLCH)
├── bot/
│   ├── index.js               # Discord Bot: Ticket Gateway & HTML Transcripts
│   ├── deploy-commands.js     # Slash Command Deployer (/ticket-panel)
│   ├── package.json           # Bot Dependencies
│   ├── .env.example           # Pre-configured AFX Server IDs
│   └── README.md              # Bot setup documentation
├── DEPLOYMENT_GUIDE.md        # This guide
└── package.json               # Dashboard Dependencies
```

---

## ⚡ Part 1: Running the Web Dashboard

### 1. Install & Launch
From the root directory:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 2. Dashboard Highlights
- **Active Admin Session:** Shows authenticated user `@itsmevictus.` (COO • Administrator Verified).
- **Simulate Non-Admin Button:** Click the top toggle to preview how unauthorized members are blocked with a `403 Forbidden` screen.
- **Interactive Ticket Drawer:** Click any ticket to read message history, send replies as staff, claim tickets, insert canned replies, or download offline HTML transcripts.
- **Panel Deployer & Analytics:** View the visual Discord panel and department volume distribution.

---

## 🤖 Part 2: Running the Discord Bot Engine

### 1. Navigate to the Bot Directory
```bash
cd bot
npm install
```

### 2. Configure Environment (`.env`)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your bot token:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=1559815748904292382
GUILD_ID=1439121933001035808
TICKET_LOGS_CHANNEL_ID=1459773192074952806
TICKET_CATEGORY_ID=1459772825576411146
STAFF_ROLE_IDS=1510617687229989025
```

### 3. Deploy Commands & Start
```bash
npm run deploy
npm start
```

### 4. Deploy Ticket Panel to Discord
In your desired Discord channel (e.g., `#create-ticket`), run:
```
/ticket-panel
```
The bot will post the branded interactive embed with buttons for **Payout Desk**, **Mentorship**, **VIP Access**, and **General Support**.

---

## 🔒 Security Gate: How Administrator Access is Enforced
The dashboard queries the Discord API on OAuth2 login and performs a bitwise permission check:
```typescript
const isAdministrator = (userPermissions & 0x8) === 0x8;
```
- **Admins (0x8):** Granted full access to tickets, logs, and controls.
- **Non-Admins:** Blocked at the OAuth2 gate with no access to ticket data or transcripts.
