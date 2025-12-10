# 🧠 BrainBuzz v3.0 - Das ultimative Quiz-Duell

**Host-moderiertes Multiplayer-Quiz mit Custom-Fragen, verschiedenen Fragetypen und intelligentem Schwierigkeitssystem!**

---

## ✨ Was ist neu in v3.0?

### 🏷️ Neuer Name: "BrainBuzz"
- Einprägsamer, moderner Name
- Spiegelt das Buzzer-System wider
- Professional branding

### 🔀 Intelligentes Fragen-System
- **Großer Fragen-Pool:** 5-8 Fragen pro Punktwert pro Kategorie
- **Random Shuffle:** Jedes Spiel ist anders!
- **Schwierigkeitsgrade:** Von 100P (leicht) bis 500P (sehr schwer)

### 🎯 Verschiedene Fragetypen
| Typ | Icon | Beschreibung | Schwierigkeit |
|-----|------|--------------|---------------|
| **Text** | 📝 | Normale Wissensfragen | Alle Level |
| **Mathe** | 🔢 | Rechenaufgaben | 100P: +,× → 500P: √, ², % |
| **Fehlersuche** | 🔍 | Finde den Fehler! | 100-200P: Rechtschreibung<br>300-500P: Fakten & Logik |

**Mathe-Schwierigkeitsgrade:**
- **100P:** `12 + 8`, `5 × 4`
- **200P:** `15 × 6 - 12`, `144 ÷ 12`
- **300P:** `20% von 150`, `3/4 von 80`
- **400P:** `15² - 50`, `30% von 240`
- **500P:** `√144 + 5³`, `40% von 350 - 15% von 200`

### 📝 Custom-Fragen System
**Host kann eigene Fragen erstellen!**

**Features:**
- ✅ UI-Editor im Spiel (kein Code nötig!)
- ✅ 5-10 Custom-Fragen pro Spiel (einstellbar)
- ✅ Alle 3 Fragetypen wählbar
- ✅ Punktwerte frei wählbar (100-500)
- ✅ **Custom-Kategorie mit Bonus-Punkten!**

**Wie es funktioniert:**
1. Host erstellt Fragen in der Lobby
2. Wählt Kategorie (oder "Custom" für eigene Kategorie)
3. Custom-Fragen werden automatisch ins Board gemischt
4. Custom-Kategorie gibt **+50 Bonus-Punkte** (einstellbar!)

**Beispiel:**
```
Host erstellt:
- "Allgemeinwissen | Mathe | 300P"
  → Ersetzt eine Standard-300P-Frage in Allgemeinwissen

- "Custom | Text | 500P"
  → Erstellt neue "Custom"-Spalte im Board
  → Gibt 500 + 50 Bonus = 550 Punkte!
```

---

## 🎮 Spielregeln

### Host als Moderator
- Host spielt **NICHT** mit
- Host bewertet alle Antworten (✅ Richtig / ❌ Falsch)
- Host sieht immer die richtige Antwort

### Spielablauf

#### Einzelspieler-Modus:
1. Aktueller Spieler wählt Frage
2. **Nur dieser Spieler muss zuerst antworten**
3. **Auto-Correct:** Exakte Antwort = automatisch richtig (keine Host-Bewertung)
4. Bei falscher Antwort:
   - Spieler: -50% Punkte
   - **10 Sekunden Buzzer-Phase** für alle anderen
   - Auch bei falsch: -50% Punkte
5. Richtige Antwort: +volle Punktzahl

#### Team-Modus:
1. Aktuelles Team wählt Frage
2. Team diskutiert und gibt Antwort
3. Auto-Correct funktioniert auch hier
4. Bei falscher Antwort:
   - Team: -50% Punkte
   - Gegnerteam bekommt Chance

---

## 🎨 Features

### ✅ Von v2.2 übernommen:
- 🔊 **Sound-System** (Buzzer, Richtig/Falsch, Tick, Fanfare)
- 🏆 **Finaler Punktestand** mit Medaillen
- 👥 **Team-System** mit Sidebars
- ⚙️ **Lobby-Einstellungen**
- 🎙️ **Host-Moderation**

