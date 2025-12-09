# 🎯 QuizMaster v2.0 - Host-Moderated Quiz

Multiplayer-Quiz mit Host als Moderator!

## ✨ Neue Features v2.0

### 🎙️ Host als Moderator
- Host spielt NICHT mit
- Host bewertet alle Antworten
- Host sieht immer die richtige Antwort
- Host steuert das Spiel

### ⚙️ Lobby-Einstellungen
- **Team-Modus** oder Einzelspieler
- Anzahl Teams (2-4)
- Frage-Zeit einstellbar
- Buzzer-Zeit nach falscher Antwort

### 🎮 Spielablauf

#### Einzelspieler-Modus:
1. Aktueller Spieler wählt Frage
2. **Dieser Spieler MUSS zuerst antworten**
3. Host bewertet die Antwort
4. **Bei falscher Antwort:**
   - Spieler verliert 50% Punkte
   - 10 Sekunden Buzzer-Phase für alle anderen
   - Andere können buzzern und antworten
   - Auch bei falscher Antwort: -50% Punkte
   - Nach 10 Sekunden: Frage gesperrt

#### Team-Modus:
1. Team wählt Frage gemeinsam
2. Team diskutiert und gibt Antwort
3. Host bewertet
4. **Bei falscher Antwort:**
   - Team verliert 50% Punkte
   - Gegnerteam bekommt Chance zu antworten

### 📊 Scoreboard
- **Einzelspieler:** Liste oben
- **Teams:** Links und rechts als Sidebars

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

## 🎨 Design
Basiert auf Imposter:
- Lila/Rosa Gradienten
- Glassmorphism
- Space Grotesk Font
- Smooth Animations

## 📝 Regeln

### Punkte:
- Richtig: +volle Punktzahl
- Falsch: -50% der Punktzahl
- Alle Fragen beantwortet = Spiel endet

### Host-Kontrolle:
- Host bewertet ALLE Antworten
- Host entscheidet richtig/falsch
- Spieler warten auf Host-Entscheidung

---

**v2.0 - Komplett überarbeitet mit Host-System!** 🎙️
