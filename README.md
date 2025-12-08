# QuizMaster 🎯

Ein Multiplayer-Quiz-Spiel im Jeopardy-Stil mit Echtzeit-Kommunikation über Socket.io.

## Features

### Lobby-System
- **Host-Lobby**: Der Host kann ein Spiel erstellen und erhält einen einzigartigen Raumcode
- **Spieler-Lobby**: Spieler können mit dem Raumcode beitreten
- **Einstellungen**:
  - Team-Modus (geplant)
  - Timer aktivieren/deaktivieren
  - Zeit pro Frage einstellen

### Spielmechanik
- **5 Kategorien** mit je **5 Fragen** (100, 200, 300, 400, 500 Punkte)
- **Zufälliger Startspieler** wird ausgewählt
- **Fragenauswahl**: Der aktuelle Spieler wählt eine Frage aus
- **Buzzer-System**: 
  - Alle Spieler können buzzern um zu antworten
  - Nur ein Buzz pro Spieler pro Frage möglich
- **Punktevergabe**:
  - Richtige Antwort: +volle Punktzahl
  - Falsche Antwort: -50% der Punktzahl
- **Live-Scoreboard**: Zeigt alle Spieler mit ihren Punkten
- **Abgeschlossene Fragen** werden ausgegraut und sind nicht mehr wählbar
- **Spielende**: Wenn alle Fragen beantwortet sind, wird der Gewinner angezeigt

## Installation

### Lokal ausführen

1. Repository klonen oder herunterladen
2. Dependencies installieren:
```bash
npm install
```

3. Server starten:
```bash
npm start
```
oder für Entwicklung mit Auto-Reload:
```bash
npm run dev
```

4. Im Browser öffnen: `http://localhost:3000`

## Deployment auf Render.com

1. Repository auf GitHub hochladen
2. Bei Render.com anmelden
3. "New Web Service" erstellen
4. GitHub Repository verbinden
5. Render erkennt automatisch die `render.yaml` Konfiguration
6. Deploy starten

## Technologie-Stack

- **Backend**: Node.js + Express.js + Socket.io
- **Frontend**: Vanilla JavaScript + HTML5 + CSS3
- **Echtzeit-Kommunikation**: Socket.io
- **Deployment**: Render.com

## Projektstruktur

```
quizmaster/
├── server.js              # Hauptserver mit Socket.io-Logik
├── package.json           # NPM Dependencies
├── render.yaml            # Render.com Deployment-Config
├── public/
│   ├── index.html         # Startseite (Erstellen/Beitreten)
│   ├── lobby.html         # Lobby-Screen
│   ├── game.html          # Spiel-Screen
│   ├── style.css          # Globales Styling
│   ├── client.js          # Startseiten-Logik
│   ├── lobby.js           # Lobby-Logik
│   └── game.js            # Spiel-Logik
```

## Spielablauf

1. **Host erstellt Spiel**
   - Gibt seinen Namen ein
   - Erhält einen 6-stelligen Raumcode

2. **Spieler treten bei**
   - Geben Raumcode und Namen ein
   - Werden zur Lobby hinzugefügt

3. **Host konfiguriert Einstellungen**
   - Team-Modus (optional)
   - Timer-Einstellungen

4. **Spiel startet**
   - Zufälliger Spieler wird ausgewählt
   - Spielbrett mit 5x5 Fragen wird angezeigt

5. **Spielrunden**
   - Aktueller Spieler wählt eine Frage
   - Frage wird allen angezeigt
   - Spieler können buzzern
   - Gebuzzerter Spieler gibt Antwort
   - Punkte werden verteilt
   - Nächster Spieler ist dran

6. **Spielende**
   - Alle Fragen sind beantwortet
   - Finale Punktestände werden angezeigt
   - Gewinner wird gekrönt

## Erweiterungsmöglichkeiten

- Eigene Fragen hochladen (JSON)
- Team-Modus implementieren
- Verschiedene Schwierigkeitsgrade
- Zeitlimit pro Frage
- Sound-Effekte
- Chat-Funktion
- Statistiken und Historie

## Lizenz

MIT License
