const test = require("node:test");
const assert = require("node:assert/strict");
const { QuoteAI } = require("../js/ai.js");

test("the prompt includes audience, topic, language and quotes to avoid", () => {
  const prompt = QuoteAI.buildUserPrompt({
    count: 3,
    profile: { name: "CSB", audience: "college students", voice: "calm" },
    topic: "exam pressure",
    categoryLabels: ["Growth", "Mindset"],
    language: "hinglish",
    avoid: ["An old quote\n\nwith two paragraphs"],
  });
  assert.match(prompt, /Write 3 quotes for the profile "CSB"/);
  assert.match(prompt, /college students/);
  assert.match(prompt, /exam pressure/);
  assert.match(prompt, /Growth, Mindset/);
  assert.match(prompt, /Hinglish/);
  assert.match(prompt, /- An old quote with two paragraphs/);
});

test("the JSON schema only allows the selected categories", () => {
  const schema = QuoteAI.schemaFor(["money", "career"]);
  const item = schema.properties.quotes.items;
  assert.deepEqual(item.properties.category.enum, ["money", "career"]);
  assert.deepEqual(item.required, ["text", "category", "caption"]);
  assert.equal(item.additionalProperties, false);
  assert.equal(schema.additionalProperties, false);
});
