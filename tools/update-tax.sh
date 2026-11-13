#!/bin/sh
# Lädt die aktuelle OFF-Zutaten-Taxonomie und aktualisiert tax-data.js (nur bei Änderungen).
# Aufruf: tools/update-tax.sh <tax-data.js> <analyse.js>
set -e
OUT=${1:?tax-data.js}; AN=${2:?analyse.js}
DIR=$(dirname "$0"); T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
BASE=https://raw.githubusercontent.com/openfoodfacts/openfoodfacts-server/main/taxonomies
curl -fsSL --retry 3 -o "$T/ingredients.txt" "$BASE/food/ingredients.txt"
curl -fsSL --retry 3 -o "$T/additives.txt" "$BASE/additives.txt"
python3 -I "$DIR/tax2.py" de,en "$T/tax.json" "$T/ingredients.txt" "$T/additives.txt"
node "$DIR/filter.js" "$T/tax.json" "$OUT" "$AN"
