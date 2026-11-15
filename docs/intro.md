---
title: Übersicht & Einführung
description: Einführung in die KC Fallum Plattform-Architektur und Dokumentationsstruktur
sidebar_position: 1
slug: /
---

# KC Fallum Plattform-Dokumentation

Willkommen in der zentralen Architekturdokumentation der **KC Fallum Plattform**.

Die KC Fallum Plattform ist eine modulare Web- und Gaming-Infrastruktur, die für die Verwaltung, Mitgliederinteraktion, Finanzen, Medien und Minecraft-Gaming-Dienste eines Kegelclubs konzipiert wurde.

---

## Modulare Systemstruktur

Das Projekt wird in einem Root-Container (`kc-fallum/root`) als Multi-Repo über Git-Submodule gepflegt und setzt sich aus fünf Hauptsäulen zusammen:

1. **Systemweite Architektur & Betrieb:**
   * [Architektur-Blueprints & Coding Standards](standards.md): Schichtenarchitektur, Service-Anatomie, Lit-Komponenten und Cross-Service-Workflows.
   * [Systemarchitektur & Design](architecture.md): Gesamtsystemaufbau, Inter-Service-Kommunikation und Datenflüsse.
   * [Infrastruktur & Externe Abhängigkeiten](dependencies.md): Oracle VPS Hosting, Cloudflare Zero Trust Tunnel, Resend E-Mail-Dienst und GitHub Source Control.
   * [Setup & Deployment Guide](setup.md): Vollständige Anleitung für die lokale Entwicklung und das Produktions-Deployment.
   * [API Gateway & Routing](backend/gateway/overview.mdx): Zentrales Routing über das Gateway, Swagger-Spezifikation und Endpunkt-Workflow.

2. **Shared Packages (`packages/`):**
   * Gemeinsame Bibliotheken für Typen, Validierung, Basis-Clients, Middlewares, TanStack Queries und UI-Komponenten.

3. **Frontends (`frontend/`):**
   * Unabhängig deploybare Single Page Applications (SPAs) auf Basis von Lit 3.
   * [Frontend-Architektur & UI-Blueprint](frontends/frontend-guide.mdx): 4-Schichten-Modell (Pages, Widgets, Forms, Services), `@lit/task`, Drei-Zustands-Rendering und `variables.css`-Theming.

4. **Backend-Microservices (`backend/`):**
   * Spezialisierte Node.js-Services auf Basis von Express 5, TypeORM, PostgreSQL, Redis und RabbitMQ.
   * [Backend-Architektur & Service-Blueprint](backend/backend-guide.mdx): 8-Schritte-Blueprint, `app.ts` vs. `db.ts`, Zod-Validierung und AMQP-Events.

5. **Minecraft-Infrastruktur (`game/plugins/`):**
   * Paper 1.21- und Velocity-Plugins mit Cross-Play-Unterstützung (Geyser/Floodgate).

---

## Schnellzugriff

| Bereich | Primärer Tech-Stack | Relevante Domäne |
|---|---|---|
| **API Gateway** | Express 5, `http-proxy-middleware`, Socket.io | Zentraler Routing-Proxy (`api.kcfallum.de`) |
| **Auth & SSO** | OIDC Provider, Passport, `@simplewebauthn` | Authentifizierung, Sessions, Passkeys |
| **Core Service** | Express 5, TypeORM, Google Sheets API | Termine, Zu-/Absagen, Strafen, Kasse |
| **Client Frontend** | Lit 3, Tailwind 4, `@lit-labs/router` | Mitglieder-Portal (`kcfallum.de`) |
| **Dashboard** | Lit 3, `@tanstack/lit-query` | Administration (`dashboard.kcfallum.de`) |
| **Infrastruktur** | Docker Compose, Cloudflare Tunnel, Oracle VPS | Containerisierung und Zero-Trust-Netzwerk |
