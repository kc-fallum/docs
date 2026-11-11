# ADR-001: Minecraft Management Protocol als Java-Verwaltungsgrenze

## Status
Accepted

## Date
2026-10-28

## Context

Das Gameserver-Dashboard hat Java-Versionen, Bedrock und mehrere Steuerungswege
über ein gemeinsames Settings-Modell abgebildet. Dadurch mussten dieselben
Einstellungen über `server.properties`, NBT, RCON und versionsabhängige
GameRule-Namen synchronisiert werden. Fehler waren besonders bei modernen
Java-Releases schwer erkennbar, weil Konsolenausgaben und Dateizustände keine
verlässliche typisierte Rückmeldung liefern.

Minecraft Java stellt ab 1.21.9 ein natives Management Server Protocol über
JSON-RPC 2.0 und WebSocket bereit.

## Decision

- Java-Server ab 1.21.9 verwenden das Management Server Protocol als primäre
  Live-Verwaltungs-API.
- Moderne Java-GameRules, Operatoren, Allowlist, Bans sowie unterstützte
  Servereinstellungen werden über typisierte Management-Aufrufe synchronisiert.
- Der JSON-RPC-Client besitzt eine zentrale Methodentyp-Tabelle für Requests,
  Parameter und Rückgabewerte. Neue Protocol-Methoden werden dort ergänzt,
  statt untypisierte String-Weiterleitungen im Fachcode zu verteilen.
- GameRule-IDs werden als exakte Protocol-IDs behandelt. Es gibt keine
  heuristische Normalisierung oder Alias-Suche; ein Server muss die erwartete
  Protocol-Regel tatsächlich liefern.
- Das Backend erkennt diese Grenze über `hasRMP()` und
  nicht über einzelne GameRule-Namen.
- Java-Versionen unter 1.21.9 bleiben startbar, erhalten aber bewusst nur
  Console-, Storage- und Multiplayer-Zugriff. Allgemeine Java-Settings werden
  für diese Versionen serverseitig abgelehnt.
- Bedrock behält seine bestehende datei- und commandbasierte Konfiguration.
- RCON bleibt ausschließlich Fallback für Funktionen, für die das Management
  Protocol keine Methode anbietet, zum Beispiel Plugin- oder Mod-Commands.
- Die Frontend-Navigation blendet nicht unterstützte Java-Legacy-Sektionen aus.

## Consequences

- Moderne Java-Versionen benötigen einen erreichbaren Management-Port und ein
  Instanz-Secret.
- Das Management Protocol ist nur verfügbar, solange der Minecraft-Prozess
  läuft. Offline-Weltinformationen müssen aus dem Storage gelesen werden.
- Die alte Java-GameRule-Auflösung ist nicht mehr der Live-Pfad für moderne
  Java-Server.
- Die Oberfläche ist bei alten Java-Versionen bewusst kleiner, statt eine
  zweite inkompatible Settings-Implementierung zu pflegen.
- Plugin-/Mod-spezifische Verwaltung bleibt außerhalb des Protocols und nutzt
  weiterhin RCON oder die jeweilige Extension-API.
- Die Multiplayer-Synchronisation älterer Java-Versionen bleibt über RCON
  aktiv. Der harte Schnitt entfernt dort nur allgemeine Settings, nicht
  Whitelist-, Operator- und Ban-Verwaltung.
- `InstanceSettings` bleibt die persistente Quelle für Offline-Konfiguration.
  Beim Speichern werden Dateien aktualisiert; bei laufenden modernen Java-
  Servern werden die geänderten Werte zusätzlich live über das Protocol
  synchronisiert.
- Automatische Backups und der optionale tägliche Auto-Restart werden als
  BullMQ-Scheduler persistiert. Die Restart-Zeit wird als `HH:mm` in der
  Server-Zeitzone des Gameservice interpretiert.
