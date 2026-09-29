# ❝ Quote Studio

Press one button and get a **relatable, tweet-style quote card** that's ready to post on Instagram, LinkedIn or X, for your brand page and your personal profile.

- **One-click Generate**: picks a fresh quote, draws the card and writes the caption with hashtags.
- **254 original quotes** built in (English + Hinglish), across 10 topics: Growth, Discipline, Relationships, Money, Career & Business, Self-worth, Lonely Phase, Failure, Creators, Mindset. It never repeats a quote until you've seen them all.
- **AI mode (optional)**: Claude writes brand-new quotes for *your* audience, in English, Hinglish or Hindi.
- **Multiple profiles**: switch between your brand (CSB) and your personal profile. Each has its own name, @handle, photo and blue tick.
- **Batch mode**: make 7 posts at once (a week of content) and download them all.
- **Card styles**: black / dark grey / white background, 1:1, 4:5 or 9:16 (story/reel) sizes.
- Works on your phone too. The **Share…** button sends the image straight to Instagram.

No install, no sign-up, no build step. It's just an HTML page.

---

## How to use it

### Option A: open it from your computer (easiest)

1. On GitHub, click the green **Code** button → **Download ZIP**, and unzip it.
2. Double-click **`index.html`**. It opens in your browser.
3. Click **Edit this profile**. Set your name and @handle, then upload your photo.
4. Press **✨ Generate** → **⬇ Download PNG** → post it!

### Option B: put it online for free (open it on your phone)

GitHub can host this page for you with **GitHub Pages**:

1. Make sure the code is on your `main` branch (merge the pull request first).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, set **Branch** to **`main`** and **`/ (root)`**, then click **Save**.
4. After about a minute your app is live at **https://govindaii.github.io/Clippers/**. Bookmark it on your phone.

> Your profiles and settings are saved in the browser you use, so your phone and your laptop each keep their own.

---

## AI mode (optional)

The built-in library is free and works offline. For **unlimited, brand-new** quotes written for your exact audience:

1. Create an API key at [console.anthropic.com](https://console.anthropic.com) (you'll need to add a little credit; each Generate click costs a few cents).
2. In the app, choose **AI (Claude)**, paste the key, and optionally type a topic ("exam pressure", "first job", "startup life"…).
3. Fill in **Who is this profile for?** and **Voice / brand notes** in each profile. The AI uses them, so your brand page and personal page sound different.

It remembers your last 30 AI quotes per profile and asks Claude not to repeat those ideas.

🔐 Your key is stored only in that browser's local storage and is sent only to Anthropic. Don't save it on a shared computer.

---

## Daily quote ideas (a GitHub Action)

Every morning at about **7:45 AM India time**, a GitHub Action opens an **Issue** in this repo with 3 quote ideas and ready-made captions. GitHub notifies you, so it doubles as your "time to post" reminder. Yesterday's issue is closed automatically.

- Try it now: **Actions** tab → **Daily quote ideas** → **Run workflow**.
- Turn it off: **Actions** tab → **Daily quote ideas** → **⋯** → **Disable workflow**.

---

## Add your own quotes

Open [`js/quotes.js`](js/quotes.js) and add a line to any topic:

```js
growth: [
  "Your new quote goes here.",
  "Two paragraphs work too.\n\nJust put \\n\\n where the break goes.",
  ...
```

Then run the tests (see below) to check for duplicates and quotes that are too long.

---

## For developers

```
index.html                  the page
css/style.css               the look of the app
js/quotes.js                quote library + no-repeat picker + captions
js/card.js                  draws the tweet-style card on a <canvas>
js/ai.js                    optional Claude API call (Anthropic SDK, loaded from jsDelivr)
js/app.js                   buttons, profiles, saving settings, downloads
tests/                      automatic checks (run with: npm test)
scripts/daily-quotes.js     builds the daily Issue text (try: npm run daily)
.github/workflows/          GitHub Actions: tests on every push/PR, daily quote ideas
```

Run the tests (needs [Node.js](https://nodejs.org) 20+):

```bash
npm test
```

New to GitHub? Read **[docs/GITHUB_FOR_BEGINNERS.md](docs/GITHUB_FOR_BEGINNERS.md)**.