### ⭐ Neu in v3.0:
- 📝 **Custom-Fragen** mit UI-Editor
- 🔀 **Random Shuffle** aus Fragen-Pool
- 🔢 **Mathe-Fragen** (bis zu Wurzeln & Potenzen!)
- 🔍 **Fehlersuche-Fragen**
- ✨ **Custom-Kategorie** mit Bonus
- 🎯 **Typen-Badges** (zeigt Fragetyp an)
- ⭐ **Custom-Marker** (Sterne auf Custom-Fragen)

---

## 🚀 Deployment

### Lokal testen:
```bash
npm install
npm start
```
Öffne: http://localhost:3000

### Render.com Deploy:
```bash
# 1. Alte Version löschen
rm -rf *

# 2. Neue Version entpacken

# 3. Git Push
git add .
git commit -m "v3.0 - BrainBuzz mit Custom-Fragen & Frage-Typen"
git push
```

Render deployed automatisch!

---

## 📊 Fragen-Statistik

**Aktuell im Pool:**
- 5 Kategorien (Allgemeinwissen, Wissenschaft, Geschichte, Sport, Geographie)
- 5 Punktwerte pro Kategorie (100-500)
- 4-6 Fragen pro Punktwert
- **= ca. 120-150 Fragen total**

**Mix:**
- 60% Text-Fragen
- 25% Mathe-Fragen
- 15% Fehlersuche-Fragen

---

## ⚙️ Einstellungen (Host)

| Setting | Optionen | Standard |
|---------|----------|----------|
| Team-Modus | An/Aus | Aus |
| Anzahl Teams | 2-4 | 2 |
| Frage-Zeit | 10-120s | 30s |
| Buzzer-Zeit | 5-30s | 10s |
| Max Custom-Fragen | 5/7/10 | 5 |
| Custom Bonus | 0-200 | 50 |

---

## 🎯 Custom-Fragen Beispiele

### Text-Frage:
```
Kategorie: Wissenschaft
Typ: Text
Frage: Wann wurde unsere Firma gegründet?
Antwort: 2015
Punkte: 300
```

### Mathe-Frage:
```
Kategorie: Custom
Typ: Mathe
Frage: Berechne: 25% von 360 + 18
Antwort: 108
Punkte: 400
Bonus: +50 = 450 Punkte total!
```

### Fehlersuche:
```
Kategorie: Geschichte
Typ: Fehlersuche
Frage: Finde den Fehler: Deutschland wurde 1949 wiedervereint
Antwort: 1949 → 1990
Punkte: 500
```

---

## 🐛 Bekannte Einschränkungen

- **Bilder:** Noch nicht implementiert (geplant für v3.1)
- **Custom-Kategorien:** Aktuell nur eine Custom-Kategorie möglich
- **Fragen-Editor:** Keine Bearbeitung nach Erstellung (nur Löschen)

---

## 📝 Changelog

### v3.0 (Aktuell)
- ✅ Rename zu "BrainBuzz"
- ✅ Großer Fragen-Pool mit Shuffle
- ✅ Mathe-Fragen (Brüche, Prozent, Potenzen, Wurzeln)
- ✅ Fehlersuche-Fragen
- ✅ Custom-Fragen System mit UI
- ✅ Custom-Kategorie mit Bonus
- ✅ Typen-Badges & Custom-Marker

### v2.2
- Sound-System
- Final Scores Modal
- Host-Buzzer Fix

### v2.1
- Board Updates
- Auto-Correct
- Buzzer-Filter
- Rotation Fix

### v2.0
- Host-System
- Team-Modus
- Lobby-Einstellungen

---

## 🎯 Roadmap (optional)

**v3.1:**
- [ ] Bild-Fragen
- [ ] Multiple Custom-Kategorien
- [ ] Custom-Fragen bearbeiten
- [ ] JSON Import/Export

**v3.2:**
- [ ] Mehr Frage-Typen (Multiple-Choice, Schätzfragen)
- [ ] Statistiken & Highscores
- [ ] Background-Musik
- [ ] Animationen & Konfetti

---

**v3.0 - Built with 🧠 and ❤️**
