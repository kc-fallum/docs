---
title: Architektur- & Design-Standards
description: Verbindliche Architektur-Blueprints, 5-Schichten-Backend, 4-Schichten-Frontend, das variables.css Design-System und Sicherheitsrichtlinien
sidebar_position: 4
---

# Architektur- & Design-Standards

Dieses Dokument definiert die **verbindlichen Richtlinien und Konventionen für Code- und UI-Architektur** der KC Fallum Plattform. Jeder neue Dienst, jede Page und jede Komponente muss diesen Standards entsprechen.

---

## 1. Backend-Architektur: Das 5-Schichten-Muster

Jeder Backend-Microservice (`backend-core`, `backend-auth`, `backend-transaction`, etc.) implementiert eine strikte, unidirektionale 5-Schichten-Architektur:

```text
HTTP / WebSocket Request
          │
          ▼
┌────────────────────────────────────────────────────────┐
│  1. Express Router                                     │  Zod-Validierung (validateBody / validateParams)
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  2. Controller / Route-Handler                         │  Extraktion der Typen, HTTP-Status, next(error)
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  3. Service Layer (Constructor DI)                     │  Geschäftslogik, Transaktionen, AMQP-Events
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  4. GenericDAO / Repository Layer                      │  Gekapselte TypeORM-Abfragen (keine Raw Queries)
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  5. PostgreSQL Datenbank                               │  Persistente Speicherung via BaseEntity
└────────────────────────────────────────────────────────┘
```

### 1.1 Datenbank-Entities (`src/models/entities/*.entity.ts`)

* Jede Entity erbt von `BaseEntity` aus `@kc-fallum/backend-lib` (stellt `id: string` als UUID, `createdAt` und `updatedAt` bereit).
* Entities dürfen **niemals direkt** als API-Response serialisiert oder zurückgegeben werden. Rückgaben müssen stets gefilterte, typisierte DTOs sein.
* Relationen müssen bei Abfragen stets explizit angegeben werden (`relations: ["spieler"]`).

```typescript
import { Column, Entity } from "typeorm";
import { BaseEntity } from "@kc-fallum/backend-lib";

/**
 * Datenbank-Entität für einen Mitgliedsbeitrag.
 */
@Entity("beitrag")
export class Beitrag extends BaseEntity {
  @Column({ type: "uuid" })
  spielerId!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  betrag!: number;

  @Column({ type: "varchar", length: 7 })
  monat!: string; // Format: YYYY-MM

  @Column({ type: "boolean", default: false })
  bezahlt!: boolean;

  @Column({ type: "timestamp", nullable: true })
  bezahltAm?: Date;
}
```

### 1.2 Service Layer mit Constructor Dependency Injection

* **Keine globalen Singletons:** Services dürfen nicht als mutable Variablen (`export let service`) exportiert werden.
* Alle Abhängigkeiten (DAOs, Sub-Services, Broker) **müssen explizit über den Konstruktor** injiziert werden. Dies garantiert vollständige Testbarkeit durch Mocks und Fakes.

```typescript
import { GenericDAO, FindOptionsWhere } from "@kc-fallum/backend-lib";
import { Beitrag } from "../models/entities/beitrag.entity.js";

export interface CreateBeitragInput {
  spielerId: string;
  betrag: number;
  monat: string;
}

export interface BeitragDTO {
  id: string;
  spielerId: string;
  betrag: number;
  monat: string;
  bezahlt: boolean;
}

/**
 * Service zur Verwaltung von Mitgliedsbeiträgen.
 */
export class BeitragService {
  constructor(private beitragDAO: GenericDAO<Beitrag>) {}

  /**
   * Erstellt einen neuen Beitragsdatensatz und gibt ihn als DTO zurück.
   *
   * @param input - Erstellungsdaten.
   * @returns Das bereinigte Beitrags-DTO.
   */
  async createBeitrag(input: CreateBeitragInput): Promise<BeitragDTO> {
    const entity = await this.beitragDAO.create({
      spielerId: input.spielerId,
      betrag: input.betrag,
      monat: input.monat,
      bezahlt: false
    });

    return {
      id: entity.id,
      spielerId: entity.spielerId,
      betrag: Number(entity.betrag),
      monat: entity.monat,
      bezahlt: entity.bezahlt
    };
  }

  /**
   * Markiert einen Beitrag als bezahlt.
   *
   * @param id - UUID des Beitrags.
   * @returns Das aktualisierte Beitrags-DTO.
   */
  async markAsPaid(id: string): Promise<BeitragDTO> {
    const existing = await this.beitragDAO.findOne({ id } as FindOptionsWhere<Beitrag>);
    if (!existing) {
      throw new Error("Beitrag nicht gefunden");
    }

    const updated = {
      ...existing,
      bezahlt: true,
      bezahltAm: new Date()
    } as Beitrag;

    await this.beitragDAO.update(updated);

    return {
      id: updated.id,
      spielerId: updated.spielerId,
      betrag: Number(updated.betrag),
      monat: updated.monat,
      bezahlt: updated.bezahlt
    };
  }
}
```

