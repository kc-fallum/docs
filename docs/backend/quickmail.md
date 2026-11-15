---
title: "quickmail Worker"
description: Cloudflare Worker, Resend API Anbindung und Inbound-Mail-Handling
sidebar_position: 9
---

# Quickmail Worker (`backend/quickmail`)

Das Submodul `backend/quickmail` ist ein Serverless Cloudflare Worker mit SvelteKit-Frontend für eingehenden und ausgehenden Mailverkehr.

---

## 1. Verantwortlichkeiten

* **Cloudflare Email Ingest:** Verarbeitung eingehender Club-Mails über Cloudflare Email Routing.
* **Resend Outbound Provider:** Schneller und zustellungsoptimierter Mailversand über die Resend-API.
* **REST API:** Bietet dem internen Backend eine schlanke HTTP-Schnittstelle zur Auslösung von E-Mails ohne direkten SMTP-Handshake.

---

## 2. Code-Beispiel

```typescript
import { createResendClient, ResendClient } from "./resend.js";

interface SendEmailParams {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
}

interface ResendApiResult {
  id: string;
}

/**
 * Sendet eine E-Mail über den Quickmail-Resend-Client ab.
 *
 * @param params - Die E-Mail-Parameter inklusive API-Key und Inhalt.
 * @returns Die Provider-Message-ID.
 */
export async function dispatchMail(params: SendEmailParams): Promise<string> {
  const client: ResendClient = createResendClient(params.apiKey);
  const result = await client.send({
    from: params.from,
    to: params.to,
    subject: params.subject,
    html: params.html
  });
  const data = result as ResendApiResult;
  return data.id;
}
```
