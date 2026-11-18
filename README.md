# ChargeCalculator

**ChargeCalculator** is a production-ready, mobile-first financial charge calculator web application built for Bangladesh. It calculates exact transaction charges, maximum withdrawable/transferable amounts, and remaining balances for **bKash**, **Nagad**, **Nagad Islamic**, **ATM**, **Send Money**, and **NPSB / Direct Bank** transfers—all locally in the browser with zero external backend dependencies.

- **Default Language:** Bangla (`বাংলা`) with instant English (`EN`) toggle
- **Offline Ready:** Installable Progressive Web App (PWA) via `vite-plugin-pwa`
- **Precision:** Integer poisha (`1 BDT = 100 poisha`) + `BigInt` arithmetic with integer binary search inverse solvers

---

## Features

1. **bKash Cash Out Calculator**
   - Simultaneous comparison of **Normal Agent** (`BDT 18.50 / 1,000`) and **Priyo Agent** (`BDT 13.95 / 1,000`), automatically highlighting the cheaper method and savings.
   - **Priyo Agent Monthly Allowance Tracker** (`BDT 50,000 / calendar month`) stored locally with automatic calendar-month reset. Correctly enforces bKash's crossing rule (transactions exceeding the remaining discounted allowance incur the Normal Agent rate on the entire crossing transaction, never a blended fee).
   - **ATM Cash Out** (auto-revealed at balance `≥ BDT 3,000`): supports **Regular ATM** (`BDT 14.90 / 1,000`) and **Eligible Remittance ATM** (`BDT 7.00 / 1,000` with optional eligible remittance balance cap), enforcing minimum withdrawal + fee coverage (`BDT 3,044.70` / `BDT 3,021.00`), `BDT 500` denominations, and per-transaction limits.
2. **Nagad & Nagad Islamic Cash Out Calculator**
   - **Nagad Regular:** simultaneous comparison of **App** (`BDT 12.99 / 1,000`) and **USSD `*167#`** (`BDT 15.00 / 1,000`), VAT-inclusive.
   - **Nagad Islamic:** App & USSD (`BDT 15.00 / 1,000`, configurable).
3. **Send Money Calculator (Fee-Inclusive)**
   - **bKash → bKash:** Fixed-fee & monthly-tier rules (Normal number free `≤ BDT 50`, Priyo number free up to `BDT 25,000/mo`, `BDT 5` up to `50,000/mo`, `BDT 10` above `50,000/mo`) with monthly usage tracker and crossing explanations.
   - **Nagad → Nagad & Nagad Islamic:** Configurable flat fee (`BDT 5.00`), clearly distinguished from percentage charges.
   - Dual modes: *"I want to send this amount"* (recipient receives the exact stated amount) and *"I have this balance"* (maximum sendable including fee).
4. **NPSB & Direct Bank Transfer Calculator**
   - **NPSB Interoperable Transfers:** Verified `BDT 8.50 / 1,000` (`0.85%`) across `bKash → Bank/Nagad/Rocket` (verified `BDT 300–25,000` limits) and `Nagad → Bank/bKash/Rocket` (transparently labeled to confirm route availability and limits in the provider app).
   - **Direct bKash-to-Bank (Non-NPSB):** Separate channel clearly labeled as bank-specific non-NPSB rates (`BDT 10.00` & `BDT 12.50 / 1,000`).
5. **Centralized Rate Configuration & Settings**
   - Inspect all official defaults, customize any rate or limit inline with immediate recalculation, distinguish Official Default vs Customized rates, restore defaults anytime, and view verification dates & source links.
6. **Smart UX & Privacy**
   - Whole Taka (default) and Precise (2 decimals) modes, quick chips (`100` to `10,000`), copy summary, light & dark themes, Hind Siliguri Bangla typography, and 100% local privacy (never requests PIN, OTP, or credentials).

---

## Installation & Local Development

```bash
git clone https://github.com/Rahat0764/ChargeCalculator.git
cd ChargeCalculator
npm install
npm run dev
```

