---
title: "@kc-fallum/backend-lib"
description: Express 5 Middlewares, RabbitMQ Message Broker, Redis Cache und DAO-Abstraktionen
sidebar_position: 2
---

# Backend Library (`@kc-fallum/backend-lib`)

Das Paket `@kc-fallum/backend-lib` befindet sich unter `packages/backend/backend-library` und stellt grundlegende Infrastrukturkomponenten für alle Backend-Microservices bereit.

---

## 1. Verantwortlichkeiten

* **Express 5 Middleware:**
  * `authMiddleware`: JWT-Validierung, Rollen- und Berechtigungsprüfung (`requirePermission`).
  * `validationMiddleware`: Request-Validierung gegen Zod-Schemas (`validateBody`, `validateParams`, `validateQuery`).
  * `errorMiddleware`: Zentraler Express 5 Error Handler für standardisierte JSON-Fehlerausgaben.
* **Message Broker:** Abstraktion über `amqplib` für asynchrones Event-Publishing und Consumer-Handling über RabbitMQ.
* **Caching & State:** Redis-Client für In-Memory-Caching und verteilte Session-Tokens.
* **DAO-Abstraktion:** Generische DAO- und TypeORM-Repository-Basisklassen (`GenericDao`, `OrmGenericDao`).

---

## 2. Projektstruktur

```text
packages/backend/backend-library/src/
├── client/           # MessageBroker (RabbitMQ), CacheService (Redis), interne Services
├── config/           # Auth-, Appearance- und Google-Konfigurationen
├── middleware/       # Auth-, CSRF-, Validation- und Error-Handler
├── models/           # DTOs, Schemas und Entity-Definitionen
├── testing/          # Mock-DAOs und Test-Hilfsmittel für Mocha/Sinon
└── utils/            # Crypto-Helfer (sicheres Hashing, timingSafeEqual)
```

---

## 3. Code-Beispiel

```typescript
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Erzeugt eine Express-Middleware zur Validierung des Request-Bodys anhand eines Zod-Schemas.
 *
 * @param schema - Das auszuführende Zod-Validierungsschema.
 * @returns Die konfigurierte Express-Middleware.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        status: "Bad Request",
        errors: result.error.errors
      });
      return;
    }
    req.body = result.data as Record<string, unknown>;
    next();
  };
}
```
