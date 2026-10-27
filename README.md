# GoalRush AI — Virtual Football Analyst

A phone-friendly Next.js starter for reviewing manually entered virtual-football 1X2 odds.

## Current features
- Responsive dashboard for mobile and desktop.
- Match form for home/draw/away decimal odds.
- API route validates the submitted fields and calculates normalized market-implied probabilities.
- Analysis history is saved in the current browser's local storage.
- No login, betting credentials, payment handling, or automatic betting.

## Important limitations
This first version does not connect to Football.com, fetch live virtual fixtures, or predict a random number generator. The displayed percentages are derived from the odds the user enters; they are not independent predictions and do not guarantee a result. Only connect a data provider if it is officially supported and authorized.

## Run locally
Requires Node.js compatible with Next.js 16.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy on Render from a phone
1. Upload the complete project folder contents to a GitHub repository. Do not upload only the five configuration files.
2. In Render, choose **New + → Web Service** and connect the GitHub repository.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Select a Node runtime if prompted. No environment variables are required for this first demo.
6. Deploy and open the generated Render URL.

If Render asks for a root directory, leave it blank when `package.json` is at the repository root.

## Database note
The starter keeps history in browser local storage, so it is not shared across devices. A PostgreSQL database can be added later. Set `DATABASE_URL` as a private Render environment variable when database code is introduced. Never commit a real database URL or secret to GitHub.
