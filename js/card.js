/*
 * Draws a tweet-style quote card on a <canvas>:
 *   (avatar)  Name ✓
 *             @handle
 *   Quote text, auto-sized so short quotes are big and long quotes still fit.
 *
 * The layout maths (wrapLines / fitText) is pure so it can be tested in Node.
 */
(function (root, factory) {
  const card = factory();
  if (typeof module === "object" && module.exports) module.exports = card;
  else root.CardRenderer = card;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SIZES = {
    square: { label: "Square 1:1 (1080×1080)", w: 1080, h: 1080 },
    portrait: { label: "Portrait 4:5 (1080×1350)", w: 1080, h: 1350 },
    story: { label: "Story / Reel 9:16 (1080×1920)", w: 1080, h: 1920 },
  };

  const THEMES = {
    black: { label: "Black", bg: "#000000", text: "#ffffff", sub: "#71767b" },
    dim: { label: "Dark grey", bg: "#16181c", text: "#f7f9f9", sub: "#8b98a5" },
    light: { label: "White", bg: "#ffffff", text: "#0f1419", sub: "#536471" },
  };

  const BADGES = {
    blue: { label: "Blue tick", color: "#1d9bf0" },
    gold: { label: "Gold tick", color: "#e8b01a" },
    grey: { label: "Grey tick", color: "#829aab" },
    mono: { label: "Same as text", color: null },
    none: { label: "No tick", color: null },
  };

  const FONTS = {
    classic: { label: "Classic (Helvetica / Arial)", family: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    inter: { label: "Inter (modern)", family: 'Inter, "Helvetica Neue", Arial, sans-serif' },
    serif: { label: "Serif (Georgia)", family: 'Georgia, "Times New Roman", serif' },
  };

  const LINE_HEIGHT = 1.32;
  const PARAGRAPH_GAP = 0.7; // extra space between paragraphs, in font-size units

  /**
   * Word-wrap `text` into lines no wider than `maxWidth`.
   * `measure(str)` returns the pixel width of str in the current font.
   * Returns [{ text, paragraphStart }]; blank lines in the input start new paragraphs.
   */
  function wrapLines(text, maxWidth, measure) {
    const lines = [];
    const paragraphs = String(text)
      .replace(/\r\n?/g, "\n")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    paragraphs.forEach((para, pIndex) => {
      let startsParagraph = pIndex > 0;
      const push = (t) => {
        lines.push({ text: t, paragraphStart: startsParagraph });
        startsParagraph = false;
      };

      // single newlines inside a paragraph are respected as hard breaks
      para.split("\n").forEach((rawLine) => {
        const words = rawLine.trim().split(/\s+/).filter(Boolean);
        let current = "";

        for (let word of words) {
          // a single word wider than the line gets split by characters
          while (measure(word) > maxWidth && word.length > 1) {
            let cut = word.length - 1;
            while (cut > 1 && measure(word.slice(0, cut)) > maxWidth) cut--;
            if (current) {
              push(current);
              current = "";
            }
            push(word.slice(0, cut));
            word = word.slice(cut);
          }
          const candidate = current ? current + " " + word : word;
          if (current && measure(candidate) > maxWidth) {
            push(current);
            current = word;
          } else {
            current = candidate;
          }
        }
        if (current) push(current);
      });
    });

    return lines;
  }

  function blockHeight(lines, fontSize) {
    const gaps = lines.filter((l) => l.paragraphStart).length;
    return lines.length * fontSize * LINE_HEIGHT + gaps * fontSize * PARAGRAPH_GAP;
  }

  /**
   * Find the biggest font size (from maxSize down to floor) at which `text`
   * fits inside maxWidth × maxHeight. `measureAt(size)` returns a measure(str) fn.
   * Very long text that doesn't fit even at `floor` is returned at `floor`.
   */
  function fitText(text, { maxWidth, maxHeight, maxSize, floor = 16 }, measureAt) {
    const min = Math.ceil(floor);
    for (let size = Math.floor(maxSize); size > min; size--) {
      const lines = wrapLines(text, maxWidth, measureAt(size));
      const height = blockHeight(lines, size);
      if (height <= maxHeight) return { fontSize: size, lines, height };
    }
    const lines = wrapLines(text, maxWidth, measureAt(min));
    return { fontSize: min, lines, height: blockHeight(lines, min) };
  }

  function initials(name) {
    const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || "?").slice(0, 2);
    return letters.toUpperCase();
  }

  function drawAvatar(ctx, img, name, cx, cy, d) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (img && img.width) {
      // "object-fit: cover" crop
      const s = Math.max(d / img.width, d / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    } else {
      const g = ctx.createLinearGradient(cx - d / 2, cy - d / 2, cx + d / 2, cy + d / 2);
      g.addColorStop(0, "#7c3aed");
      g.addColorStop(1, "#1d9bf0");
      ctx.fillStyle = g;
      ctx.fillRect(cx - d / 2, cy - d / 2, d, d);
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${Math.round(d * 0.38)}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(initials(name), cx, cy + d * 0.02);
    }
    ctx.restore();
  }

  /** The scalloped "verified" badge with a check mark. */
  function drawBadge(ctx, cx, cy, r, color, checkColor) {
    ctx.save();
    ctx.beginPath();
    const steps = 120;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const rr = r * (1 + 0.09 * Math.cos(8 * t));
      const x = cx + rr * Math.cos(t);
      const y = cy + rr * Math.sin(t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 0.42 * r, cy + 0.02 * r);
    ctx.lineTo(cx - 0.12 * r, cy + 0.32 * r);
    ctx.lineTo(cx + 0.45 * r, cy - 0.3 * r);
    ctx.lineWidth = 0.2 * r;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = checkColor;
    ctx.stroke();
    ctx.restore();
  }

  function ellipsize(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
    return t + "…";
  }

  /**
   * Render a card.
   * opts: { text, profile: { name, handle, badge, avatarImg }, theme, size, font, align }
   */
  function draw(canvas, opts) {
    const size = SIZES[opts.size] || SIZES.square;
    const theme = THEMES[opts.theme] || THEMES.black;
    const family = (FONTS[opts.font] || FONTS.classic).family;
    const align = opts.align === "center" ? "center" : "left";
    const profile = opts.profile || {};
    const W = size.w;
    const H = size.h;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    const padX = W * 0.1;
    const avatarD = W * 0.125;
    const nameSize = Math.round(W * 0.04);
    const handleSize = Math.round(W * 0.037);
    const headerGap = W * 0.03; // avatar → name
    const bodyGap = W * 0.05; // header → quote
    const maxTextWidth = W - padX * 2;
    const maxTextHeight = H - H * 0.2 - avatarD - bodyGap;

    const fit = fitText(
      opts.text || "",
      {
        maxWidth: maxTextWidth,
        maxHeight: maxTextHeight,
        maxSize: W * 0.068,
        floor: W * 0.022,
      },
      (px) => {
        ctx.font = `400 ${px}px ${family}`;
        return (s) => ctx.measureText(s).width;
      }
    );

    const groupHeight = avatarD + bodyGap + fit.height;
    const top = Math.max(H * 0.06, (H - groupHeight) / 2);

    // Header -----------------------------------------------------------------
    const avatarCx = padX + avatarD / 2;
    const avatarCy = top + avatarD / 2;
    drawAvatar(ctx, profile.avatarImg, profile.name, avatarCx, avatarCy, avatarD);

    const nameX = padX + avatarD + headerGap;
    const badge = BADGES[profile.badge] || BADGES.blue;
    const hasBadge = profile.badge !== "none";
    const badgeR = nameSize * 0.52;
    const nameMaxWidth = W - padX - nameX - (hasBadge ? badgeR * 2.6 : 0);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.text;
    ctx.font = `700 ${nameSize}px ${family}`;
    const name = ellipsize(ctx, profile.name || "Your Name", nameMaxWidth);
    const nameY = avatarCy - nameSize * 0.6;
    ctx.fillText(name, nameX, nameY);

    if (hasBadge) {
      const nameW = ctx.measureText(name).width;
      const color = badge.color || theme.text;
      const check = badge.color ? "#ffffff" : theme.bg;
      drawBadge(ctx, nameX + nameW + nameSize * 0.25 + badgeR, nameY, badgeR, color, check);
    }

    ctx.fillStyle = theme.sub;
    ctx.font = `400 ${handleSize}px ${family}`;
    let handle = String(profile.handle || "").trim();
    if (handle && !handle.startsWith("@")) handle = "@" + handle;
    ctx.fillText(ellipsize(ctx, handle, W - padX - nameX), nameX, avatarCy + handleSize * 0.65);

    // Quote ------------------------------------------------------------------
    ctx.fillStyle = theme.text;
    ctx.font = `400 ${fit.fontSize}px ${family}`;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    const x = align === "center" ? W / 2 : padX;
    const lineH = fit.fontSize * LINE_HEIGHT;
    let y = top + avatarD + bodyGap;
    for (const line of fit.lines) {
      if (line.paragraphStart) y += fit.fontSize * PARAGRAPH_GAP;
      ctx.fillText(line.text, x, y + lineH / 2);
      y += lineH;
    }

    return canvas;
  }

  return { SIZES, THEMES, BADGES, FONTS, wrapLines, fitText, blockHeight, initials, draw };
});
