# BrainBuzz v3.1 - Random Categories & Bonus System

**Release Date**: 10. Dezember 2025

## 🎯 Major Updates

### 1. Random Category Selection
**GAME CHANGER**: Jedes Spiel hat andere Kategorien!

- 🎲 **5 aus 7**: Pro Spiel werden 5 zufällige Kategorien aus 7 verfügbaren gewählt
- 🔄 **Variety**: Keine zwei Spiele sind gleich!
- 📊 **Pool**: Allgemeinwissen, Wissenschaft, Geschichte, Sport, Geographie, Mathe, Fehlersuche

**Vorher**: Alle 7 Kategorien immer im Spiel
**Jetzt**: 5 zufällige Kategorien pro Spiel + optional Custom

### 2. Vereinfachte Fehlersuche
**Zwei Modi statt einem komplexen Format:**

**Einfach** (offensichtliche Fehler):
```
Frage: "Ein Fußballspiel dauert 60 Minuten"
Antwort: "90" oder "Falsch"
→ Normal bewertet
→ Hint zeigt was falsch ist: "60 Minuten"
```

**Komplex** (nicht-offensichtlich):
```
Frage: "Marie Curie entdeckte das Penicillin - Richtig oder Falsch?"
Schritt 1: Spieler → "Falsch"
Schritt 2: "Was ist richtig?" (optional)
Spieler → "Alexander Fleming"
→ Host vergibt 0-150 Bonus-Punkte!
```

### 3. Bonus-System für Fehlersuche
**Neues Belohnungssystem:**

- 💰 **Basis-Punkte**: Für "Richtig/Falsch" korrekt erkennen
- 🎯 **Bonus-Punkte**: Für richtige Korrektur (0-150P)
- 🎛️ **Host-Kontrolle**: Host entscheidet Bonus-Höhe
- ⏭️ **Optional**: Spieler kann Bonus überspringen

**Flow:**
1. Spieler antwortet "Falsch" → +Basis-Punkte
2. System fragt: "Was ist richtig?"
3. Spieler gibt Korrektur
4. Host bewertet Korrektur
5. Host vergibt 0-150 Bonus-Punkte

## 🐛 Critical Fixes

### Kategorie-System
**Problem**: Alle 7 Kategorien immer im Spiel = repetitiv
**Fix**: Random 5 aus 7 pro Spiel

**Problem**: Mathe/Fehlersuche unter falschen Kategorien
**Fix**: Eigene Kategorien, shuffle NUR intern

### Fehlersuche
**Problem**: Komplexe Fehler schwer zu finden
**Beispiel ALT**: "Julius Caesar wurde von seinem Sohn Brutus ermordet"
→ Was ist falsch? Sohn? Brutus? Beides? Unklar!

**Fix - Zwei Modi**:

**Offensichtlich** (Zahlen/Fakten):
- Frage: "Der 2. Weltkrieg endete 1944"
- Hint: "1944"
- Antwort: "1945" → Automatisch richtig

**Komplex** (Konzepte):
- Frage: "Marie Curie entdeckte Penicillin - R/F?"
- Antwort: "Falsch" → Basis-Punkte
- Bonus-Frage: "Was ist richtig?"
- Antwort: "Alexander Fleming" → Host vergibt Bonus!

## 🎨 UI Updates

### Error Hints
```html
<div class="error-hint">
  ❌ Fehler hier: "60 Minuten"
</div>
```
- Zeigt bei offensichtlichen Fehlern was falsch ist
- Macht es leichter die richtige Antwort zu finden

### Bonus-Section
```html
<div class="bonus-section">
  🎯 BONUS-FRAGE!
  Bis zu +150 Bonus-Punkte möglich!
</div>
```
- Eigene UI für Bonus-Fragen
- Host-Interface für Bonus-Vergabe
- Skip-Option für Spieler

### Welcome Screen
```
🧠 BrainBuzz
5 zufällige Kategorien pro Spiel!
```
- Info über Random-Categories
- Klarere Erwartungen

## 📊 Content Updates

### Fehlersuche Neu-Strukturiert

**Offensichtlich (100-300P):**
- 100P: Rechtschreibung, simple Fakten
- 200P: Geographie, Daten
- 300P: Geschichte, Zahlen

**Komplex (400-500P + Bonus):**
- 400P: Historische Details, Personen (+ 100 Bonus)
- 500P: Wissenschaftliche Fakten, Entdeckungen (+ 150 Bonus)

**Beispiele**:
```javascript
// Offensichtlich
{ q: 'Ein Fußballspiel dauert 60 Minuten', 
  a: '90', 
  errorType: 'obvious', 
  errorHint: '60 Minuten' }

// Komplex
{ q: 'Marie Curie entdeckte das Penicillin - Richtig oder Falsch?', 
  a: 'Falsch', 
  correctAnswer: 'Alexander Fleming', 
  errorType: 'complex', 
  bonusPoints: 150 }
```

