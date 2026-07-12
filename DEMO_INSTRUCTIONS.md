Demo: jak szybko wystawić stronę (Vercel) i pokazać klientowi

1) Push na GitHub
- Stwórz repo i wypchnij kod:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOURUSER/golarzfillip.git
git push -u origin main
```

2) Szybkie wdrożenie na Vercel (darmowy, HTTPS, prosty podgląd)
- Zarejestruj konto na https://vercel.com i połącz z GitHub.
- Kliknij "Import Project" → wybierz repo `golarzfillip` → Deploy.
- Po chwili dostaniesz poddomenę `your-app.vercel.app` — to jest demo URL, który możesz pokazać barberowi.

Uwagi dotyczące API rezerwacji
- Obecnie w projekcie jest prosty `server.js` (Express) i lokalne przechowywanie w `data/bookings.json`.
- Na Vercel pliki systemu plików nie są trwałe dla funkcji serverless. Dwie opcje:
  1) Zostawić tylko front (strona statyczna) — demo UI działa, ale rezerwacje będą lokalne (w przeglądarce) lub nieutrwalone.
  2) Dodać zewnętrzne DB (Supabase/Postgres/Firestore) i przepisać API do serverless, żeby rezerwacje były trwałe. Supabase ma darmowy plan i prostą integrację.

Szybki scenariusz (najmniej pracy):
- Deploy na Vercel → pokaż demo URL klientowi jako "voorbeeld".
- Jeśli klient chce, skonfigurujemy Supabase + przeniesiemy backend do funkcji serverless (nie dużo pracy).

Jak zaktualizować booking.apiUrl po wdrożeniu
- Jeśli zostawisz API jako serverless (Vercel Functions), endpoint będzie np. `https://your-app.vercel.app/api/bookings`.
- Otwórz `public/js/config.js` → ustaw `booking.apiUrl` na ten URL lub na produkcyjny endpoint Fly/Render.

Krótka lista rzeczy, które mogę zrobić ja
- Przygotować & wypchnąć repo na GitHub (jeśli dasz uprawnienia lub zrobisz fork).
- Skonwertować backend do Vercel serverless + wskazać instrukcję jak dodać Supabase dla trwałych rezerwacji.
- Wystawić demo i dostarczyć gotowy link, który możesz wysłać barberowi.

Chcesz, żebym: (odpowiedz jednym zdaniem)
- "Zrób push + deploy na Vercel" — zrobię pliki i krok po kroku pomogę,
- albo "Tylko przygotuj repo" — przygotuję instrukcję i pliki, ty sam wypchniesz.
