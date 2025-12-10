# 🧠 BrainBuzz v3.1.1

Das ultimative Multiplayer-Quiz-Duell mit Host-Moderation, Random Categories und Bonus-System!

## 🆕 v3.1.1 Hotfix
- 🐛 **CRITICAL FIX**: Error-Hints nur noch für Host sichtbar (waren versehentlich für alle sichtbar)
- 🎙️ Klarere Labels: "NUR FÜR HOST SICHTBAR"
- ✅ Spieler müssen jetzt selbst herausfinden, was falsch ist!

## 🎯 Highlights v3.1

- 🎲 **5 zufällige Kategorien** aus 7 pro Spiel - jedes Spiel ist anders!
- 🔍 **Vereinfachte Fehlersuche** mit zwei Modi (offensichtlich & komplex)
- 🎯 **Bonus-System** für Fehlersuche-Fragen (bis zu +150 Punkte)
- ⏱️ **Sichtbarer Timer** mit Countdown (30s Standard)
- 🔔 **5-Sekunden Buzzer** nach falschen Antworten

## 🎮 Core Features

### Random Category System ⭐ NEU v3.1
- **7 Kategorien verfügbar**: Allgemeinwissen, Wissenschaft, Geschichte, Sport, Geographie, Mathe, Fehlersuche
- **5 zufällig gewählt** pro Spiel
- **+ Optional Custom** als 6. Kategorie
- **Jedes Spiel anders!** Keine Repetition

### Fehlersuche mit Bonus-System ⭐ NEU v3.1

**Offensichtliche Fehler** (100-300P):
```
Frage: "Ein Fußballspiel dauert 60 Minuten"
Hint: "❌ Fehler hier: 60 Minuten"
Antwort: "90" → +300 Punkte
```

**Komplexe Fehler** (400-500P + Bonus):
```
Frage: "Marie Curie entdeckte Penicillin - Richtig oder Falsch?"
Schritt 1: "Falsch" → +500 Punkte (Basis)
Schritt 2 (Optional): "Was ist richtig?"
         "Alexander Fleming" → Host vergibt bis zu +150 Bonus!
Total: Bis zu 650 Punkte!
```

### 140+ Fragen
- **Text-Fragen**: Normale Wissens-Fragen
- **Mathe-Fragen**: Rechenaufgaben mit Schwierigkeitsgrad
- **Fehlersuche**: Finde & korrigiere Fehler

### Intelligente Schwierigkeit
- **100P**: Sehr leicht (Grundwissen)
- **200P**: Leicht (bekannte Fakten)
- **300P**: Mittel (solides Wissen)
- **400P**: Schwer (Spezialwissen) + Bonus-Chance
- **500P**: Sehr schwer (Expertenwissen) + Bonus-Chance

### Custom-Fragen
- **UI-Editor**: Ohne Coding eigene Fragen erstellen
- **3 Typen**: Text, Mathe, Fehlersuche
- **Custom-Kategorie**: NUR Bonus-Punkte (z.B. 50P statt 500P)
- **Limit**: 5/7/10 Fragen
- **Stern ⭐**: Markierung für Custom-Fragen

### Timer-System
- **Frage-Timer**: 30s Countdown (konfigurierbar)
  - Grün → Gelb (10s) → Rot + Alarm (5s)
  - Timeout = falsche Antwort + Buzzer-Phase
- **Buzzer-Timer**: 5s für andere Spieler (fest!)
- **Buzzer-Antwort**: Gebuzzerte Spieler haben 5s

### Team-Modus
- **2-4 Teams** möglich
- Automatische Spieler-Verteilung
- Team-Sidebars mit Live-Scores
- Rotation zwischen Teams

### Game Mechanics
- **Auto-Correct**: Exakte Antworten automatisch richtig
- **Buzzer-System**: 5s für andere nach falschen Antworten
- **Punktesystem**:
  - Richtig: +Punkte
  - Falsch: -50% Punkte
  - Bonus: 0-150P extra (bei Fehlersuche-Complex)
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
   - Timer: Frage-Zeit (10-120s)
   - Custom-Fragen: Limit (5/7/10), Bonus-Punkte (10-200)
   
3. **Host erstellt Custom-Fragen** (Optional)
   - Kategorie wählen (7 Standard oder ✨ Custom)
   - Typ wählen (Text/Mathe/Fehlersuche)
   - Frage & Antwort eingeben
   - Punktwert wählen (100-500)

