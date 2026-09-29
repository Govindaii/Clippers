/*
 * Quote Studio: wires the page together.
 * Everything you set up (profiles, style, API key) is saved in this browser's localStorage.
 */
(function () {
  "use strict";

  const { CATEGORIES, pickQuotes, makeCaption } = window.QuoteEngine;
  const Card = window.CardRenderer;
  const STORAGE_KEY = "quoteStudio.v1";
  const HISTORY_LIMIT = 60;

  const $ = (id) => document.getElementById(id);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const uid = () => Math.random().toString(36).slice(2, 10);

  function defaultState() {
    return {
      profiles: [
        {
          id: uid(),
          name: "CSB",
          handle: "@csb",
          badge: "blue",
          avatar: null,
          audience: "students and young professionals who want to grow their career and money",
          voice: "clear, honest, practical. Speaks like a mentor who has been there.",
        },
        {
          id: uid(),
          name: "Your Name",
          handle: "@yourhandle",
          badge: "blue",
          avatar: null,
          audience: "people in their 20s figuring out life, work and relationships",
          voice: "personal, warm and a little bold. Shares lessons from my own journey.",
        },
      ],
      activeProfileId: null,
      style: { theme: "black", size: "portrait", font: "classic", align: "left" },
      source: "library",
      categories: [],
      language: "en",
      count: 1,
      aiTopic: "",
      apiKey: "",
      used: [],
      history: [],
      batch: [],
      batchIndex: 0,
    };
  }

  function loadState() {
    const base = defaultState();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.profiles) && saved.profiles.length) {
        return { ...base, ...saved, style: { ...base.style, ...saved.style } };
      }
    } catch (e) {
      /* storage unavailable or corrupted: start fresh */
    }
    return base;
  }

  let state = loadState();
  if (!state.profiles.some((p) => p.id === state.activeProfileId)) state.activeProfileId = state.profiles[0].id;

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        setStatus("Couldn't save settings in this browser (storage is full or blocked).", true);
      }
    }, 200);
  }

  const activeProfile = () => state.profiles.find((p) => p.id === state.activeProfileId);
  const currentItem = () => state.batch[state.batchIndex] || null;

  // Decoded avatar images, keyed by profile id
  const avatarCache = new Map();
  function avatarImage(profile) {
    if (!profile.avatar) return Promise.resolve(null);
    const cached = avatarCache.get(profile.id);
    if (cached && cached.src === profile.avatar) return cached.promise;
    const img = new Image();
    const promise = new Promise((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
    });
    img.src = profile.avatar;
    avatarCache.set(profile.id, { src: profile.avatar, promise });
    return promise;
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  const canvas = $("card");

  async function fontsReady() {
    if (!document.fonts || !document.fonts.load) return;
    if (state.style.font === "inter") {
      await Promise.all([document.fonts.load("400 40px Inter"), document.fonts.load("700 40px Inter")]).catch(() => {});
    }
  }

  async function drawCard(targetCanvas, item, profile) {
    await fontsReady();
    const img = await avatarImage(profile);
    Card.draw(targetCanvas, {
      text: item ? item.text : "Press ✨ Generate to create your first quote.",
      profile: { name: profile.name, handle: profile.handle, badge: profile.badge, avatarImg: img },
      ...state.style,
    });
  }

  let renderToken = 0;
  async function renderPreview() {
    const token = ++renderToken;
    const tmp = document.createElement("canvas");
    await drawCard(tmp, currentItem(), activeProfile());
    if (token !== renderToken) return; // a newer render started meanwhile
    canvas.width = tmp.width;
    canvas.height = tmp.height;
    canvas.getContext("2d").drawImage(tmp, 0, 0);
  }

  function renderEditor() {
    const item = currentItem();
    $("quoteText").value = item ? item.text : "";
    $("caption").value = item ? item.caption : "";
  }

  function renderBatch() {
    const list = $("batchList");
    list.textContent = "";
    $("batchWrap").hidden = state.batch.length < 2;
    state.batch.forEach((item, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = `${i + 1}. ${item.text}`;
      if (i === state.batchIndex) btn.setAttribute("aria-current", "true");
      btn.addEventListener("click", () => {
        state.batchIndex = i;
        save();
        renderEditor();
        renderBatch();
        renderPreview();
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function renderProfiles() {
    const tabs = $("profileTabs");
    tabs.textContent = "";
    state.profiles.forEach((p) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(p.id === state.activeProfileId));
      const img = document.createElement("img");
      img.alt = "";
      img.src = p.avatar || initialsAvatar(p.name);
      tab.appendChild(img);
      tab.appendChild(document.createTextNode(p.name || "Untitled"));
      tab.addEventListener("click", () => {
        state.activeProfileId = p.id;
        save();
        renderProfiles();
        renderPreview();
      });
      tabs.appendChild(tab);
    });

    const p = activeProfile();
    $("pName").value = p.name;
    $("pHandle").value = p.handle;
    $("pBadge").value = p.badge;
    $("pAudience").value = p.audience || "";
    $("pVoice").value = p.voice || "";
    $("pAvatarPreview").src = p.avatar || initialsAvatar(p.name);
    $("pAvatarRemove").hidden = !p.avatar;
    $("deleteProfile").hidden = state.profiles.length < 2;
  }

  function initialsAvatar(name) {
    const c = document.createElement("canvas");
    c.width = c.height = 96;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 96, 96);
    g.addColorStop(0, "#7c3aed");
    g.addColorStop(1, "#1d9bf0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 96, 96);
    ctx.fillStyle = "#fff";
    ctx.font = "700 38px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Card.initials(name), 48, 50);
    return c.toDataURL();
  }

  function setStatus(msg, isError) {
    const el = $("status");
    el.textContent = msg || "";
    el.classList.toggle("error", !!isError);
  }

  // ---------------------------------------------------------------------------
  // Generating
  // ---------------------------------------------------------------------------
  function remember(items) {
    const profileId = state.activeProfileId;
    state.history = [...items.map((q) => ({ text: q.text, profileId })), ...state.history].slice(0, HISTORY_LIMIT);
  }

  function generateFromLibrary(count) {
    const langs = state.language === "all" ? [] : [state.language];
    const used = new Set(state.used);
    const { quotes, resetCycle } = pickQuotes({ count, categories: state.categories, langs, used });
    state.used = [...used];
    if (!quotes.length) {
      setStatus("No quotes in the library for that topic + language. Try another combination.", true);
      return null;
    }
    setStatus(
      resetCycle
        ? "You've seen every quote for these topics, so the cycle restarted. Try AI mode for brand-new ones."
        : count > 1
          ? `Generated ${quotes.length} posts.`
          : ""
    );
    return quotes.map((q) => ({ text: q.text, category: q.category, caption: makeCaption(q) }));
  }

  async function generateWithAI(count) {
    const profile = activeProfile();
    setStatus(`Claude is writing ${count > 1 ? count + " quotes" : "a quote"}…`);
    const avoid = state.history.filter((h) => h.profileId === profile.id).slice(0, 30).map((h) => h.text);
    const items = await window.QuoteAI.generateQuotes({
      apiKey: state.apiKey.trim(),
      count,
      profile,
      topic: state.aiTopic,
      categories: CATEGORIES,
      selected: state.categories,
      language: state.language === "all" ? "en" : state.language,
      avoid,
    });
    if (!items.length) throw new Error("Claude didn't return any quotes. Please try again.");
    setStatus(count > 1 ? `Claude wrote ${items.length} posts.` : "");
    return items.map((q) => ({
      ...q,
      caption: q.caption || makeCaption({ category: q.category }),
    }));
  }

  let busy = false;
  async function generate(count = state.count) {
    if (busy) return;
    busy = true;
    const btn = $("generate");
    btn.disabled = true;
    $("next").disabled = true;
    try {
      const items = state.source === "ai" ? await generateWithAI(count) : generateFromLibrary(count);
      if (!items) return;
      state.batch = items;
      state.batchIndex = 0;
      remember(items);
      save();
      renderEditor();
      renderBatch();
      await renderPreview();
    } catch (err) {
      setStatus(err.message || String(err), true);
    } finally {
      busy = false;
      btn.disabled = false;
      $("next").disabled = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------
  function fileName(profile, index) {
    const handle = (profile.handle || profile.name || "quote").replace(/[^a-z0-9_-]+/gi, "").toLowerCase() || "quote";
    const date = new Date().toISOString().slice(0, 10);
    return `${handle}-${date}-${index + 1}.png`;
  }

  function canvasBlob(c) {
    return new Promise((resolve) => c.toBlob(resolve, "image/png"));
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function renderItemBlob(item) {
    const c = document.createElement("canvas");
    await drawCard(c, item, activeProfile());
    return canvasBlob(c);
  }

  async function copy(text, what) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${what} copied.`);
    } catch (e) {
      setStatus(`Couldn't copy automatically. Select the ${what.toLowerCase()} and copy it by hand.`, true);
    }
  }

  // ---------------------------------------------------------------------------
  // Controls setup
  // ---------------------------------------------------------------------------
  function fillSelect(el, options, value) {
    el.textContent = "";
    for (const [v, label] of Object.entries(options)) {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = typeof label === "string" ? label : label.label;
      el.appendChild(o);
    }
    el.value = value;
  }

  function renderChips() {
    const wrap = $("categoryChips");
    wrap.textContent = "";
    for (const [id, label] of Object.entries(CATEGORIES)) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = label;
      chip.setAttribute("aria-pressed", String(state.categories.includes(id)));
      chip.addEventListener("click", () => {
        state.categories = state.categories.includes(id)
          ? state.categories.filter((c) => c !== id)
          : [...state.categories, id];
        chip.setAttribute("aria-pressed", String(state.categories.includes(id)));
        save();
      });
      wrap.appendChild(chip);
    }
  }

  function renderSource() {
    document.querySelectorAll('input[name="source"]').forEach((r) => (r.checked = r.value === state.source));
    $("aiSettings").hidden = state.source !== "ai";
    const langs =
      state.source === "ai"
        ? { en: "English", hinglish: "Hinglish", hindi: "Hindi (हिन्दी)" }
        : { en: "English", hinglish: "Hinglish", all: "Mix of both" };
    if (!(state.language in langs)) state.language = "en";
    fillSelect($("language"), langs, state.language);
  }

  function bindProfileField(id, key, rerenderTabs) {
    $(id).addEventListener("input", (e) => {
      activeProfile()[key] = e.target.value;
      save();
      if (rerenderTabs) renderProfilesTabsOnly();
      renderPreview();
    });
  }

  function renderProfilesTabsOnly() {
    // keep focus in the input while typing by only updating tab labels
    const tabs = $("profileTabs").querySelectorAll(".tab");
    state.profiles.forEach((p, i) => {
      if (tabs[i]) tabs[i].lastChild.textContent = p.name || "Untitled";
    });
  }

  async function readAvatar(file) {
    const dataUrl = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("That file doesn't look like an image."));
      i.src = dataUrl;
    });
    // shrink to 400×400 so it fits comfortably in localStorage
    const size = 400;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const s = Math.max(size / img.width, size / img.height);
    c.getContext("2d").drawImage(img, (size - img.width * s) / 2, (size - img.height * s) / 2, img.width * s, img.height * s);
    return c.toDataURL("image/jpeg", 0.9);
  }

  function init() {
    fillSelect($("pBadge"), Card.BADGES, activeProfile().badge);
    fillSelect($("theme"), Card.THEMES, state.style.theme);
    fillSelect($("size"), Card.SIZES, state.style.size);
    fillSelect($("font"), Card.FONTS, state.style.font);
    $("align").value = state.style.align;
    $("count").value = String(state.count);
    $("aiTopic").value = state.aiTopic;
    $("apiKey").value = state.apiKey;

    renderProfiles();
    renderChips();
    renderSource();
    renderEditor();
    renderBatch();
    renderPreview();

    // Profile editing
    bindProfileField("pName", "name", true);
    bindProfileField("pHandle", "handle");
    bindProfileField("pAudience", "audience");
    bindProfileField("pVoice", "voice");
    $("pBadge").addEventListener("change", (e) => {
      activeProfile().badge = e.target.value;
      save();
      renderPreview();
    });
    $("pName").addEventListener("change", renderProfiles);
    $("pAvatar").addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        activeProfile().avatar = await readAvatar(file);
        save();
        renderProfiles();
        renderPreview();
      } catch (err) {
        setStatus(err.message, true);
      }
    });
    $("pAvatarRemove").addEventListener("click", () => {
      activeProfile().avatar = null;
      save();
      renderProfiles();
      renderPreview();
    });
    $("addProfile").addEventListener("click", () => {
      const p = { id: uid(), name: "New profile", handle: "@handle", badge: "blue", avatar: null, audience: "", voice: "" };
      state.profiles.push(p);
      state.activeProfileId = p.id;
      save();
      renderProfiles();
      renderPreview();
      $("profileEditor").open = true;
      $("pName").focus();
      $("pName").select();
    });
    $("deleteProfile").addEventListener("click", () => {
      const p = activeProfile();
      if (state.profiles.length < 2) return;
      if (!confirm(`Delete the profile "${p.name}"?`)) return;
      state.profiles = state.profiles.filter((x) => x.id !== p.id);
      state.activeProfileId = state.profiles[0].id;
      save();
      renderProfiles();
      renderPreview();
    });

    // Generate options
    document.querySelectorAll('input[name="source"]').forEach((r) =>
      r.addEventListener("change", () => {
        state.source = r.value;
        save();
        renderSource();
        setStatus("");
      })
    );
    $("language").addEventListener("change", (e) => {
      state.language = e.target.value;
      save();
    });
    $("count").addEventListener("change", (e) => {
      state.count = Number(e.target.value) || 1;
      save();
    });
    $("aiTopic").addEventListener("input", (e) => {
      state.aiTopic = e.target.value;
      save();
    });
    $("apiKey").addEventListener("input", (e) => {
      state.apiKey = e.target.value.trim();
      save();
    });
    $("generate").addEventListener("click", () => generate());
    $("next").addEventListener("click", () => {
      if (state.batchIndex < state.batch.length - 1) {
        state.batchIndex++;
        save();
        renderEditor();
        renderBatch();
        renderPreview();
      } else {
        generate();
      }
    });

    // Card style
    for (const key of ["theme", "size", "font", "align"]) {
      $(key).addEventListener("change", (e) => {
        state.style[key] = e.target.value;
        save();
        renderPreview();
      });
    }

    // Editing the text / caption
    $("quoteText").addEventListener("input", (e) => {
      if (!currentItem()) {
        state.batch = [{ text: "", category: "mindset", caption: "" }];
        state.batchIndex = 0;
      }
      currentItem().text = e.target.value;
      save();
      renderBatch();
      renderPreview();
    });
    $("caption").addEventListener("input", (e) => {
      if (currentItem()) currentItem().caption = e.target.value;
      save();
    });

    // Export
    $("download").addEventListener("click", async () => {
      if (!currentItem()) return setStatus("Generate a quote first.", true);
      downloadBlob(await renderItemBlob(currentItem()), fileName(activeProfile(), state.batchIndex));
    });
    $("downloadAll").addEventListener("click", async () => {
      for (let i = 0; i < state.batch.length; i++) {
        downloadBlob(await renderItemBlob(state.batch[i]), fileName(activeProfile(), i));
        await new Promise((r) => setTimeout(r, 350)); // browsers block rapid-fire downloads
      }
      setStatus(`Downloaded ${state.batch.length} images. If some are missing, allow multiple downloads for this site.`);
    });
    $("copyCaption").addEventListener("click", () => copy($("caption").value, "Caption"));
    $("copyText").addEventListener("click", () => copy($("quoteText").value, "Quote text"));

    // Phone share sheet (post straight to Instagram etc.)
    const probe = typeof File === "function" ? new File([""], "x.png", { type: "image/png" }) : null;
    if (probe && navigator.canShare && navigator.canShare({ files: [probe] })) {
      $("share").hidden = false;
      $("share").addEventListener("click", async () => {
        if (!currentItem()) return setStatus("Generate a quote first.", true);
        const blob = await renderItemBlob(currentItem());
        const file = new File([blob], fileName(activeProfile(), state.batchIndex), { type: "image/png" });
        try {
          await navigator.share({ files: [file], text: $("caption").value });
        } catch (e) {
          /* user closed the share sheet */
        }
      });
    }

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderPreview);
  }

  init();
})();
