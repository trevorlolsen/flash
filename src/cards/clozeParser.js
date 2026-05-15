// Parses Anki-style cloze deletion syntax: {{cN::content[::hint]}}.
//
// Returns:
//   {
//     groups: Map<key, { content, hint? }>,
//     segments: Array<{ type: "text"|"cloze", value, group? }>
//   }
// where key is "c1", "c2", etc. If the same group key appears more than once,
// the first occurrence wins for the `groups` map; every occurrence still
// appears in `segments` so the rendered text contains every instance.

function parseCloze(text) {
  const groups = new Map();
  const segments = [];

  if (!text) return { groups, segments };

  let i = 0;
  let textBuf = "";

  while (i < text.length) {
    if (text[i] === "{" && text[i + 1] === "{") {
      const closeIdx = _findClosingBraces(text, i + 2);
      if (closeIdx === -1) {
        textBuf += text[i];
        i++;
        continue;
      }

      const inner = text.slice(i + 2, closeIdx);
      const match = inner.match(/^(c\d+)::([\s\S]*)$/);
      if (!match) {
        textBuf += text.slice(i, closeIdx + 2);
        i = closeIdx + 2;
        continue;
      }

      const key = match[1];
      const rest = match[2];
      let content = rest;
      let hint;
      const hintSplit = rest.indexOf("::");
      if (hintSplit !== -1) {
        content = rest.slice(0, hintSplit);
        hint = rest.slice(hintSplit + 2);
      }

      if (textBuf) {
        segments.push({ type: "text", value: textBuf });
        textBuf = "";
      }
      segments.push({ type: "cloze", value: content, group: key, hint });
      if (!groups.has(key)) {
        groups.set(key, hint !== undefined ? { content, hint } : { content });
      }
      i = closeIdx + 2;
    } else {
      textBuf += text[i];
      i++;
    }
  }

  if (textBuf) segments.push({ type: "text", value: textBuf });

  return { groups, segments };
}

function _findClosingBraces(text, from) {
  let depth = 1;
  let j = from;
  while (j < text.length - 1) {
    if (text[j] === "{" && text[j + 1] === "{") {
      depth++;
      j += 2;
      continue;
    }
    if (text[j] === "}" && text[j + 1] === "}") {
      depth--;
      if (depth === 0) return j;
      j += 2;
      continue;
    }
    j++;
  }
  return -1;
}

function clozeGroupKeys(text) {
  const { groups } = parseCloze(text);
  return Array.from(groups.keys()).sort((a, b) => {
    return parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10);
  });
}
