# Projektnotiz Konsumtagebuch

## Ziel
Web-App für Menschen mit einer Sucht, die ihren Konsum dokumentieren. Es ist ein Prototyp, der anonym getestet werden soll. Vorlage ist die App «arud», deren UX/UI als ungenügend gilt. Die neue App soll deutlich besser bedienbar sein.

## Vorgaben aus dem Briefing
- Inhalte und Screens gemäss Kundenbriefing «260827_Inhalte_Konsumtagebuch(2).docx» (Tagebuch, Einstellungen, Ziele, Tagebuch teilen, Unterstützung, Impressum, Datenschutz).
- Flow: 4 Tabs (Start, Tagebuch, Ziele, Profil), jederzeit erreichbar. Eintrag erfassen in 3 Schritten (Kategorie, Details, Befinden).
- Design orientiert sich an https://www.safezone.ch/de/ (Türkis, dunkle Schrift, helle Flächen, Serifen für Titel).
- Barrierefreiheit hat Vorrang vor dem exakten SafeZone-Look (Kontraste mindestens WCAG AA).
- Responsive: Mobile (Tab-Leiste unten) und Desktop (Seitenleiste, eine Inhaltsspalte; Tagebucheinträge öffnen und bearbeiten im Overlay, beim Schliessen mit Änderungen wird nachgefragt).
- Sprachen: Deutsch, Französisch, Italienisch.
- Kein Gewicht und kein Geschlecht erfassen (im Briefing explizit gestrichen).

## Entscheidungen
- Kategorie heisst «Cannabis» (Einheit Joint), wie im Wireframe. Das Briefing nennt «Cannabinoide».
- Primärfarbe #00667a statt des SafeZone-Türkis #008faa, weil dieses auf Weiss nur 3,6:1 erreicht (AA verlangt 4,5:1). Das helle Türkis #00bed5 wird nur dekorativ verwendet.
- Status (Ziele) wird nie nur über Farbe gezeigt, sondern mit Icon und Text.
- Kategorien: Beim ersten Start gibt es 16 Kategorien aus dem Briefing. GHB, Koffein und Psychedelika kommen über «Kategorie hinzufügen», «Weitere» erstellt eine eigene.
- Löschen einer Kategorie löscht auch zugehörige Einträge und Ziele (mit Rückfrage).
- Kein Löschen per Wischgeste, stattdessen Buttons (Wireframe).
- Daten liegen ausschliesslich im Browser (`localStorage`). Es gibt kein Backend, kein Konto und keine Übertragung.

## Simuliert (kein echtes Backend)
- Push-Nachrichten und Erinnerungen erscheinen als Hinweis im Tagebuch.
- «Fachperson einladen» erzeugt nur einen Einladungscode.
- PIN-Sperre funktioniert lokal. Wer die PIN vergisst, kann nur alle Daten löschen.

## Offene Punkte
- Datenschutztext ist ein Platzhalter und muss mit dem ausführlichen SafeZone-Datenschutz abgestimmt werden.
- Französische und italienische Texte sind Entwürfe und sollten von Muttersprachlern geprüft werden.
- SafeZone-Schriften (Clan, Unit Slab) sind nicht eingebunden. Als Ersatz dienen Source Sans 3 und Roboto Slab.
- Entscheid für die echte App: Konto und Synchronisation, Freigabe an Fachpersonen, Datenschutzfolgen.
- Nutzungsstatistik ohne Personenbezug für die Tests (zum Beispiel Plausible oder Matomo) ist nicht eingebaut.

## Betrieb
- Repository: https://github.com/jacquelinebruegger-afk/konsumtagebuch
- Hosting: Vercel (statischer Vite-Build, `npm run build`, Ausgabe `dist`). Jeder Push auf `main` veröffentlicht automatisch.
- Lokal: `npm install`, `npm run dev`, `npm test`.
