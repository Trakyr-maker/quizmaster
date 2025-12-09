# 🎯 QuizMaster

Multiplayer-Quiz-Spiel im Jeopardy-Style - genau wie Imposter aufgebaut!

## ✨ Features

- 🎮 Multiplayer-Lobby-System
- 📊 5 Kategorien × 5 Fragen (100-500 Punkte)
- 🔔 Buzzer-Mechanik
- 💯 Echtzeit-Punktestand
- 🎨 Modernes Design (wie Imposter)

## 🚀 Deployment

### Lokal

```bash
npm install
npm start
```

Öffne: http://localhost:3000

### Render.com

1. Repository auf GitHub pushen
2. Render.com → New Web Service
3. Repository verbinden
4. Auto-Deploy startet!

## 🎮 Spielablauf

1. **Host** erstellt Spiel → erhält 6-stelligen Code
2. **Spieler** treten mit Code bei
3. Host startet Spiel → zufälliger Startspieler
4. Aktueller Spieler wählt Frage
5. Alle Spieler können buzzen
6. Erster Buzzer darf antworten
7. Richtig = +Punkte, Falsch = -50%
8. Alle 25 Fragen = Spiel endet

## 📁 Struktur

```
quizmaster/
├── server.js          # Backend mit Socket.io
├── package.json
├── render.yaml
└── public/
    └── index.html     # Komplette App (CSS + JS inline!)
```

**Genau wie Imposter: Eine einzige HTML-Datei!**

## 🐛 Troubleshooting

**"Spiel nicht gefunden":**
- Server braucht 30-60 Sek zum Aufwachen (Render Free Tier)
- Code richtig eingegeben? (GROSSBUCHSTABEN)
- F12 → Console für Logs

**Socket verbindet nicht:**
- Hard Refresh: Strg+Shift+R
- 30 Sekunden warten nach erstem Aufruf
- Anderen Browser testen

## 🎨 Design

Basiert auf Imposter:
- Lila/Rosa Gradienten
- Glassmorphism-Effekt
- Space Grotesk Font
- Smooth Animations

---

**Entwickelt wie Imposter - funktioniert wie Imposter!** 🚀
