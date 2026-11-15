---
title: "@kc-fallum/frontend-lib"
description: TanStack Query Optionen, Lit Router Erweiterung, State- und Notification-Handler
sidebar_position: 3
---

# Frontend Library (`@kc-fallum/frontend-lib`)

Das Paket `@kc-fallum/frontend-lib` liegt unter `packages/frontend/frontend-library` und dient als Framework-Brücke für alle Lit-basierten Frontends.

---

## 1. Verantwortlichkeiten

* **Data-Fetching & Caching:** Exportiert vorkonfigurierte `queryOptions` für TanStack Query (`terminQueries`, `spielerQueries`, `sessionQueries`, `kasseQueries`).
* **Router-Integration:** Erweiterter `Router` auf Basis von `@lit-labs/router` mit Browser-History-Synchronisation und Context-Provider.
* **Zustands- und Notification-Management:**
  * `authHandler`: Globaler Authentifizierungsstatus, Session-Initialisierung und Login-Promise.
  * `notificationHandler`: Toast- und Fehlermeldungen.
  * `pushHandler`: WebPush-Registrierung und Schlüsselverwaltung über den Service Worker.
* **Build-Konfiguration:** Geteilte Vite-Basis-Konfiguration (`vite.base.config.ts`) für Tailwind 4 und Lit-Bundling.

---

## 2. Projektstruktur

```text
packages/frontend/frontend-library/src/
├── app/              # Router, App-Bootstrap und Theme-Provider
├── clients/          # Client-Instanzen und TanStack Query Definitionen
├── config/           # Gemeinsame Vite-Konfiguration (vite.base.config.ts)
├── handler/          # API-, Push-, State- und Notification-Handler
├── service/          # Offline-Synchronisation und Service-Worker-Helfer
└── utils/            # Währungsformatierung, iCal-Generierung, WebSockets
```

---

## 3. Code-Beispiel

```typescript
import { queryOptions } from "@tanstack/lit-query";
import { TerminClient, TerminDTO } from "@kc-fallum/shared";

export const terminClient = new TerminClient();

/**
 * Definiert TanStack Query Optionen für das Abrufen des nächsten Termins.
 */
export const terminQueries = {
  /**
   * Lädt den nächsten anstehenden Termin aus dem Cache oder Server.
   *
   * @returns Das QueryOptions-Objekt für TanStack Query.
   */
  next: () =>
    queryOptions({
      queryKey: ["termin", "next"] as const,
      queryFn: async (): Promise<TerminDTO | null> => {
        const result = await terminClient.getNext();
        return result as TerminDTO | null;
      }
    })
};
```
