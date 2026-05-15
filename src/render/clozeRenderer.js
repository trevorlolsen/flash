// Renders a cloze card by substituting cloze segments in the source text, then
// handing the resulting markdown to renderMarkdown. The active group is shown
// as a blank placeholder on the front; on the back the active group's content
// is wrapped in <span class="cloze-active"> for emphasis.

function _clozePlaceholder(segment) {
  if (segment.hint !== undefined && segment.hint !== "") {
    return `[… ${segment.hint}]`;
  }
  return "[…]";
}

function _assembleClozeFront(card, activeGroup) {
  const text = card && card.clozeCard ? card.clozeCard.text || "" : "";
  const { segments } = parseCloze(text);
  let out = "";
  for (const seg of segments) {
    if (seg.type === "text") {
      out += seg.value;
    } else if (seg.type === "cloze") {
      out += seg.group === activeGroup ? _clozePlaceholder(seg) : seg.value;
    }
  }
  return out;
}

function _assembleClozeBack(card, activeGroup) {
  const text = card && card.clozeCard ? card.clozeCard.text || "" : "";
  const { segments } = parseCloze(text);
  let out = "";
  for (const seg of segments) {
    if (seg.type === "text") {
      out += seg.value;
    } else if (seg.type === "cloze") {
      if (seg.group === activeGroup) {
        out += `<span class="cloze-active">${seg.value}</span>`;
      } else {
        out += seg.value;
      }
    }
  }
  return out;
}

function renderClozeFront(card, activeGroup) {
  const wrap = document.createElement("div");
  wrap.className = "card-face cloze-face cloze-face--front";
  wrap.appendChild(renderMarkdown(_assembleClozeFront(card, activeGroup)));
  return wrap;
}

function renderClozeBack(card, activeGroup) {
  const wrap = document.createElement("div");
  wrap.className = "card-face cloze-face cloze-face--back";
  wrap.appendChild(renderMarkdown(_assembleClozeBack(card, activeGroup)));
  return wrap;
}
