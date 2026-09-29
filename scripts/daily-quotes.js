#!/usr/bin/env node
/*
 * Prints today's 3 quote ideas as Markdown.
 * The GitHub Action in .github/workflows/daily-quotes.yml posts this as an Issue every morning.
 * Try it yourself: `npm run daily`
 */
const Q = require("../js/quotes.js");

// Same date → same picks, so re-running on the same day gives the same list.
function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const today = new Date();
const seed = Number(today.toISOString().slice(0, 10).replace(/-/g, ""));
const random = seededRandom(seed);

const english = Q.pickQuotes({ count: 2, langs: ["en"], random }).quotes;
const hinglish = Q.pickQuotes({ count: 1, langs: ["hinglish"], random }).quotes;
const picks = [...english, ...hinglish];

const lines = [
  "Good morning! Here are today's 3 quote ideas. Pick one, open Quote Studio, paste it in and post. 🚀",
  "",
];
picks.forEach((q, i) => {
  lines.push(`### ${i + 1}. ${Q.CATEGORIES[q.category]}${q.lang === "hinglish" ? " · Hinglish" : ""}`);
  lines.push("");
  lines.push(...q.text.split("\n").map((l) => "> " + l));
  lines.push("");
  lines.push("**Caption:**");
  lines.push("```");
  lines.push(Q.makeCaption(q, random));
  lines.push("```");
  lines.push("");
});
lines.push("---");
lines.push("_Posted automatically by the **Daily quote ideas** GitHub Action. Close this issue once you've posted._");

console.log(lines.join("\n"));
