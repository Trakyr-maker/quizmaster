# QuizMaster - Deployment & Fehlerbehebung

## ✅ Was wurde gefixt:

### Technische Probleme:
1. **Socket.io Connection**: Verbesserte Konfiguration mit Reconnection-Logic
2. **Render.com Kompatibilität**: Build-Command angepasst (npm statt yarn)
3. **CORS & Transport**: Websocket und Polling aktiviert
4. **Debug-Endpoints**: `/health` und `/api/games` hinzugefügt

### Design:
- Komplett neues **Modern & Clean Design** im Discord/Slack-Stil
- Dunkles Theme mit cleanen Farben
- Moderne Typografie (Inter Font)
- Subtile Animationen und Hover-Effekte
- Bessere Kontraste und Lesbarkeit

## 🚀 Deployment auf Render.com

### Option 1: Automatisch (empfohlen)

1. **Code auf GitHub pushen:**
   ```bash
   git add .
   git commit -m "Update: Fixed connection & modern design"
   git push
   ```

2. **Auf Render.com:**
   - Gehe zu deinem Service Dashboard
   - Klicke "Manual Deploy" → "Deploy latest commit"
   - Oder warte auf Auto-Deploy (wenn aktiviert)

3. **Nach dem Deployment (2-3 Min):**
   - Öffne deine Render-URL
   - Teste das Spiel!

### Option 2: Neuer Service

Falls du neu deployst:
1. Render.com → New → Web Service
2. GitHub Repository verbinden
3. Einstellungen werden automatisch aus `render.yaml` geladen
4. "Create Web Service"

## 🧪 Testen nach Deployment

### 1. Server-Check
Öffne: `https://deine-app.onrender.com/health`

Sollte zeigen:
```json
{
  "status": "ok",
  "games": 0,
  "players": 0
}
```

### 2. Multiplayer-Test
- Tab 1: Host erstellt Spiel → bekommt Code
- Tab 2: Spieler tritt mit Code bei
- Beide sollten sich in der Lobby sehen

### 3. Debug bei Problemen
Öffne: `https://deine-app.onrender.com/api/games`
Zeigt alle aktiven Spiele

## 🔧 Fehlerbehebung

### Problem: "Spiel nicht gefunden"

**Ursachen:**
1. Server ist noch nicht ganz hochgefahren (Render Free Tier schläft nach 15 Min)
2. Falscher Raumcode eingegeben
3. Host hat Lobby verlassen

**Lösung:**
1. Warte 30 Sekunden nach dem ersten Aufruf der Seite
2. Prüfe ob Code korrekt ist (GROSSBUCHSTABEN)
3. Host soll neues Spiel erstellen

### Problem: Verbindungsfehler

**Lösung:**
1. F12 → Console → Nach Fehlern suchen
2. Hard-Refresh: Strg+F5 (Windows) / Cmd+Shift+R (Mac)
3. Anderen Browser testen

### Problem: Render Build schlägt fehl

**Lösung:**
1. In Render Dashboard → Environment → Check ob `NODE_ENV=production`
2. Build Command muss sein: `npm install`
3. Start Command muss sein: `node server.js`

## 📱 Lokal testen

```bash
# 1. Dependencies installieren
npm install

# 2. Server starten
npm start

# 3. Im Browser öffnen
http://localhost:3000
```

**Multi-Tab Test:**
- Tab 1: Host (Spiel erstellen)
- Tab 2: Spieler 1 (mit Code beitreten)
- Tab 3: Spieler 2 (mit Code beitreten)

## 🎨 Design-Anpassungen

Alle Farben sind in CSS-Variablen definiert in `style.css`:

```css
:root {
    --bg-primary: #36393f;      /* Haupthintergrund */
    --bg-secondary: #2f3136;    /* Karten/Container */
    --bg-accent: #5865f2;       /* Buttons, Highlights */
    --text-primary: #ffffff;    /* Haupttext */
}
```

Einfach die Werte ändern für andere Farben!

## 📊 Logs ansehen (Render)

1. Render Dashboard → dein Service
2. "Logs" Tab
3. Such nach Fehlern oder "Error"

## 🆘 Support

Falls es immer noch nicht funktioniert:
1. Console-Fehler (F12 → Console) screenshot
2. Server-Logs von Render kopieren
3. Beschreibe genau was passiert
