# AFX Ticket Command — Discord Bot Engine

Proprietary in-house Discord ticket bot for **Empirial [ ᴀғx ]** (`1439121933001035808`).

---

## ⚡ Features
- **Interactive Ticket Launcher Panel** with 4 departments:
  - 💰 Payout Desk
  - 🎓 Mentorship Inquiry
  - 💎 VIP Access
  - 🎫 General Support
- **Discord Modal Forms:** Collects Subject and Account ID before creating channels.
- **Private Channel Provisioning:** Isolated channel per ticket with locked permissions.
- **In-Channel Ticket Controls:**
  - `[🔒 Close Ticket]` — Triggers 5-second countdown, compiles full HTML transcript, logs to `#ticket-logs`, and auto-deletes channel.
  - `[🙋 Claim Ticket]` — Assigns staff member and updates embed.
  - `[📄 Transcript]` — Generates on-demand HTML transcript.
- **Slash Commands:**
  - `/ticket-panel` — Deploys the interactive launcher embed.
  - `/ticket-close [reason]` — Closes and archives the ticket.
  - `/ticket-transcript` — Generates on-demand transcript.

---

## 🚀 Setup & Launch (3 Steps)

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DISCORD_TOKEN` is set.

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy Slash Commands & Start
```bash
npm run deploy
npm start
```

---

## 📂 File Architecture
- `index.js` — Core Gateway bot client, modal handlers, button interaction dispatchers, and HTML transcript compiler.
- `deploy-commands.js` — REST script to register guild slash commands.
- `.env.example` — Configuration pre-filled with Empirial [AFX] server IDs.
