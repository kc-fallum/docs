# ADR-0001: Zentrale generische Fehlermeldungen

## Status
Accepted

## Date
2026-09-27

## Context
Die Message-Konfiguration enthielt für einzelne Bereiche eigene Kopien von `NOT_FOUND`, `ALREADY_EXISTS` sowie Create-, Update- und Delete-Fehlern. Viele Einträge waren unreferenziert oder unterschieden sich nur durch den Ressourcennamen.

## Decision
Generische Fehler werden ausschließlich über `errorMessages.GENERAL` als parametrisierte Funktionen definiert:

- `NOT_FOUND(resource)`
- `ALREADY_EXISTS(resource)`
- `CREATE_FAILED(resource)`
- `UPDATE_FAILED(resource)`
- `DELETE_FAILED(resource)`

Aufrufer übergeben den konkreten Ressourcennamen. Fachliche Meldungen bleiben in ihrer Domänengruppe, wenn sie eine konkrete Geschäftsregel oder Validierung ausdrücken, zum Beispiel Termin-Zuordnungen, Registrierungscodes, Rate-Limits oder Datei-Validierungen.

Unreferenzierte Schlüssel werden entfernt. Einen separaten `DATA_NOT_FOUND`-Fallback gibt es nicht; allgemeine Not-Found-Fälle verwenden `GENERAL.NOT_FOUND("Daten")`.

## Consequences
- Neue generische CRUD-Meldungen müssen nicht pro Bereich angelegt werden.
- Die Message-Datei ist kleiner und unreferenzierte Einträge fallen leichter auf.
- Fachliche Sonderfälle bleiben semantisch präzise.
- Änderungen an öffentlichen Message-Schlüsseln erfordern die Migration aller Aufrufer und einen Typecheck der Shared-/Backend-Pakete.
