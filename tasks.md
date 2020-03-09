**Feedback nach/vor Usertest**

0. Workflow-Settings:

   - Es fehlt eine Beschreibung, wofür die Metadaten auf der Konfig-Seite sind. Nicht selbsterklärend! 
     -> Was tun die bereits ausgewählten Felder, weshalb kann man zusätzliche auswählen, welche können im nächsten Schritt bearbeitet werden, welche erst zum Schluss…
     Bitte Textfeld einfügen, das wir über das Languagefile befüllen können.

1. - Reihenfolge der Felder anpassbar? (haben wir glaub auf 2. Version verschoben).
     Wie ist die Reihenfolge aber definiert? resp. sie ist sonderbar! (z.B. wenn versehentlich gelöscht und wieder eingefügt). In der Zuweisungsliste hatten wir eine Reihenfolge definiert.

1. Befüllen von Feldern geht nur für Titel, nicht für weitere Felder.

1. Abschliessen von Workflow geht nicht.

1. Navigationsschritte: nach „Prüfen“ kann man „Daten speichern“ oder „Abschliessen“.
   Nach „Daten speichern“ fehlt aber die Option erneut „prüfen“ um danach „abschliessen“ zu können.

1. Seite „Prüfen“/„Daten eingeben“ (Nice to have)

   - Schalter „alles aufklappen/zuklappen“ - alle Untersets und Medieneinträge werden auf- bzw. zugeklappt.
   - Klapptitel „Collection / MediaEntry“ haben Titel der Medieneinträge und Untersets, Hilfreich für die Identifikation der ME/Sets.
   - Medieneintrag-/Set-Thumb führt zu Medieneintrag oder Set (anstatt zu Preview).

---

## questions

wie felder konfig für "fill data"?
option: alles in den common settings, keys:

```yaml
is_common: true|false # taucht bei
is_overridable: true|false # kann einzeln ein anderer wert gesetzt werden?
is_extendable: true|false # z.B. keywords, können einzeln auch andere werte **ergänzt** werden?
is_mandatory: true|false # pflichtfeld für diesen workflow
```

---

## tasks

- [x] reihenfolge felder anpassen nach tabelle

  - `api/datalayer/app/models/workflow.rb`
  - war schon richtig, evtl. verwirrend weil nicht alles aus der tabelle drin ist
  - reihenfolge ist nur initial! angefügt wird immer am ende und man kann (noch) nicht verschieben

- [x] uploader: main button shows "go to workflow" and links to it

- [x] controller/model allows saving of new common_md attributes

- [x] `is_extendable` im UI verstecken (flag kann gesetzt werden aber hat noch keine auswirkung)

- [ ] preview step

  - `preview?fill_data` -> save -> back to main edit (not Preview))
  - on `preview?fill_data` show "save" and "pre"
  - on preview -> "discard and go back" button (bc it does not save)

- [ ] fill date step: for every resource add link to individual edit below thumbnail

- [ ] fix-wert & pflichtfeld & leer

  - [x] soll invalid sein (fehler bei publish!)
  - [ ] wird invalid angezeigt werden bei fill und prüfung

- common meta data values must be sanitized like normal MD values
