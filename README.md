# VeganToGo

Barcode-Scanner fürs iPhone: Lebensmittel scannen und sofort sehen, ob sie **vegan** oder **vegetarisch** sind.

**App öffnen:** https://dxvxd42.github.io/vegantogo/
Auf dem iPhone in **Safari** öffnen → **Teilen** → **„Zum Home-Bildschirm“**.

## Was die App kann

- Barcode per Live-Kamera, per Foto oder als eingetippte Nummer prüfen
- klares Urteil mit Begründung und markierten Zutaten
- Zutatenliste fotografieren, wenn ein Produkt nicht in der Datenbank ist (Texterkennung auf dem Gerät)
- Verlauf mit Suche und Filtern, nur auf dem eigenen Gerät gespeichert

## Datenschutz

- kein Konto, keine Werbung, kein Tracking, keine Inhalte von Dritten
- Kamerabilder und Fotos werden nur auf dem Gerät ausgewertet und nie hochgeladen
- nur die Barcode-Nummer wird an [Open Food Facts](https://world.openfoodfacts.org) gesendet, ohne Cookies und ohne Kennung
- Offline-Modus: Die App sendet dann gar nichts

## Inhalt dieses Repos

Dieses Repo enthält nur die fertige App, die GitHub Pages ausliefert:

| Datei | Zweck |
|---|---|
| `index.html` | die App (Barcode-Erkennung eingebettet) |
| `sw.js` | Service Worker für den Offline-Start |
| `tax-data.js` | Zutaten-Datenbank, Auszug aus der Open-Food-Facts-Taxonomie |
| `ocr/` | Texterkennung (Tesseract.js), wird erst bei Bedarf geladen |
| `tools/` | Skripte, die `tax-data.js` täglich neu erzeugen |
| `.github/workflows/pages.yml` | veröffentlicht die App und prüft täglich, ob sich die Zutaten-Datenbank geändert hat |

## Hinweis

Die Produktdaten stammen aus einer freien Community-Datenbank und können unvollständig oder veraltet sein. Im Zweifel immer die Zutatenliste auf der Packung prüfen.

## Lizenzen

ZXing-js und Tesseract.js: Apache-2.0 · Daten und Zutaten-Taxonomie: Open Food Facts, ODbL
