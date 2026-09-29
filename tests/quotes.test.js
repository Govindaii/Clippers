const test = require("node:test");
const assert = require("node:assert/strict");
const Q = require("../js/quotes.js");

// Small seeded random so test results are repeatable
function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

test("library has no duplicate quotes", () => {
  const texts = Q.allQuotes().map((q) => q.text.trim().toLowerCase());
  const dupes = texts.filter((t, i) => texts.indexOf(t) !== i);
  assert.deepEqual(dupes, []);
});

test("every quote is non-empty and short enough for a card", () => {
  for (const q of Q.allQuotes()) {
    assert.ok(q.text.trim().length > 10, `too short: ${q.id}`);
    assert.ok(q.text.length <= 220, `too long for a card (${q.text.length} chars): ${q.id}`);
    assert.equal(q.text, q.text.trim(), `extra spaces around: ${q.id}`);
  }
});

test("every quote uses a known category and language", () => {
  for (const q of Q.allQuotes()) {
    assert.ok(q.category in Q.CATEGORIES, `unknown category ${q.category}`);
    assert.ok(q.lang in Q.LANGUAGES, `unknown language ${q.lang}`);
  }
});

test("every English category has plenty of quotes", () => {
  for (const cat of Object.keys(Q.CATEGORIES)) {
    assert.ok(Q.LIBRARY.en[cat].length >= 15, `${cat} only has ${Q.LIBRARY.en[cat].length}`);
  }
});

test("pickQuotes respects topic and language filters", () => {
  const { quotes } = Q.pickQuotes({ count: 3, categories: ["money"], langs: ["hinglish"], random: seeded(1) });
  assert.equal(quotes.length, 3);
  for (const q of quotes) {
    assert.equal(q.category, "money");
    assert.equal(q.lang, "hinglish");
  }
});

test("pickQuotes never repeats until every quote has been shown", () => {
  const used = new Set();
  const pool = Q.filterQuotes({ categories: ["failure"], langs: ["en"] });
  const seen = new Set();
  for (let i = 0; i < pool.length; i++) {
    const { quotes, resetCycle } = Q.pickQuotes({ categories: ["failure"], langs: ["en"], used, random: seeded(i) });
    assert.equal(resetCycle, false);
    assert.ok(!seen.has(quotes[0].id), "repeated a quote too early");
    seen.add(quotes[0].id);
  }
  assert.equal(seen.size, pool.length);

  const next = Q.pickQuotes({ categories: ["failure"], langs: ["en"], used, random: seeded(99) });
  assert.equal(next.resetCycle, true);
  assert.equal(next.quotes.length, 1);
});

test("a batch never contains the same quote twice, even across a reset", () => {
  const pool = Q.filterQuotes({ categories: ["money"], langs: ["hinglish"] });
  const used = new Set(pool.slice(0, pool.length - 1).map((q) => q.id)); // only one fresh quote left
  const { quotes, resetCycle } = Q.pickQuotes({ count: pool.length, categories: ["money"], langs: ["hinglish"], used, random: seeded(3) });
  assert.equal(resetCycle, true);
  assert.equal(new Set(quotes.map((q) => q.id)).size, quotes.length);
});

test("makeCaption adds a hook and topic hashtags", () => {
  const caption = Q.makeCaption({ category: "creator" }, () => 0);
  assert.match(caption, /#contentcreator/);
  assert.match(caption, /#quotes/);
  assert.ok(caption.split("\n\n")[0].length > 5);
});
