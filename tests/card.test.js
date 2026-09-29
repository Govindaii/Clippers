const test = require("node:test");
const assert = require("node:assert/strict");
const Card = require("../js/card.js");

// Fake font: every character is 0.5 × font size wide
const measureAt = (size) => (s) => s.length * size * 0.5;

test("wrapLines keeps every line within the width", () => {
  const measure = measureAt(20); // 10px per char
  const lines = Card.wrapLines("The quick brown fox jumps over the lazy dog again and again", 100, measure);
  assert.ok(lines.length > 1);
  for (const l of lines) assert.ok(measure(l.text) <= 100, `"${l.text}" is too wide`);
  assert.equal(lines.map((l) => l.text).join(" "), "The quick brown fox jumps over the lazy dog again and again");
});

test("wrapLines marks the first line of each new paragraph", () => {
  const lines = Card.wrapLines("First paragraph.\n\nSecond one.\n\nThird.", 1000, measureAt(10));
  assert.deepEqual(
    lines.map((l) => [l.text, l.paragraphStart]),
    [
      ["First paragraph.", false],
      ["Second one.", true],
      ["Third.", true],
    ]
  );
});

test("wrapLines splits a word that is wider than the line", () => {
  const measure = measureAt(20);
  const lines = Card.wrapLines("supercalifragilistic", 100, measure);
  assert.ok(lines.length > 1);
  for (const l of lines) assert.ok(measure(l.text) <= 100);
  assert.equal(lines.map((l) => l.text).join(""), "supercalifragilistic");
});

test("fitText makes short quotes bigger than long ones and always fits", () => {
  const box = { maxWidth: 800, maxHeight: 600, maxSize: 72, floor: 20 };
  const short = Card.fitText("Short and sweet.", box, measureAt);
  const long = Card.fitText("A much longer quote that needs to wrap over many lines to fit. ".repeat(4), box, measureAt);
  assert.equal(short.fontSize, 72);
  assert.ok(long.fontSize < short.fontSize);
  assert.ok(long.height <= box.maxHeight);
});

test("initials are taken from the first and last word", () => {
  assert.equal(Card.initials("Raj Kumar Singh"), "RS");
  assert.equal(Card.initials("CSB"), "CS");
  assert.equal(Card.initials(""), "?");
});
