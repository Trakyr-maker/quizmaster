# 🧠 BrainBuzz v3.0 - MAJOR UPDATE

## 🎉 Das große Update!

**Release Date:** Dezember 2025

---

## ✨ Neue Features

### 1. 🏷️ Rebranding: "QuizMaster" → "BrainBuzz"

**Warum?**
- Einprägsamer, moderner Name
- Spiegelt das Buzzer-Mechanic wider
- Professional branding

**Änderungen:**
- Alle Titel & UI-Texte
- Tab-Title: "BrainBuzz - Das ultimative Quiz-Duell"
- Logo & Branding

---

### 2. 🔀 Intelligentes Fragen-System

**Großer Fragen-Pool:**
- **Vorher:** 5 fixe Fragen pro Kategorie
- **Jetzt:** 4-6 Fragen pro Punktwert, random gewählt
- **Result:** Jedes Spiel ist anders!

**Implementierung:**
```javascript
allgemeinwissen: {
  100: [6 leichte Fragen] → wähle 1 random
  200: [5 mittlere Fragen] → wähle 1 random
  ...
}
```

**Vorteile:**
- Hoher Wiederspielwert
- Keine Wiederholungen
- Einfach erweiterbar

---

### 3. 🎯 Verschiedene Fragetypen

#### 📝 Text (wie vorher)
- Normale Wissensfragen
- Alle Schwierigkeitsgrade

#### 🔢 Mathe (NEU!)
**Schwierigkeitsskalierung:**

| Punkte | Schwierigkeit | Beispiele |
|--------|--------------|-----------|
| 100P | Sehr leicht | `12 + 8`, `5 × 4` |
| 200P | Leicht | `15 × 6 - 12`, `144 ÷ 12` |
| 300P | Mittel | `20% von 150`, `3/4 von 80` |
| 400P | Schwer | `15² - 50`, `30% von 240 + 18` |
| 500P | Sehr schwer | `√144 + 5³`, `40% von 350 - 15% von 200` |

**Features:**
- Brüche, Prozent, Potenzen, Wurzeln
- Mehrere Operationen kombiniert
- Auto-Correct funktioniert perfekt!

#### 🔍 Fehlersuche (NEU!)
**Schwierigkeitsskalierung:**

| Punkte | Art | Beispiel |
|--------|-----|----------|
| 100-200P | Rechtschreibung | "Berk" → "Berg" |
| 200-300P | Faktenfehler | "Paris liegt in Italien" |
| 400-500P | Logikfehler | "Einstein erfand Penicillin" |

---

### 4. 📝 Custom-Fragen System

**Host kann eigene Fragen erstellen!**

#### UI-Editor:
```
┌─────────────────────────────────┐
│ Custom Frage hinzufügen         │
├─────────────────────────────────┤
│ Kategorie:     [Dropdown]       │
│ Typ:          [📝 Text]         │
│ Frage:        [____________]    │
│ Antwort:      [____________]    │
│ Punktwert:    [300]             │
│                                 │
│ [Hinzufügen] [Abbrechen]       │
└─────────────────────────────────┘
```

#### Features:
- ✅ Limit: 5-10 Fragen (einstellbar)
- ✅ Alle 3 Typen wählbar
- ✅ Punkte frei wählbar (100-500)
- ✅ In bestehende Kategorien ODER...
- ✅ **Custom-Kategorie** mit Bonus!

#### Custom-Kategorie:
- Erstellt eigene Spalte im Board
- Gibt **Bonus-Punkte** (Standard: +50, einstellbar 0-200)
- Visuell hervorgehoben (⭐ Sterne)

**Beispiel:**
```
Standard-Frage: 500P = 500 Punkte
Custom-Frage: 500P + 50 Bonus = 550 Punkte!
```

---

## 🎨 UI/UX Verbesserungen

### Neue Elemente:
- **Typen-Badges:** Zeigen Fragetyp an (📝 TEXT, 🔢 MATHE, 🔍 FEHLER)
- **Custom-Marker:** ⭐ Stern auf Custom-Fragen
- **Custom-Kategorie:** Gold-Header mit ✨
- **Bonus-Anzeige:** "+50 ⭐" bei Custom-Kategorie-Fragen

### Custom-Fragen Liste:
```
╔════════════════════════════════════╗
║ 📝 Custom Fragen (3/5)             ║
╠════════════════════════════════════╣
║ 1. Wissenschaft | Mathe | 300P    ║
║    "Was ist 127 + 58?"             ║
║    [🗑️ Löschen]                    ║
║ ────────────────────────────────   ║
║ 2. Custom | Text | 500P            ║
║    ⭐ Bonus! "Wann wurde..."       ║
║    [🗑️ Löschen]                    ║
╚════════════════════════════════════╝
```

---

## 📊 Fragen-Statistik

**Neue Fragen hinzugefügt:**
- **Allgemeinwissen:** 30 Fragen (6 pro Punktwert)
- **Wissenschaft:** 30 Fragen
- **Geschichte:** 24 Fragen
- **Sport:** 24 Fragen
- **Geographie:** 30 Fragen

