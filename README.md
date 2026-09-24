# Souvage — landing + coaching-ansökan

Statisk sajt för **Vercel**. Formulär → Vercel Serverless Function (`/api/contact`) → Resend → `team.souvage@gmail.com`.

## Snabb deploy på Vercel

1. Skapa konto på [resend.com](https://resend.com) och skapa en API-nyckel.
2. (Rekommenderas) Verifiera en egen domän i Resend och sätt `CONTACT_FROM_EMAIL` till den. Tills dess fungerar `onboarding@resend.dev` för tester.
3. Pusha den här mappen till ett GitHub-repo.
4. Gå till [vercel.com](https://vercel.com) → **Add New Project** → importera GitHub-repot.
5. I Vercel-projektet: **Settings → Environment Variables** och lägg till:
   - `RESEND_API_KEY` = din nyckel från Resend
   - `CONTACT_TO_EMAIL` = `team.souvage@gmail.com`
   - `CONTACT_FROM_EMAIL` = t.ex. `Souvage <hello@souvage.online>` (eller `Souvage <onboarding@resend.dev>` tills domänen är verifierad)
6. Deploy (Vercel gör det automatiskt vid import). Testa formuläret på den tillfälliga `*.vercel.app`-URL:en.
7. Koppla egen domän (souvage.online) under **Settings → Domains** och uppdatera DNS hos Namecheap enligt Vercels instruktioner.

## Lokal test (valfritt)

```bash
npm install
npx vercel dev
```

## Vad som ändrats från Netlify-versionen

- `netlify/functions/contact.js` → `api/contact.js` (Vercel serverless-format)
- Formuläret anropar nu `/api/contact` istället för `/.netlify/functions/contact`
- `netlify.toml` behövs inte längre (kan tas bort)
