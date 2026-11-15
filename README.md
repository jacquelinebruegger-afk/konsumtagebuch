# Konsumtagebuch (Prototyp)

Klickbarer Web-App-Prototyp für ein Konsumtagebuch. Responsive (Mobile mit Tab-Leiste, Desktop mit Seitenleiste und Listen-/Detail-Ansicht), Deutsch, Französisch und Italienisch.

## Starten

```bash
npm install
npm run dev      # Entwicklungsserver auf http://localhost:5173
npm run build    # statischer Build nach dist/ (läuft auf jedem Static-Hosting)
npm test         # Tests der Zielberechnung
```

## Aufbau

- `src/pages/` – Start (Übersicht), Tagebuch, Eintrag erfassen (3 Schritte) und bearbeiten, Ziele, Profil (Einstellungen, Kategorien, Teilen, Support, Datenschutz, Impressum, PIN-Sperre)
- `src/lib/store.tsx` – Zustand, wird im Browser (`localStorage`) gespeichert; keine Server-Anbindung
- `src/lib/goals.ts` – Auswertung der Ziele (erreicht / in Bearbeitung / nicht erreicht)
- `src/lib/de.ts`, `fr.ts`, `it.ts` – Texte
- `src/styles.css` – Design Tokens und Styles (Farben und Kontraste in `:root`)

## Hinweise für Tests

- Beim ersten Start werden Beispieldaten geladen. Unter «Profil > Prototyp» lassen sie sich neu laden oder alle Daten löschen.
- Die Freigabe an Fachpersonen, Push-Nachrichten und Erinnerungen sind simuliert (Hinweise im Tagebuch statt echter Benachrichtigungen).