**Total:** ~140 Fragen (vorher: 25)

**Mix:**
- 60% Text
- 25% Mathe
- 15% Fehlersuche

---

## 🔧 Technische Änderungen

### Server:
- Shuffle-System für Fragen-Pool
- Custom-Fragen Events (`add-custom-question`, `remove-custom-question`)
- Bonus-Punkte Berechnung
- Custom-Kategorie Logic

### Frontend:
- Custom-Fragen Modal
- Typen-Badges Rendering
- Custom-Marker Animation
- Bonus-Punkte Display

### Dateigröße:
- **Server:** 14KB → 26KB (+12KB)
- **Frontend:** 38KB → 58KB (+20KB)
- **Total:** 52KB → 84KB

---

## 🐛 Bugfixes

### Aus v2.2:
- ✅ Host kann nicht buzzern
- ✅ Fragen werden ausgegraut
- ✅ Auto-Correct funktioniert
- ✅ Buzzer-Filter für bereits antwortende Spieler
- ✅ Spieler-Rotation

### Neu in v3.0:
- ✅ Board-Rendering mit variablen Kategorien
- ✅ Custom-Fragen Synchronisation
- ✅ Bonus-Punkte Calculation
- ✅ Typ-Badge Auto-Update

---

## 📦 Deployment

### Neue Dateien:
- `server.js` - Erweitert mit Custom-Fragen System
- `public/index.html` - Custom-Fragen UI
- `package.json` - Name: "brainbuzz"
- `render.yaml` - Name: "brainbuzz"
- `README.md` - Komplett neu
- `CHANGELOG_v3.0.md` - Diese Datei

### Deploy-Schritte:
```bash
rm -rf *                  # Alte Version löschen
# Neue ZIP entpacken
git add .
git commit -m "v3.0 - BrainBuzz: Custom-Fragen, Typen, Pool-System"
git push
```

---

## 🧪 Testing Checklist

### Custom-Fragen:
- [ ] Host kann Frage hinzufügen
- [ ] Limit funktioniert (5/7/10)
- [ ] Löschen funktioniert
- [ ] Custom-Kategorie erscheint im Board
- [ ] Bonus-Punkte werden korrekt berechnet

### Fragetypen:
- [ ] Text-Fragen funktionieren
- [ ] Mathe-Fragen werden akzeptiert
- [ ] Fehlersuche-Fragen funktionieren
- [ ] Typ-Badges werden korrekt angezeigt
- [ ] Auto-Correct funktioniert für alle Typen

### Shuffle:
- [ ] Jedes Spiel hat andere Fragen
- [ ] Alle Punktwerte werden gefüllt
- [ ] Custom-Fragen werden richtig eingemischt

### Bonus:
- [ ] Custom-Kategorie gibt Bonus
- [ ] Bonus wird in UI angezeigt
- [ ] Bonus wird korrekt zu Punkten addiert
- [ ] Einstellbar in Lobby

---

## 🎯 Migration von v2.2

**Breaking Changes:**
- Servername: "quizmaster" → "brainbuzz"
- package.json name geändert
- render.yaml name geändert

**Kompatibel:**
- Alte Spiele bleiben funktionsfähig
- Keine Datenbank-Migration nötig
- Socket.io Events unverändert

**Empfehlung:**
- Komplettes Redeploy (nicht Update)
- Neue URL: brainbuzz.onrender.com

---

## 💡 Verwendung

### Als Host:
1. Starte Spiel
2. (Optional) Erstelle Custom-Fragen in Lobby
3. Konfiguriere Einstellungen (Team-Modus, Bonus, etc.)
4. Starte Spiel
5. Moderiere & bewerte Antworten

### Als Spieler:
1. Trete mit Code bei
2. Spiele mit!
3. Buzzere bei falschen Antworten
4. Sammle Punkte

---

## 🎓 Best Practices

### Custom-Fragen:
- **Nicht zu einfach:** 300P+ für Custom
- **Themen-Mix:** Verschiedene Typen verwenden
- **Custom-Kategorie:** Für Firmen-/Event-spezifische Fragen
- **Bonus nutzen:** Macht Custom-Fragen attraktiver

### Schwierigkeit:
- **100-200P:** Allgemeinwissen
- **300P:** Spezialwissen
- **400-500P:** Expert-Level

### Mathe:
- **Komplexität erhöhen:** Nicht nur Zahlen, auch % und Brüche
- **Rundung:** Bei Prozent ggf. runden
- **Klare Formulierung:** "Berechne:", "Was ist:", etc.

---

## 🔮 Next Steps (v3.1)

**Geplant:**
- [ ] Bild-Fragen Upload
- [ ] Multiple Custom-Kategorien
- [ ] Custom-Fragen bearbeiten
- [ ] JSON Import/Export
- [ ] Fragen-Datenbank online

**Nice-to-have:**
- [ ] Multiple-Choice Fragen
- [ ] Schätzfragen (nächster Wert gewinnt)
- [ ] Audio-Fragen
- [ ] Video-Fragen

---

**v3.0 - Das bisher größte Update!** 🎉

Built with 🧠 and ❤️