### 1.3 Routing, Zod-Validierung & Express 5 Error Handling

* Alle HTTP-Eingabedaten (Body, URL-Parameter, Query) werden **vor dem Controller** über Zod validiert.
* In Express 5 werden Fehler durch Auslösen von `throw` oder Weiterreichen via `next(error)` behandelt. Ein manuelles Aufrufen von `errorHandler(err)` ist unzulässig.

```typescript
import { Router, Request, Response, NextFunction } from "express";
import { validateBody, validateParams } from "@kc-fallum/backend-lib";
import { z } from "zod";
import { BeitragService } from "./beitrag.service.js";

const CreateBeitragSchema = z.object({
  spielerId: z.string().uuid(),
  betrag: z.number().positive(),
  monat: z.string().regex(/^\d{4}-\d{2}$/)
});

const IdParamSchema = z.object({
  id: z.string().uuid()
});

/**
 * Registriert die Express-Routen für Beiträge.
 *
 * @param service - Injizierter BeitragService.
 * @returns Express Router.
 */
export function createBeitragRouter(service: BeitragService): Router {
  const router = Router();

  router.post(
    "/",
    validateBody(CreateBeitragSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await service.createBeitrag(req.body);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  router.patch(
    "/:id/pay",
    validateParams(IdParamSchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const result = await service.markAsPaid(req.params.id);
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
```

---

## 2. Frontend-Architektur: Das 4-Schichten-Muster

Alle Single Page Applications (`frontend-client`, `frontend-dashboard`, `frontend-sso`, etc.) basieren auf Lit 3 und gliedern sich in vier Verantwortungsbereiche:

```text
┌────────────────────────────────────────────────────────┐
│  1. Pages (src/components/pages/*.page.ts)             │  URL-Routen, @lit/task, State-Orchestrierung
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  2. Widgets (src/components/widgets/ & @kc-fallum/...) │  Zustandsarme Fachkomponenten, Events via dispatch
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  3. Forms & Modals (*.form.ts)                         │  ModalForm-Dialoge, Feld-Validierung, Payloads
└──────────────────┬─────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────┐
│  4. Services (src/services/*.service.ts)               │  Nicht-Render-Logik, @kc-fallum/frontend-lib Clients
└────────────────────────────────────────────────────────┘
```

### 2.1 Verbindliche Regeln für Lit-Komponenten

1. **Kein Rohes `fetch()`:** Alle Netzwerk-Anfragen laufen ausnahmslos über typisierte API-Clients (`kasseClient`, `terminClient`, `spielerClient`) aus `@kc-fallum/frontend-lib`.
2. **Asynchrones Datenladen über `@lit/task`:** Jede Abfrage muss in einem `Task` gekapselt sein und alle drei Zustände abbilden:
   * `pending`: Rendern von `<skeleton-widget>` oder `<loading-widget>`.
   * `error`: Rendern von `<error-widget message="..." retry></error-widget>`.
   * `complete`: Übergabe der typisierten Daten an `renderContent()`.
3. **Template-Direktiven:** Ternäre Verschachtelungen im Template sind untersagt. Es müssen die Lit-Direktiven `when()`, `map()`, `repeat()` und `choose()` verwendet werden.
4. **Kein Inline-CSS in Komponenten:** Styles werden stets aus einer separaten Datei importiert (`import style from "./*.css?inline"`).
5. **Rechteprüfung & Toasts:** Berechtigungen werden deklarativ über `authHandler.hasPermission()` abgefragt; Benachrichtigungen erfolgen über `NotificationHandler.success()` bzw. `error()`.

```typescript
import { LitElement, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { Task } from "@lit/task";
import { when } from "lit/directives/when.js";
import { repeat } from "lit/directives/repeat.js";
import { terminClient, TerminDTO, authHandler } from "@kc-fallum/frontend-lib";
import { corePermissions } from "@kc-fallum/shared";
import componentStyle from "./termin-list.page.css?inline";

/**
 * Zeigt die Terminübersicht an und kapselt das Laden in einem Lit Task.
 */
@customElement("termin-list-page")
export class TerminListPage extends LitElement {
  static styles = [componentStyle];

  private loadTermine = new Task(this, {
    task: async () => {
      const data = await terminClient.getAllTermine();
      if (!data) throw new Error("Termine konnten nicht geladen werden.");
      return data;
    },
    args: () => []
  });

  override render(): TemplateResult | undefined {
    return this.loadTermine.render({
      pending: () => html`<skeleton-widget rows="5"></skeleton-widget>`,
      error: () => html`<error-widget title="Fehler" description="Termine konnten nicht geladen werden."></error-widget>`,
      complete: (termine: TerminDTO[]) => this.renderContent(termine)
    });
  }

  private renderContent(termine: TerminDTO[]): TemplateResult {
    return html`
      <div class="list">
        ${repeat(
          termine,
          (t) => t.id,
          (t) => html`<item-card-widget .item=${t}></item-card-widget>`
        )}
      </div>
    `;
  }
}
```

