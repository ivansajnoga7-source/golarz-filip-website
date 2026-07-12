# Golarz Filip — strona barbershopu

## Jakiego frameworka użyto?

Strona jest zbudowana jako **czysty HTML / CSS / JavaScript** (bez React, Vue itp.) —
to celowy wybór dla strony wizytówkowej: szybsze ładowanie, prostszy kod, łatwiejsza
edycja treści. Do uruchamiania i budowania projektu używamy **Vite** — lekkiego
narzędzia deweloperskiego, które:

- uruchamia lokalny serwer z automatycznym odświeżaniem po zapisaniu zmian,
- poprawnie serwuje wszystkie pliki CSS/JS/obrazy (to on naprawia problem "strona bez
  stylów", który pojawia się, gdy plik `index.html` jest otwierany bezpośrednio
  z dysku zamiast przez serwer),
- buduje gotową, zoptymalizowaną wersję produkcyjną poleceniem `npm run build`.

Nie ma tu żadnego "backendu" ani bazy danych — to strona statyczna. Cała treść
(nazwy usług, ceny, opinie, dane kontaktowe) znajduje się w jednym pliku:
`public/js/config.js`.

## Jak uruchomić projekt

Wymagany jest zainstalowany [Node.js](https://nodejs.org) (wersja 18 lub nowsza).

```bash
# 1. Zainstaluj zależności (tylko raz, lub po każdej zmianie w package.json)
npm install

# 2. Uruchom serwer deweloperski
npm run dev
```

Po uruchomieniu `npm run dev` w terminalu pojawi się adres, zwykle:

```
http://localhost:5173
```

Otwórz go w przeglądarce — strona powinna wyglądać dokładnie tak, jak w projekcie:
ciemne tło, złote/brązowe akcenty, animacje przy przewijaniu, działający cennik
z zakładkami, galeria z lightboxem, suwak "przed/po" itd.

Panel administracyjny jest dostępny pod:

```
http://localhost:5173/admin.html
```

## Budowanie wersji produkcyjnej (do wgrania na hosting)

```bash
npm run build
```

To polecenie stworzy folder `dist/` ze zoptymalizowaną wersją strony (zminifikowany
CSS/JS, obrazy skopiowane, gotowe do wgrania na dowolny hosting statyczny — np.
Netlify, Vercel, GitHub Pages albo zwykły hosting współdzielony przez FTP).

Aby lokalnie sprawdzić, jak wygląda ta zbudowana wersja przed wgraniem na serwer:

```bash
npm run preview
```

## Struktura projektu

```
├── index.html            ← strona główna
├── admin.html             ← panel administracyjny (edycja treści)
├── package.json           ← zależności i skrypty npm
├── vite.config.js         ← konfiguracja Vite (obsługuje 2 strony: index + admin)
└── public/
    ├── css/
    │   ├── style.css       ← style strony głównej
    │   └── admin.css       ← style panelu administracyjnego
    ├── js/
    │   ├── config.js       ← CAŁA treść strony (nazwy, ceny, opinie, kontakt...)
    │   ├── script.js       ← logika strony głównej (animacje, galeria, itd.)
    │   └── admin.js        ← logika panelu administracyjnego
    └── images/             ← zdjęcia salonu
```

## Jak edytować treść strony

Najprościej przez przeglądarkę: otwórz `/admin.html` w uruchomionym projekcie,
zmień treści w formularzu i kliknij **„Pobierz zaktualizowany plik strony”**.
Pobrany plik `config.js` podmień w folderze `public/js/` na miejsce starego.

Można też edytować `public/js/config.js` bezpośrednio w edytorze tekstu — każde
pole ma czytelną nazwę (np. `contact.phone`, `services.categories`).

## Wdrożenie na Vercel

1. Wgraj projekt do GitHub.
2. Zaloguj się na Vercel i wybierz „Import Project”.
3. Wybierz repozytorium i kliknij „Deploy”.
4. Vercel wygeneruje publiczny adres strony z HTTPS.

Jeżeli chcesz później podłączyć własny domenę, zrobimy to po pierwszym wdrożeniu.
