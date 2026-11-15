---
title: "@kc-fallum/shared"
description: DTOs, Entitätsmodelle, Permission-Definitionen und Basis-HTTP-Client
sidebar_position: 1
---

# Shared Library (`@kc-fallum/shared`)

Das Paket `@kc-fallum/shared` befindet sich unter `packages/shared/shared-library` und dient als gemeinsame Single Source of Truth für Typdefinitionen, Schemas und Basis-Clients sowohl für das Frontend als auch für das Backend.

---

## 1. Verantwortlichkeiten & Domäne

* **DTOs & Interfaces:** Vollständige Typisierung aller API-Request- und Response-Objekte (Termine, Strafen, Kasse, Profile, Benutzer, WebAuthn).
* **Permission-Engine:** Granulare Rollen- und Rechteprüfungen (`authPermissions`, `corePermissions`, `gameserverPermissions`, `clientPermissions`).
* **Basis HttpClient:** Abstrakte Basisklasse für alle HTTP-Clients mit automatischem Query-String-Building, Cookie-Handling (`credentials: "include"`) und einheitlicher Fehlerbehandlung.
* **Umgebungs- und Routing-Konfiguration:** Zentrale URLs für Staging, Produktion und lokales Testen (`API_BASE_URL`, `SSO_BASE_URL`, `CLIENT_BASE_URL`, `DASHBOARD_BASE_URL`).

---

## 2. Projektstruktur

```text
packages/shared/shared-library/src/
├── clients/          # Domänenspezifische HTTP-Clients (Auth, Core, Game, Media)
├── config/           # Base-URLs, Environments und Client-Konfiguration
├── dto/              # Data Transfer Objects
├── models/           # Kerndatenmodelle für Spieler, Termine, Kasse, Gameserver
├── permissions/      # Regelwerke für Rollen- und Rechteprüfungen
├── socket/           # Typen für WebSocket-Events und Payloads
└── utils/            # Hilfsfunktionen (Datumsberechnungen, Levenshtein, Versionsprüfung)
```

---

## 3. Typisches Code-Beispiel

```typescript
import { HttpClient } from "./clients/http.client.js";

export interface SpielerDTO {
  id: string;
  name: string;
  active: boolean;
}

/**
 * Client für die Abfrage von Spielerdaten.
 */
export class SpielerClient extends HttpClient {
  /**
   * Lädt alle aktiven Spieler aus dem Core-Service.
   *
   * @returns Eine Liste aller Spieler-DTOs.
   */
  async getActiveSpieler(): Promise<SpielerDTO[]> {
    const response = await this.get("/spieler/active");
    const data = (await response.json()) as SpielerDTO[];
    return data;
  }
}
```