4. **Spieler treten bei**
   - "Als Spieler beitreten"
   - Raum-Code + Name eingeben
   
5. **Host startet Spiel**
   - System wählt **5 zufällige Kategorien** aus 7!
   - Board wird mit 25 Fragen (5x5) generiert
   
6. **Spielrunde**
   - Aktueller Spieler/Team wählt Frage
   - **Timer startet (30s)!**
   - Bei Fehlersuche-Offensichtlich: Hint wird angezeigt
   - Spieler gibt Antwort
   - Bei Fehlersuche-Complex: Optional Bonus-Frage
   - Bei falscher Antwort: **5-Sekunden Buzzer-Phase!**
   
7. **Spielende**
   - Alle 25 Fragen beantwortet
   - Final Scores Modal mit Medaillen

## 📋 Beispiel-Fragen

### Mathe (100-500P)
- **100P**: `Rechne: 12 + 8` → `20`
- **300P**: `Rechne: 20% von 150` → `30`
- **500P**: `Rechne: √144 + 5³` → `137`

### Fehlersuche Offensichtlich (100-300P)
- **100P**: `Ein Fußballspiel dauert 60 Minuten`
  - Hint: `60 Minuten`
  - Antwort: `90`
  
- **300P**: `Der 2. Weltkrieg endete 1944`
  - Hint: `1944`
  - Antwort: `1945`

### Fehlersuche Komplex (400-500P + Bonus)
- **500P**: `Marie Curie entdeckte Penicillin - Richtig oder Falsch?`
  - Schritt 1: `Falsch` → +500P
  - Schritt 2 (Bonus): `Alexander Fleming` → +150P
  - **Total**: 650 Punkte!

## 🎨 Features im Detail

### Random Categories
**Jedes Spiel ist anders!**

```
Spiel 1: Allgemeinwissen, Mathe, Sport, Geographie, Fehlersuche
Spiel 2: Wissenschaft, Geschichte, Mathe, Sport, Geographie
Spiel 3: Allgemeinwissen, Wissenschaft, Geschichte, Fehlersuche, Sport
```

- 7 Kategorien verfügbar
- 5 zufällig pro Spiel
- + Optional Custom als 6. Kategorie
- Shuffle NUR innerhalb Kategorie

### Fehlersuche Bonus-System
**Zwei-Stufen-Belohnung:**

1. **Basis-Punkte**: Für "Richtig/Falsch" korrekt erkennen
2. **Bonus-Punkte**: Für richtige Korrektur

**Host-Kontrolle:**
- Host bewertet Bonus-Antwort
- Host vergibt 0-150 Bonus-Punkte
- Teilpunkte möglich für teilweise richtige Antworten

**Spieler-Option:**
- Kann Bonus-Frage überspringen
- Behält Basis-Punkte

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
unzip brainbuzz_v3.1.zip
mv quizmaster/* .
git add .
git commit -m "Deploy BrainBuzz v3.1"
git push
```

## 🆕 Changelog

### v3.1 (Aktuell)
- ✨ **5 zufällige Kategorien** aus 7 pro Spiel
- 🎯 **Bonus-System** für Fehlersuche (0-150P extra)
- 🔍 **Zwei Modi** für Fehlersuche (offensichtlich & komplex)
- 💡 **Error Hints** bei offensichtlichen Fehlern
- 🎛️ **Host-Kontrolle** für Bonus-Vergabe

### v3.0
- ⏱️ Sichtbarer Timer mit Countdown
- 🔢 Mathe-Kategorie mit 25 Fragen
- 🔍 Fehlersuche-Kategorie mit 20 Fragen
- ⭐ Custom-Fragen System mit UI-Editor
- 🔔 5-Sekunden Buzzer-System

### v2.2
- 🔊 Sound-System
- 🏆 Final Scores Modal
- 🎯 Auto-Correct System
- 🔄 Board Updates

## 🎯 Geplante Features

- [ ] Bonus-Stufen (0, 50, 100, 150)
- [ ] Mehr Fehlersuche-Fragen
- [ ] Mobile Optimierung
- [ ] Statistiken & Achievements
- [ ] Replay-Funktion

## 📄 Lizenz

MIT License - Frei verwendbar!

## 👨‍💻 Autor

Daniel - Hochschule RheinMain

---

**Version**: 3.1.0
**Release**: 10. Dezember 2025
**Status**: ✅ Production Ready
