Google Places API — szybka instrukcja (PL)

1) Stwórz projekt w Google Cloud Console
- Wejdź na https://console.cloud.google.com/ → "Select a project" → "New Project".

2) Włącz Places API
- Wyszukaj "Places API" w Library → kliknij "Enable".

3) Skonfiguruj billing
- Places API wymaga aktywnego billing account (możesz dostać darmowy kredyt przy pierwszej rejestracji).

4) Utwórz API Key
- W sekcji "Credentials" → Create Credentials → API key.
- Ogranicz klucz do Addresses/Places i do twojego serwera (opcjonalnie).

5) Znajdź `place_id` dla swojej lokalizacji
- Użyj Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id
- Wpisz adres salonu — skopiuj `place_id`.

6) Ustaw zmienne środowiskowe na serwerze
- Na maszynie/serwerze ustaw:
  - `GOOGLE_API_KEY` — wartość API key
  - `GOOGLE_PLACE_ID` — wartość place_id

Przykład (Linux / macOS):
```bash
export GOOGLE_API_KEY="YOUR_KEY"
export GOOGLE_PLACE_ID="PLACE_ID"
npm run server
```

Przykład (Windows PowerShell):
```powershell
$env:GOOGLE_API_KEY = 'YOUR_KEY'
$env:GOOGLE_PLACE_ID = 'PLACE_ID'
npm run server
```

7) Test
- Po uruchomieniu serwera wywołaj:
  `GET http://localhost:3001/api/reviews`
- Powinieneś zobaczyć JSON z recenzjami (zwłaszcza jeśli lokalizacja ma publiczne opinie).

Uwaga o kosztach i limicie
- Places API jest płatne wg. stawek Google; pamiętaj o cache (endpoint cacheuje odpowiedź przez 12h), żeby ograniczyć koszty.
- Nie wyświetlaj zmodyfikowanych tekstów opinii — pokazuj je tak, jak zwraca Google.