## 🎮 Gameplay Changes

### Random Categories
- **Vorher**: 5 feste Kategorien + Custom
- **Jetzt**: 5 zufällige aus 7 + Custom
- **Impact**: Mehr Abwechslung, weniger Repetition

### Fehlersuche Einfach
- **Hint anzeigen**: Bei offensichtlichen Fehlern
- **Direkte Antwort**: Nur der Fehler, kein Format nötig
- **Auto-Correct**: Funktioniert bei einfachen Fehlern

### Fehlersuche Komplex
- **Zwei-Schritt-System**:
  1. Richtig/Falsch? → Basis-Punkte
  2. Was ist richtig? → Bonus-Punkte
- **Optional**: Spieler kann Schritt 2 überspringen
- **Host-Entscheidung**: Host vergibt 0-max Bonus

### Bonus-Punkte
- **400P-Fragen**: Bis zu 100 Bonus
- **500P-Fragen**: Bis zu 150 Bonus
- **Host-Eingabe**: Host gibt Bonus manuell ein
- **Flexibel**: Teilpunkte für teilweise richtige Antworten

## 🔧 Technical Changes

### Server
```javascript
// NEU: Random Category Selection
function selectRandomCategories() {
  const allCategories = Object.keys(QUESTIONS);
  const shuffled = allCategories.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// NEU: Error Types
errorType: 'obvious' // Mit hint
errorType: 'complex' // Mit bonus

// NEU: Bonus System
awaitingBonusAnswer: false
socket.on('submit-bonus-answer')
socket.on('award-bonus')
socket.on('skip-bonus')
```

### Frontend
```javascript
// NEU: Error Hint Display
<div id="errorHintDisplay">
  <p id="errorHintText"></p>
</div>

// NEU: Bonus States
<div id="bonusState">        // Spieler gibt Bonus-Antwort
<div id="hostBonusDecision">  // Host bewertet

// NEU: Bonus Functions
submitBonusAnswer()
skipBonus()
awardBonus()
```

## 🔄 Migration von v3.0

### Breaking Changes
Keine! Alle v3.0 Features kompatibel.

### Neue Events
```javascript
// Server → Client
'bonus-answer-submitted'
'bonus-awarded'

// Client → Server
'submit-bonus-answer'
'award-bonus'
'skip-bonus'
```

### Neue Datenfelder
```javascript
// Question Object
{
  errorType: 'obvious' | 'complex',
  errorHint: string,        // Nur bei obvious
  correctAnswer: string,    // Nur bei complex
  bonusPoints: number       // Nur bei complex
}
```

## 📦 Files Changed

### Server
- `server.js`: +5KB
  - Random category selection
  - Error type handling
  - Bonus system logic

### Frontend
- `public/index.html`: +3KB
  - Bonus UI sections
  - Error hint display
  - Host bonus controls

### Config
- `CHANGELOG_v3.1.md`: Dieses File
- `README.md`: Updated

## 🎯 Examples

### Random Categories in Action
```
Spiel 1: Allgemeinwissen, Mathe, Sport, Geographie, Fehlersuche + Custom
Spiel 2: Wissenschaft, Geschichte, Mathe, Sport, Geographie + Custom
Spiel 3: Allgemeinwissen, Wissenschaft, Geschichte, Fehlersuche, Sport + Custom
```

### Fehlersuche Offensichtlich
```
Frage: "Ein Fußballspiel dauert 60 Minuten"
Hint: "❌ Fehler hier: 60 Minuten"
Spieler: "90"
→ +300 Punkte (Auto-Correct)
```

### Fehlersuche Komplex mit Bonus
```
Frage: "Marie Curie entdeckte das Penicillin - R/F?"
Spieler: "Falsch"
→ +500 Punkte (Basis)

Bonus-Frage: "Was ist richtig?"
Spieler: "Alexander Fleming"
Host: Bewertet als perfekt
→ +150 Bonus-Punkte!

Total: 650 Punkte
```

### Bonus Partial Credit
```
Spieler: "Fleming" (ohne Vorname)
Host: Vergibt 100 von 150 Bonus
→ +100 Bonus-Punkte
```

## 🐛 Known Issues

Keine kritischen Bugs!

Kleinere TODOs:
- Bonus-Punkte vordefinierte Stufen (0, 50, 100, 150)
- Mehr Fehlersuche-Fragen (aktuell ~15)
- Mobile Optimierung

## 📈 Statistics

- **Categories**: 7 verfügbar, 5 pro Spiel
- **Questions**: 140+ total
- **Error Questions**: 
  - Obvious: ~10
  - Complex: ~5
- **Bonus Potential**: Bis zu 150P extra

## 🙏 Credits

Entwickelt für Hochschule RheinMain
Feedback von Daniel integriert
Version 3.1 - Finale Version