---

## 3. Das KC Fallum Design-System (`variables.css`)

Die Benutzeroberfläche nutzt ein verbindliches Design-Token-System, das in `@kc-fallum/components/dist/variables.css` definiert ist.

> [!WARNING]
> **Hardcodierte Pixelwerte, Hex-Farben (`#fff`, `#000`) oder statische Abstände sind im CSS verboten!**
> Jede CSS-Regel muss auf die Tokens aus `variables.css` zurückgreifen.

### 3.1 Design-Tokens im Überblick

```css
/* Auszug aus variables.css */
:root {
  /* 4px-Grid Abstände */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Barrierefreie Touch-Trefferfläche */
  --touch-target-min: 3rem; /* 48px */

  /* Typografie */
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.875rem; /* 30px */
  --text-3xl: 3rem;     /* 48px */

  /* Radien */
  --radius-sm: 0.125rem; /* 2px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem;   /* 8px */
  --radius-xl: 0.75rem;  /* 12px */
  --radius-full: 9999px;

  /* Schatten */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.05);

  /* Z-Index Ebenen */
  --z-dropdown: 900;
  --z-modal: 1050;
  --z-notification: 1100;
  --z-layout: 2000;
}

/* Light Mode Farbpalette */
[data-theme="light"], :root {
  --color-identity: #26523f;
  --color-identity-highlight: rgba(38, 82, 63, 0.15);
  --color-identity-shadow: rgba(38, 82, 63, 0.4);

  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;

  --surface-1: #f0f2f6;
}

/* Dark Mode Farbpalette */
[data-theme="dark"] {
  --color-identity: #3f8163;
  --color-identity-highlight: rgba(63, 129, 99, 0.25);
  --color-identity-shadow: rgba(63, 129, 99, 0.6);

  --surface-1: #1e293b;
}
```

### 3.2 CSS-Anwendungsbeispiel

```css title="termin.page.css"
:host {
  display: block;
  padding: var(--space-4);
  background-color: var(--surface-1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-identity);
  margin-bottom: var(--space-4);
}

.action-button {
  min-height: var(--touch-target-min);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-identity);
  color: var(--color-white);
  transition: background-color 0.2s ease-in-out;
}
```

---

## 4. Cross-Service Kommunikation & Sicherheit

### 4.1 Synchrone Aufrufe & `x-service-secret`

* Wenn ein Dienst direkt einen anderen Dienst über HTTP aufruft (z.&nbsp;B. `backend-transaction` ruft `backend-media` für Beleg-Uploads auf), wird der Header `x-service-secret` übergeben.
* **Sicherheits-Garantie:** Das `backend-gateway` filtert den Header `x-service-secret` bei allen Anfragen von außen strikt heraus. Daher gilt dieser Header im internen Docker-Netzwerk als verifizierter Ursprungsnachweis.

### 4.2 Asynchrone Ereignisse via RabbitMQ (`MessageBroker`)

* Für zustandsunabhängige Abläufe (Benachrichtigungen, E-Mail-Aufträge, Push-Nachrichten, Audit-Logs) wird der `MessageBroker` aus `@kc-fallum/backend-lib` verwendet.
* Events werden typisiert publiziert und von den zuständigen Diensten abonniert.

```typescript
import { MessageBroker } from "@kc-fallum/backend-lib";

export interface TerminAbsageEvent {
  terminId: string;
  spielerId: string;
  grund: string;
  zeitstempel: string;
}

/**
 * Publiziert ein Event über RabbitMQ, wenn sich ein Spieler vom Termin abmeldet.
 */
export async function notifySpielerAbsage(
  broker: MessageBroker,
  event: TerminAbsageEvent
): Promise<void> {
  await broker.publish("core.termin.absage", event);
}
```

### 4.3 Datenintegrität & Type-Casting

* **Transaktionen:** Multi-Table-Operationen (z.&nbsp;B. Spieler anlegen, Benutzer verknüpfen, Kassen-Startsaldo buchen) müssen zwingend in einer TypeORM-Transaktion (`queryRunner.startTransaction()`) ausgeführt werden.
* **Keine `typeof`-Checks für komplexe Objekttypen:** Stattdessen wird TypeScript Type-Casting (`as TargetType`) verwendet.
* **Sicherheits-Hashing:** Einmal-Tokens (Magic Links, Passwort-Reset) werden ausschließlich als kryptografischer SHA-256 Hash persistiert, niemals im Klartext.
