/*
 * Optional "AI mode": asks Claude to write fresh quotes for your audience.
 *
 * Uses the official Anthropic SDK straight from the browser, with YOUR API key.
 * The key is kept in this browser's localStorage only and sent only to api.anthropic.com.
 * Get a key at https://console.anthropic.com (each Generate click costs a few cents).
 */
(function (root) {
  "use strict";

  const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@0.129.0/+esm";
  const MODEL = "claude-opus-5-5";

  const LANGUAGE_NOTES = {
    en: "English.",
    hinglish:
      "Hinglish: Hindi written in Roman script, mixed naturally with English, the way young people in India text each other.",
    hindi: "Hindi, written in Devanagari script.",
  };

  const SYSTEM_PROMPT = `You write short, original quote posts for a social media profile. Each post is shared as a plain-text quote card (it looks like a screenshot of a tweet) on Instagram, LinkedIn and X.

What makes these posts work:
- They say out loud something the reader has privately felt but never put into words, so the reader thinks "this is literally me" and sends it to a friend.
- They are rooted in specific, everyday modern life (EMIs, relatives' opinions, overthinking at 2 AM, the Monday alarm, friends slowly drifting apart, comparing yourself to people online, the quiet work nobody sees) rather than abstract virtues.
- They often turn on a contrast or a reframe: what people think vs. what is true, the cost vs. the reward, now vs. later.
- They sound like a thoughtful friend talking, not a poster on an office wall. Plain words, direct, no preaching.
- Usually 1-3 short sentences, roughly 12-40 words. A second paragraph (separated by a blank line) is fine when it lands the punchline.

Rules:
- Every quote must be original. Never reuse or lightly reword famous quotes, proverbs, or well-known lines from creators, authors or speakers.
- No hashtags, emojis, surrounding quotation marks or attribution inside the quote text.
- Challenge the reader, but never shame groups of people, and don't give medical, legal or specific investment advice.
- Vary the structure across a batch so no two quotes follow the same template.`;

  function schemaFor(categories) {
    return {
      type: "object",
      properties: {
        quotes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string", description: "The quote exactly as it should appear on the card." },
              category: { type: "string", enum: categories },
              caption: {
                type: "string",
                description:
                  "A 1-2 line caption that invites saves, shares or comments, then a blank line, then 5-8 relevant hashtags.",
              },
            },
            required: ["text", "category", "caption"],
            additionalProperties: false,
          },
        },
      },
      required: ["quotes"],
      additionalProperties: false,
    };
  }

  function buildUserPrompt({ count, profile, topic, categoryLabels, language, avoid }) {
    const parts = [];
    parts.push(`Write ${count} quote${count > 1 ? "s" : ""} for the profile "${profile.name || "this profile"}".`);
    if (profile.audience) parts.push(`Audience: ${profile.audience}`);
    if (profile.voice) parts.push(`Voice and brand notes: ${profile.voice}`);
    if (categoryLabels.length) parts.push(`Themes to pick from: ${categoryLabels.join(", ")}.`);
    if (topic) parts.push(`Specific topic for this batch: ${topic}`);
    parts.push(`Language: ${LANGUAGE_NOTES[language] || LANGUAGE_NOTES.en}`);
    if (avoid && avoid.length) {
      parts.push(
        "Already posted recently - don't repeat these ideas or their structure:\n" +
          avoid.map((t) => `- ${t.replace(/\s+/g, " ")}`).join("\n")
      );
    }
    return parts.join("\n\n");
  }

  let sdkPromise = null;
  function loadSdk() {
    if (!sdkPromise) {
      sdkPromise = import(SDK_URL).catch((err) => {
        sdkPromise = null;
        throw new Error("Couldn't load the Anthropic SDK. Check your internet connection and try again. (" + err.message + ")");
      });
    }
    return sdkPromise;
  }

  function friendlyError(Anthropic, err) {
    if (err instanceof Anthropic.AuthenticationError) return "Your API key was rejected. Paste a valid key in AI settings.";
    if (err instanceof Anthropic.PermissionDeniedError) return "This API key doesn't have access to the model. Check your Anthropic Console account.";
    if (err instanceof Anthropic.RateLimitError) return "Too many requests right now. Wait a minute and try again.";
    if (err instanceof Anthropic.BadRequestError) {
      const msg = String(err.message || "");
      if (/credit balance/i.test(msg)) return "Your Anthropic account is out of credits. Add credits in the Anthropic Console.";
      return "The request was rejected: " + msg;
    }
    if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach Anthropic. Check your internet connection.";
    if (err instanceof Anthropic.InternalServerError) return "Anthropic had a temporary problem. Try again in a moment.";
    if (err instanceof Anthropic.APIError) return "Anthropic API error: " + err.message;
    return err && err.message ? err.message : String(err);
  }

  /**
   * Returns [{ text, category, caption }].
   * opts: { apiKey, count, profile, topic, categories: {id: label}, selected: [ids], language, avoid: [texts] }
   */
  async function generateQuotes(opts) {
    if (!opts.apiKey) throw new Error("Add your Anthropic API key in AI settings first.");
    const { default: Anthropic } = await loadSdk();
    const client = new Anthropic({ apiKey: opts.apiKey, dangerouslyAllowBrowser: true });

    const allIds = Object.keys(opts.categories);
    const selected = opts.selected && opts.selected.length ? opts.selected : allIds;

    let response;
    try {
      response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        // If a safety classifier ever declines, retry on Anthropic's recommended fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: {
          effort: "medium",
          format: { type: "json_schema", schema: schemaFor(selected) },
        },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildUserPrompt({
              count: opts.count,
              profile: opts.profile || {},
              topic: (opts.topic || "").trim(),
              categoryLabels: selected.map((id) => opts.categories[id]),
              language: opts.language,
              avoid: opts.avoid,
            }),
          },
        ],
      });
    } catch (err) {
      throw new Error(friendlyError(Anthropic, err));
    }

    if (response.stop_reason === "refusal") {
      throw new Error("Claude declined this request. Try a different topic or wording.");
    }
    if (response.stop_reason === "max_tokens") {
      throw new Error("The answer was cut off. Try generating fewer quotes at once.");
    }

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Claude's answer wasn't in the expected format. Please try again.");
    }
    return (data.quotes || [])
      .filter((q) => q && typeof q.text === "string" && q.text.trim())
      .map((q) => ({ text: q.text.trim(), category: q.category, caption: (q.caption || "").trim() }));
  }

  root.QuoteAI = { MODEL, LANGUAGE_NOTES, generateQuotes, buildUserPrompt, schemaFor };
})(typeof self !== "undefined" ? self : this);