*(On Android Termux Internal Storage, use `npm install --no-bin-links --omit=optional`.)*

---

## Testing

### Unit & Property-Based Financial Tests (Vitest)
```bash
npm test
```

### Linting & Type Checking
```bash
npm run lint
npx tsc --noEmit
```

### Browser E2E Tests (Playwright)
```bash
npm run build
npm run test:e2e
```
Covers viewports `360px`, `390px`, `768px`, and `1440px` for layout overflow, SVG/logo loading, interactive controls, theme/language toggles, and financial outputs.

---

## Production Build

```bash
npm run build
```

---

## Rate Configuration & Official Sources (Verified: November 18, 2026)

All rates are defined centrally in [`src/config/rates.ts`](src/config/rates.ts) and can be customized at runtime inside the app's **Rates & Settings** page.

| Service / Channel | Default Rate | Status | Official Source |
| :--- | :--- | :--- | :--- |
| bKash Normal Agent Cash Out | BDT 18.50 / 1,000 | Verified | [bKash Cash Out](https://www.bkash.com/en/products-services/cashout) |
| bKash Priyo Agent Cash Out | BDT 13.95 / 1,000 (≤50k/mo) | Verified | [bKash Agent Cash Out](https://www.bkash.com/en/products-services/cashout-from-agent) |
| bKash Regular ATM Cash Out | BDT 14.90 / 1,000 (min 3,000, ×500) | Verified | [bKash ATM Cash Out](https://www.bkash.com/en/products-services/cash-out-from-atm) |
| bKash Remittance ATM | BDT 7.00 / 1,000 (eligible funds) | Verified | [bKash Remittance ATM](https://www.bkash.com/en/products-services/remittance/remittance-cash-out-from-atm) |
| bKash Send Money | Free (≤50 normal / ≤25k Priyo), BDT 5 (≤50k), BDT 10 (>50k) | Verified | [bKash Send Money](https://www.bkash.com/en/products-services/send-money/send-money-to-priyo-number) |
| NPSB Transfer (MFS → Bank/MFS) | BDT 8.50 / 1,000 (0.85%) | Verified | [bKash NPSB](https://www.bkash.com/en/page/npsb-b2b-b2mfs) / [Bangladesh Bank](https://www.bb.org.bd/) |
| Direct bKash → Bank (Non-NPSB) | BDT 10.00 or 12.50 / 1,000 | Configurable | [bKash to Bank](https://www.bkash.com/en/products-services/bkash-to-bank) |
| Nagad Regular Cash Out | App 12.99 / USSD 15.00 per 1,000 | Verified | [Nagad Limit & Charges](https://nagad.com.bd/en/limit-charges/) |
| Nagad Islamic Cash Out | App & USSD 15.00 per 1,000 | Verified | [Nagad Islamic Charges](https://nagadislamic.com.bd/en/limit-and-charges/) |
| Nagad & Islamic Send Money | BDT 5.00 flat per transaction | Verified | [Nagad Limit & Charges](https://nagad.com.bd/en/limit-charges/) |

---

## Known Limitations

- ChargeCalculator is an independent utility and does **not** connect to your bKash, Nagad, or bank accounts; monthly Priyo Agent and Send Money trackers rely on manually entered local values and reset each calendar month.
- Promotional offers (such as temporary cashback campaigns or bank-specific ATM caps) may change without notice—always confirm the final fee in your financial provider's app before completing a transaction.
- Brand badges in `public/brands/` are original typographic SVG representations created locally without hotlinking external proprietary assets.

---

## Deployment

- **Live Production URL:** [https://charge-calculator-beta.vercel.app](https://charge-calculator-beta.vercel.app)
- **GitHub Repository:** [https://github.com/Rahat0764/ChargeCalculator](https://github.com/Rahat0764/ChargeCalculator)
- Configured for automatic GitHub-to-Vercel static SPA + PWA deployment (`vercel.json` + Vite build output in `dist/`).
