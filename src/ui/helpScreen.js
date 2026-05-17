// Help screen. Renders the topic list (left, sticky on desktop / drawer on
// mobile) and the topic content (right / below). Pass { anchor: "topic-id" }
// to scroll a specific topic into view on open.

function renderHelpScreen(db, opts) {
  const anchor = opts && opts.anchor;
  const screen = document.getElementById("screen-help");
  screen.innerHTML = "";

  const layout = el("div", { className: "help-layout" });

  // ── Topic list (left on desktop, slide-in drawer on mobile) ──
  const overlay = el("div", { className: "help-toc-overlay" });
  const toc = el("nav", { className: "help-toc", "aria-label": "Help topics" });

  // Drawer header (visible only on mobile via CSS).
  const drawerHeader = el("div", { className: "help-toc-drawer-header" },
    el("span", { className: "help-toc-drawer-title" }, "Topics"),
    el("button", {
      className: "btn btn--ghost help-toc-close",
      "aria-label": "Close topics",
      onClick: () => _closeTocDrawer(overlay)
    }, "×")
  );
  toc.appendChild(drawerHeader);

  for (const group of HELP_GROUPS) {
    const topicsInGroup = HELP_TOPICS.filter(t => t.group === group.id);
    if (!topicsInGroup.length) continue;
    toc.appendChild(el("div", { className: "help-toc-group" }, group.title));
    const ul = el("ul", { className: "help-toc-list" });
    for (const topic of topicsInGroup) {
      const a = el("a", {
        className: "help-toc-link",
        href: `#topic-${topic.id}`,
        onClick: (e) => {
          e.preventDefault();
          const target = document.getElementById(`topic-${topic.id}`);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            _highlightActiveTocLink(toc, topic.id);
          }
          _closeTocDrawer(overlay);
        }
      }, topic.title);
      a.dataset.topicId = topic.id;
      ul.appendChild(el("li", {}, a));
    }
    toc.appendChild(ul);
  }
  overlay.appendChild(toc);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) _closeTocDrawer(overlay);
  });
  layout.appendChild(overlay);

  // ── Screen header (Back + Topics trigger for mobile) ──
  const header = el("div", { className: "screen-header" },
    el("button", {
      className: "btn btn--ghost",
      onClick: () => { setScreen("library"); renderLibraryScreen(db); }
    }, "← Back"),
    el("h1", {}, "Help"),
    el("button", {
      className: "btn btn--ghost help-toc-trigger",
      "aria-label": "Open topics",
      onClick: () => _openTocDrawer(overlay)
    }, "Topics ▾")
  );
  screen.appendChild(header);

  // ── Content (right on desktop, below on mobile) ──
  const content = el("div", { className: "help-content" });
  for (const topic of HELP_TOPICS) {
    const section = el("section", {
      className: "help-topic",
      id: `topic-${topic.id}`
    });
    const rendered = renderMarkdown(topic.markdown);
    _wrapTablesForScroll(rendered);
    section.appendChild(rendered);
    content.appendChild(section);
  }
  layout.appendChild(content);

  screen.appendChild(layout);

  // Anchor scroll + active-link tracking after the DOM is in place.
  if (anchor) {
    const target = document.getElementById(`topic-${anchor}`);
    if (target) {
      // requestAnimationFrame so layout has settled (markdown + KaTeX done).
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      _highlightActiveTocLink(toc, anchor);
    }
  } else {
    _highlightActiveTocLink(toc, HELP_TOPICS[0].id);
  }
}

function _highlightActiveTocLink(toc, topicId) {
  toc.querySelectorAll(".help-toc-link").forEach(a => {
    a.classList.toggle("help-toc-link--active", a.dataset.topicId === topicId);
  });
}

function _openTocDrawer(overlay) {
  overlay.classList.add("is-open");
}

function _closeTocDrawer(overlay) {
  overlay.classList.remove("is-open");
}

// Wrap every <table> in the rendered fragment with a horizontally-scrollable
// container so wide tables (e.g. keyboard shortcuts) don't break mobile layout.
function _wrapTablesForScroll(root) {
  const tables = root.querySelectorAll ? root.querySelectorAll("table") : [];
  tables.forEach(table => {
    if (table.parentNode && table.parentNode.classList && table.parentNode.classList.contains("help-table-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "help-table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
}
