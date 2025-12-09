# 🐛 Bugfixes v2.1

## ✅ Fixed Bugs:

### 1. Fragen werden nicht ausgegraut
**Problem:** Nach Beantwortung wurden Fragen nicht als "completed" markiert
**Fix:** 
- `completed`-Flag wird sofort gesetzt bei Host-Entscheidung
- Board wird mit jedem Event mitgeschickt (`board` property)
- Frontend updated Board nach jedem `answer-result` und `buzzer-timeout`

### 2. Auto-Correct Sicherheit
**Problem:** Host könnte manipulieren
**Fix:**
- Server vergleicht Antwort automatisch (case-insensitive, trimmed)
- Bei exakter Übereinstimmung → **Auto-Correct** = Richtig
- Host sieht "Auto-Correct" Hinweis
- Host muss nur bei Schreibfehlern bewerten

**Beispiel:**
- Richtige Antwort: "Paris"
- Spieler gibt: "Paris" → ✅ Auto-Correct (Host sieht nichts)
- Spieler gibt: "paris" → ✅ Auto-Correct (lowercase = egal)
- Spieler gibt: "Pari" → Host bewertet

### 3. Buzzer nur für Spieler die noch nicht geantwortet haben
**Problem:** Alle konnten immer buzzern
**Fix:**
- Server tracked `buzzedPlayers` Array
- Spieler der initial antwortet wird automatisch hinzugefügt
- Beim Buzzern: Server prüft ob Spieler bereits in Liste
- Frontend: Button wird disabled mit Text "❌ Du hast bereits geantwortet"

### 4. Spieler-Rotation
**Problem:** Immer der gleiche Spieler war dran
**Fix:**
- `game.nextPlayer()` wird jetzt aufgerufen:
  - Nach richtiger Antwort (egal ob initial oder nach Buzz)
  - Nach Buzzer-Timeout
- Rotation funktioniert mit `(currentIndex + 1) % players.length`
- Gleiches System für Teams

## 🧪 Testen:

1. **Fragen sperren:**
   - Host startet Spiel
   - Spieler wählt Frage → antwortet
   - Nach Bewertung: Kachel wird grau
   - Kann nicht mehr angeklickt werden ✅

2. **Auto-Correct:**
   - Spieler gibt exakte Antwort: "Paris"
   - Keine Host-Bewertung nötig
   - Automatisch richtig, +Punkte ✅

3. **Buzzer-Filter:**
   - Spieler 1 antwortet falsch → Buzzer startet
   - Spieler 1 sieht: "❌ Du hast bereits geantwortet"
   - Spieler 2 kann buzzern ✅

4. **Rotation:**
   - Spieler 1 beantwortet richtig
   - Nächste Frage: Spieler 2 ist dran
   - Spieler 2 beantwortet richtig
   - Nächste Frage: Spieler 3 ist dran ✅

## 📦 Deployment:

```bash
# 1. Alte Version löschen
rm -rf quizmaster/*

# 2. Neue ZIP entpacken

# 3. Git Push
git add .
git commit -m "v2.1 - Bugfixes: Board Updates, Auto-Correct, Buzzer-Filter, Rotation"
git push

# 4. Render deployed automatisch
```

---

**v2.1 - Alle gemeldeten Bugs gefixt!** 🎯
