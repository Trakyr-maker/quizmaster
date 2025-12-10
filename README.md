# 🧠 BrainBuzz v3.0

Das ultimative Multiplayer-Quiz-Duell mit Host-Moderation, Custom-Fragen und intelligentem Timer-System!

## 🎯 Features

### Core Features
- **Host-Moderiertes System**: Ein Host steuert das Spiel, Spieler treten gegeneinander an
- **7 Kategorien**: Allgemeinwissen, Wissenschaft, Geschichte, Sport, Geographie, **Mathe**, **Fehlersuche**
- **140+ Fragen**: Große Fragenpool mit zufälliger Auswahl pro Spiel
- **3 Frage-Typen**: 
  - 📝 Text (normale Wissens-Fragen)
  - 🔢 Mathe (Rechenaufgaben mit steigendem Schwierigkeitsgrad)
  - 🔍 Fehlersuche (Finde den Fehler in Aussagen)

### Neue Features v3.0
- ⏱️ **Sichtbarer Timer**: Countdown läuft bei jeder Frage (30s Standard)
  - Grün → Gelb (10s) → Rot + Alarm (5s)
  - Timeout = falsche Antwort + Buzzer-Phase
- 🔔 **5-Sekunden Buzzer**: Nach falschen Antworten haben andere nur 5s Zeit
- 📊 **Intelligente Schwierigkeit**: 
  - 100P: Sehr leicht
  - 200P: Leicht
  - 300P: Mittel
  - 400P: Schwer
  - 500P: Sehr schwer
- ⭐ **Custom Fragen**: Host kann eigene Fragen erstellen
  - Mit UI-Editor (kein Coding nötig)
  - Custom-Kategorie mit **NUR Bonus-Punkten** (z.B. +50P statt 500P)
  - Konfigurierbar: 5/7/10 Fragen, Bonus 10-200P
  - Stern-Markierung ⭐ für Custom-Fragen

### Team-Modus
- 2-4 Teams möglich
- Automatische Spieler-Verteilung
- Team-Sidebars mit Live-Scores
- Rotation zwischen Teams

### Game Mechanics
- **Auto-Correct**: Exakte Antworten werden automatisch als richtig gewertet
- **Buzzer-System**: Nach falschen Antworten können andere buzzern (5 Sekunden!)
- **Punktesystem**:
  - Richtig: +Punkte
  - Falsch: -50% Punkte
  - Custom-Kategorie: NUR Bonus (nicht addiert!)
- **Sound-System**: Buzzer, Correct, Wrong, Tick, Fanfare
- **Final Scores**: Modal mit Medaillen 🥇🥈🥉

## 🚀 Installation

```bash
# Clone oder ZIP entpacken
cd brainbuzz

# Dependencies installieren
npm install

# Server starten
npm start
```

Server läuft auf `http://localhost:3000`

## 🎮 Spielablauf

1. **Host erstellt Spiel**
   - Name eingeben → "Als Host starten"
   - 6-stelliger Raum-Code wird generiert
   
2. **Host konfiguriert Settings**
   - Team-Modus: Ja/Nein, 2-4 Teams
   - Timer: Frage-Zeit (10-120s), Buzzer-Zeit (fest 5s)
   - Custom-Fragen: Limit (5/7/10), Bonus-Punkte (10-200)
   
3. **Host erstellt Custom-Fragen** (Optional)
   - Kategorie wählen (Standard oder ✨ Custom)
   - Typ wählen (Text/Mathe/Fehlersuche)
   - Frage & Antwort eingeben
   - Punktwert wählen (100-500)
   - **Wichtig**: Custom-Kategorie gibt NUR Bonus!

4. **Spieler treten bei**
   - "Als Spieler beitreten"
   - Raum-Code + Name eingeben
   
5. **Host startet Spiel**
   - Mindestens 2 Spieler erforderlich
   - Board wird mit 25 Fragen (5x5) generiert
   
6. **Spielrunde**
   - Aktueller Spieler/Team wählt Frage
   - **Timer startet (30s)!**
   - Spieler gibt Antwort
   - Auto-Correct oder Host bewertet
   - Bei falscher Antwort: **5-Sekunden Buzzer-Phase!**
   
7. **Spielende**
   - Alle 25 Fragen beantwortet
   - Final Scores Modal mit Medaillen

