# 🚀 BrainBuzz v3.0 - Deployment Guide

## 📦 Was ist neu?

- ⏱️ **Sichtbarer Timer** mit Countdown (30s)
- 🔢 **Mathe-Kategorie** (25 neue Fragen)
- 🔍 **Fehlersuche-Kategorie** (20 neue Fragen)
- ⭐ **Custom-Fragen** mit UI-Editor
- 🔔 **5-Sekunden Buzzer** (nicht mehr volle Zeit!)
- 📊 **NUR Bonus** für Custom-Kategorie

## 🎯 Quick Deploy auf Render.com

### Variante 1: Über Render Dashboard

1. **Gehe zu**: https://dashboard.render.com
2. **New** → **Web Service**
3. **Connect Repository** (oder Upload ZIP)
4. **Settings**:
   - Name: `brainbuzz`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Create Web Service**
6. Warte ~2 Minuten
7. **Fertig!** URL: `https://brainbuzz.onrender.com`

### Variante 2: Git Push (für bestehendes Projekt)

```bash
# In deinem Render Git Repository
cd /path/to/render-project

# Alles löschen
rm -rf *

# ZIP entpacken
unzip brainbuzz_v3.0.zip
mv quizmaster/* .
rm -rf quizmaster

# Deployen
git add .
git commit -m "🧠 Deploy BrainBuzz v3.0 - Timer System & neue Kategorien"
git push origin main
```

### Variante 3: Render CLI

```bash
# Install Render CLI (einmalig)
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

## 🧪 Lokales Testen

```bash
# ZIP entpacken
unzip brainbuzz_v3.0.zip
cd quizmaster

# Dependencies
npm install

# Starten
npm start

# Browser öffnen
# http://localhost:3000
```

## ✅ Deployment Checklist

- [ ] `npm install` läuft ohne Fehler
- [ ] `npm start` startet Server
- [ ] Port 3000 ist erreichbar
- [ ] Socket.io verbindet
- [ ] Spiel erstellen funktioniert
- [ ] Spieler beitreten funktioniert
- [ ] Timer ist sichtbar und läuft ab
- [ ] Custom-Fragen können erstellt werden
- [ ] Sounds funktionieren
- [ ] Final Scores Modal erscheint

## 🔧 Environment Variables (Optional)

```bash
# Render Dashboard → Environment
PORT=3000                    # Standard
NODE_ENV=production         # Empfohlen
```

## 📊 Nach dem Deployment

### URLs
- **App**: `https://your-app.onrender.com`
- **Health Check**: Öffne einfach die URL
- **Logs**: Render Dashboard → Logs

### Testen
1. Öffne App-URL
2. Erstelle Spiel als Host
3. Öffne zweiten Browser/Tab
4. Trete als Spieler bei
5. Starte Spiel
6. **Wichtig**: Timer muss sichtbar sein!

### Performance
- **Cold Start**: ~30 Sekunden (Free Tier)
- **Laufzeit**: Instant nach Aufwärmen
- **Socket.io**: Polling + WebSocket

## 🐛 Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "Port already in use"
```bash
# Andere App auf Port 3000?
PORT=3001 npm start
```

### Timer läuft nicht ab
- **Check**: Browser-Console für Errors
- **Check**: Socket.io connected?
- **Fix**: Hard-Refresh (Ctrl+Shift+R)

### Custom-Fragen speichern nicht
- **Check**: Server-Logs
- **Check**: Socket.io Events in Network-Tab
- **Fix**: Reconnect (F5)

### Sounds funktionieren nicht
- **Check**: Browser erlaubt Audio? (Auto-play Policy)
- **Fix**: Einmal auf Seite klicken
- **Toggle**: 🔊/🔇 Button testen

## 📈 Monitoring

### Render Dashboard
- **Metrics**: CPU, Memory, Network
- **Logs**: Real-time Server-Logs
- **Events**: Deployments, Crashes

### Health Checks
- **Endpoint**: `GET /`
- **Interval**: Alle 60s (Render)
- **Timeout**: 30s

## 🔄 Updates

### v3.0 → v3.1
```bash
# Backup alten Code
git tag v3.0

# Neue Version deployen
unzip brainbuzz_v3.1.zip
# ... deploy wie oben
```

## 🆘 Support

### Logs anschauen
```bash
# Render Dashboard
# → Your Service
# → Logs Tab
```

### Häufige Fehler

**"Game not found"**
- Spieler verwendet falschen Code
- Host hat Spiel bereits gestartet
- Session ist abgelaufen

**"Host disconnected"**
- Host hat Browser geschlossen
- Netzwerk-Problem
- Server-Restart

**Timer zeigt 0**
- Frage wurde bereits beantwortet
- Timeout bereits erfolgt
- Page-Refresh während Frage

## 📚 Weitere Docs

- [README.md](README.md) - Feature-Übersicht
- [CHANGELOG_v3.0.md](CHANGELOG_v3.0.md) - Was ist neu?
- [server.js](server.js) - Server-Code
- [public/index.html](public/index.html) - Frontend-Code

## 🎉 Viel Erfolg!

BrainBuzz v3.0 ist production-ready. Bei Fragen:
- Check Logs
- Check Console
- Check Network-Tab

**Happy Quizzing! 🧠**
