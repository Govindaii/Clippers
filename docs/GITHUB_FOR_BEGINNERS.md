# GitHub, explained like you're 5 👶

Think of GitHub as **Google Drive for code, with a time machine and a review system built in.**

---

## 📦 Repository ("repo")

A **repo** is a project folder that lives on GitHub. This one is `Govindaii/Clippers`, and it holds every file of Quote Studio.

## 📸 Commit

A **commit** is a **save point**, like saving your progress in a video game.
Each one has a short message saying what changed, like *"Add 254 quotes"*.
You can always go back to any old save point, so nothing is ever really lost.

## 🌿 Branch

A **branch** is a **copy of the project where you can experiment safely**.

- `main` is the **real** version, the one people use.
- Other branches are **drafts**. Claude worked on a branch called `claude/youthful-ritchie-wnr6gg`, so nothing touched `main` until you approve it.

```
main      ●────────────────────────●  (real version)
           \                      /
my-branch   ●────●────●────●────●    (drafts + experiments)
```

## 🙋 Pull Request ("PR")

A **pull request** is you raising your hand and saying:
> *"I made changes on my draft branch. Please look at them, and if they're good, **pull** them into `main`."*

On a PR page you get:

| Tab | What it shows |
|---|---|
| **Conversation** | The description, comments, and the ✅/❌ results of automatic checks |
| **Commits** | Every save point on the branch |
| **Files changed** | Exactly what changed: green lines = added, red lines = removed |

When you're happy, click **Merge pull request** → **Confirm merge**. The draft becomes the real thing on `main`. 🎉
Not happy? Leave a comment asking for changes, or click **Close** to throw the draft away.

**The whole loop:**

```
make a branch → commit changes → open a PR → checks run + people review → merge into main
```

## 🐛 Issues

An **issue** is a **to-do note or a bug report** stuck on the project's notice board (the **Issues** tab).

- "The Download button doesn't work on my phone" → issue
- "Add a Tamil language option" → issue
- "Today's quote ideas" → issue (this repo creates one for you every morning!)

You can comment on issues, label them, assign them to someone, and **close** them when they're done.
Tip: if a PR description says `Fixes #12`, merging the PR closes issue #12 automatically.

## 🤖 Actions

**GitHub Actions** are **robots that do jobs for you** automatically. You tell them *when* to run (on every push, every PR, every morning at 8 AM…) and *what* to do. The instructions live in `.github/workflows/*.yml`.

This repo has two robots:

1. **Tests** (`ci.yml`): every time code is pushed or a PR is opened, it runs `npm test` to check nothing is broken. You'll see a ✅ (all good) or ❌ (something broke) next to the commit and on the PR.
2. **Daily quote ideas** (`daily-quotes.yml`): every morning it opens an issue with 3 quotes to post, and closes yesterday's.

Watch them work in the **Actions** tab. Click any run to see each step and its log.

## 🌐 GitHub Pages

**Pages** turns a repo into a free website. Turn it on in **Settings → Pages** (steps are in the [README](../README.md#option-b-put-it-online-for-free-open-it-on-your-phone)), and Quote Studio will live at `https://govindaii.github.io/Clippers/`.

---

## Your first time, step by step

1. Open the **Pull requests** tab and click the PR.
2. Read the **Files changed** tab. You don't need to understand every line; just get a feel for it.
3. Check that the **Tests** check shows ✅.
4. Click **Merge pull request** → **Confirm merge**.
5. Go to **Settings → Pages**, publish `main`, and open your live app.
6. Go to **Actions → Daily quote ideas → Run workflow** and watch your first "quote ideas" issue appear in the **Issues** tab.

That's the whole GitHub workflow. Everything else is practice. 🚀