## 📋 Beispiel-Fragen

### Mathe (100-500P)
- 100P: `Rechne: 12 + 8` → `20`
- 300P: `Rechne: 20% von 150` → `30`
- 500P: `Rechne: √144 + 5³` → `137`

### Fehlersuche (100-500P)
- 100P: `Finde den Fehler: Es gibt siben Tage` → `FEHLER: siben | RICHTIG: sieben`
- 300P: `Finde den Fehler: Der 2. Weltkrieg endete 1944` → `FEHLER: 1944 | RICHTIG: 1945`
- 500P: `Finde den Fehler: Marie Curie entdeckte Penicillin` → `FEHLER: Marie Curie | RICHTIG: Alexander Fleming`

## 🎨 Features im Detail

### Timer-System
- **Frage-Timer**: 30 Sekunden (konfigurierbar)
  - Grüne Anzeige (normal)
  - Gelbe Anzeige (<10s) + Tick-Sound
  - Rote Anzeige (<5s) + Puls-Animation + Alarm
  - Bei Timeout: Falsche Antwort + Buzzer-Phase
  
- **Buzzer-Timer**: 5 Sekunden (fest!)
  - Nach falscher Antwort
  - Andere Spieler können buzzern
  - Gebuzzerte Spieler haben 5s zum Antworten
  - Nach 5s Buzzer-Timeout: Nächster Spieler

### Custom-Fragen System
1. **Standard-Kategorien**: Fragen ersetzen reguläre Fragen
2. **Custom-Kategorie**: Eigene Spalte mit **NUR Bonus-Punkten**
   - Beispiel: 500P-Frage in Custom = +50 Bonus (nicht 550!)
   - Konfigurierbar: 10-200 Bonus-Punkte
3. **Limit**: 5/7/10 Custom-Fragen wählbar
4. **Stern ⭐**: Alle Custom-Fragen markiert

### Sound-System
- 🔔 **Buzz**: Buzzer-Sound bei falschen Antworten
- ✅ **Correct**: Aufsteigende Töne
- ❌ **Wrong**: Absteigende Töne
- ⏱️ **Tick**: Sekunden-Tick bei niedrigem Timer
- 🎉 **Fanfare**: Game-End Melodie
- 🔊/🔇 **Toggle**: Sound an/aus Button

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: Vanilla JS, HTML5, CSS3
- **Audio**: Web Audio API (Tone-Generierung)
- **Deployment**: Render.com Ready

## 📦 Deployment (Render.com)

1. Erstelle neuen Web Service
2. Repository verbinden
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Deploy!

Oder mit CLI:
```bash
# In Render-Projekt-Verzeichnis
rm -rf *
unzip brainbuzz.zip
git add .
git commit -m "Deploy BrainBuzz v3.0"
git push
```

## 🆕 Changelog v3.0

### Neue Features
- ⏱️ Sichtbarer Timer mit Countdown und Farb-Codierung
- 🔢 Mathe-Kategorie mit 25 Rechenaufgaben
- 🔍 Fehlersuche-Kategorie mit 20 Error-Finding Fragen
- ⭐ Custom-Fragen System mit UI-Editor
- 🎯 Custom-Kategorie mit NUR Bonus-Punkten
- 🔔 5-Sekunden Buzzer-System (nicht mehr volle Zeit!)
- 📊 Intelligente Schwierigkeit 100P→500P

### Fixes
- Custom-Fragen bekommen NUR Bonus (nicht addiert)
- Fehlersuche-Format: "FEHLER: X | RICHTIG: Y"
- Kategorien shufflen NUR innerhalb eigener Kategorie
- Timer-Timeout löst Buzzer-Phase aus
- Gebuzzerte Spieler haben nur 5s (nicht volle Zeit)

### Verbesserungen
- 140+ Fragen (vorher: 25)
- 7 Kategorien (vorher: 5)
- Klarere Frage-Typen mit Badges
- Besseres Host-Interface

## 🎯 Geplante Features

- [ ] Mobile Optimierung
- [ ] Mehr Kategorien
- [ ] Statistiken & Achievements
- [ ] Spieler-Profile
- [ ] Replay-Funktion

## 📄 Lizenz

MIT License - Frei verwendbar!

## 👨‍💻 Autor

Daniel - Hochschule RheinMain
