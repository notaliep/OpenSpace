# Test info

- Name: Użytkownik przechodzi do widoku rezerwacji z przycisku na stronie głównej
- Location: D:\52\apka na licencjat\OpenSpace\android\tests\basic.spec.js:3:5

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8081/
Call log:
  - navigating to "http://localhost:8081/", waiting until "load"

    at D:\52\apka na licencjat\OpenSpace\android\tests\basic.spec.js:7:14
```

# Test source

```ts
   1 | import { test, expect } from "@playwright/test";
   2 |
   3 | test("Użytkownik przechodzi do widoku rezerwacji z przycisku na stronie głównej", async ({
   4 |   page,
   5 | }) => {
   6 |   // Otwórz aplikację Expo Web
>  7 |   await page.goto("http://localhost:8081");
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8081/
   8 |
   9 |   // Czekamy, aż pojawi się przycisk o widocznym tekście
  10 |   const reserveButton = page.getByRole("button", {
  11 |     name: "Zarezerwuj miejsce",
  12 |   });
  13 |   await expect(reserveButton).toBeVisible();
  14 |
  15 |   // Klikamy
  16 |   await reserveButton.click();
  17 |
  18 |   // Oczekujemy, że zostaliśmy przeniesieni np. na stronę rezerwacji
  19 |   await expect(page).toHaveURL(/reservation|zarezerwuj/i);
  20 |
  21 |   // I sprawdzamy, czy pojawia się jakiś kluczowy element widoku
  22 |   await expect(page.getByText(/Wybierz miejsce|Lista miejsc/i)).toBeVisible();
  23 | });
  24 |
```