---
title: "@kc-fallum/components"
description: Wiederverwendbare Lit Web Components, Design-Tokens und Themes
sidebar_position: 4
---

# UI Components (`@kc-fallum/components`)

Das Paket `@kc-fallum/components` liegt unter `packages/frontend/components` und stellt eine eigenständige Design-System- und Komponentenbibliothek für alle Webanwendungen bereit.

---

## 1. Verantwortlichkeiten

* **Wiederverwendbare Web Components:** Buttons, Modale, Ladebalken (`progress-bar`), Logo-Widgets, Fehleranzeigen (`error-widget`) und Navigationsleisten.
* **Design-Tokens & CSS-Variablen:** Definition von Farbpaletten, Abständen und Typografie in `variables.css` und `root.css`.
* **Dark- / Light-Theme-Steuerung:** Reaktive Theme-Umschaltung über CSS-Klassen und `@lit/context`.
* **Editor- und Chart-Integrationen:** Kapselung von Tiptap (Rich-Text), CodeMirror und Chart.js als Lit Custom Elements.

---

## 2. Projektstruktur

```text
packages/frontend/components/src/
├── assets/           # Icons, Logos und grafische Ressourcen
├── components/       # Lit Web Components (Button, Dialog, Widgets)
├── context/          # Lit Context-Definitionen (Router, Theme, Appearance)
├── controllers/      # Reaktive Controller für DOM- und Event-Handling
├── stories/          # Storybook-Dokumentation für isolierte UI-Tests
└── variables.css     # CSS-Variablen für Farb- und Kontrast-Tokens
```

---

## 3. Code-Beispiel

```typescript
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Zeigt eine Fehlermeldung mit Titel, Beschreibung und optionaler Aktionsschaltfläche an.
 */
@customElement("error-widget")
export class ErrorWidget extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      border-radius: 0.5rem;
      background: var(--color-surface, #ffffff);
    }
    h2 {
      color: var(--color-danger, #ef4444);
      margin: 0 0 0.5rem 0;
    }
  `;

  @property({ type: String }) title = "";
  @property({ type: String }) description = "";
  @property({ type: String }) href = "";
  @property({ type: String }) text = "";

  override render() {
    return html`
      <div>
        <h2>${this.title}</h2>
        <p>${this.description}</p>
        ${this.href ? html`<a href="${this.href}">${this.text}</a>` : ""}
      </div>
    `;
  }
}
```
