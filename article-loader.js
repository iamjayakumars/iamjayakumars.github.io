/* ============================================================
   ARTICLE LOADER — Auto-builds the styled article page
   ============================================================
   This script does TWO things:
   1. Converts plain text (from <script id="article-raw">)
      into formatted HTML using simple markers.
   2. Builds the full page layout around it (nav, header,
      author bio, footer).

   TEXT FORMAT RULES (what you type → what it becomes):
     ## Heading           →  Section heading
     ### Sub-heading      →  Smaller heading
     >>> Quote text       →  Highlighted pull-quote
     > Quote text         →  Blockquote
     - Item               →  Bullet list
     * Item               →  Bullet list
     1. Item              →  Numbered list
     ---                  →  Horizontal divider
     **bold**             →  Bold text
     *italic*             →  Italic text
     [SHALLOW] text       →  Comparison: shallow side
     [DEEP] text          →  Comparison: deep side
     Blank line           →  New paragraph

   You never need to edit this file.
   ============================================================ */

(function () {
  var A = window.ARTICLE;
  if (!A || !A.title) return;

  /* ── Helpers ──────────────────────────────────── */

  function formatDate(str) {
    var d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function setMeta(name, content, attr) {
    attr = attr || 'name';
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  /* ── Inline formatting ───────────────────────── */

  function inlineFmt(text) {
    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text*  (but not inside <strong> tags)
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Smart quotes: "text"
    text = text.replace(/"([^"]+)"/g, '\u201c$1\u201d');
    // Smart apostrophes
    text = text.replace(/(\w)'(\w)/g, '$1\u2019$2');
    // Em-dash: --
    text = text.replace(/ -- /g, ' \u2014 ');
    return text;
  }

  /* ── Plain-text → HTML parser ────────────────── */

  function parseText(raw) {
    var lines = raw.split('\n');
    var out = '';
    var para = [];
    var listType = ''; // 'ul', 'ol', or ''
    var inComparison = false;

    function flushPara() {
      if (para.length) {
        out += '<p>' + inlineFmt(para.join(' ')) + '</p>\n';
        para = [];
      }
    }

    function closeList() {
      if (listType) {
        out += '</' + listType + '>\n';
        listType = '';
      }
    }

    function closeComparison() {
      if (inComparison) {
        out += '</div>\n';
        inComparison = false;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // ── Empty line → flush
      if (trimmed === '') {
        flushPara();
        closeList();
        closeComparison();
        continue;
      }

      // ── Pull quote: >>> text
      if (trimmed.indexOf('>>> ') === 0) {
        flushPara(); closeList(); closeComparison();
        out += '<div class="pull-quote">' + inlineFmt(trimmed.slice(4)) + '</div>\n';
        continue;
      }

      // ── Heading: ### sub-heading (check ### before ##)
      if (trimmed.indexOf('### ') === 0) {
        flushPara(); closeList(); closeComparison();
        out += '<h3>' + inlineFmt(trimmed.slice(4)) + '</h3>\n';
        continue;
      }

      // ── Heading: ## heading
      if (trimmed.indexOf('## ') === 0) {
        flushPara(); closeList(); closeComparison();
        out += '<h2>' + inlineFmt(trimmed.slice(3)) + '</h2>\n';
        continue;
      }

      // ── Horizontal rule: ---
      if (trimmed === '---') {
        flushPara(); closeList(); closeComparison();
        out += '<hr />\n';
        continue;
      }

      // ── Blockquote: > text
      if (trimmed.indexOf('> ') === 0) {
        flushPara(); closeList(); closeComparison();
        out += '<blockquote><p>' + inlineFmt(trimmed.slice(2)) + '</p></blockquote>\n';
        continue;
      }

      // ── Comparison: [SHALLOW] or [DEEP]
      if (/^\[SHALLOW\]/i.test(trimmed)) {
        flushPara(); closeList();
        if (!inComparison) {
          out += '<div class="comparison-block">\n';
          inComparison = true;
        }
        out += '<div class="comparison-item shallow"><h4>\u26A0 Shallow</h4><p>'
          + inlineFmt(trimmed.replace(/^\[SHALLOW\]\s*/i, '')) + '</p></div>\n';
        continue;
      }
      if (/^\[DEEP\]/i.test(trimmed)) {
        flushPara(); closeList();
        if (!inComparison) {
          out += '<div class="comparison-block">\n';
          inComparison = true;
        }
        out += '<div class="comparison-item deep"><h4>\u2713 Deep</h4><p>'
          + inlineFmt(trimmed.replace(/^\[DEEP\]\s*/i, '')) + '</p></div>\n';
        continue;
      }

      // ── Unordered list: - text or * text (at start)
      if (/^[-*] /.test(trimmed)) {
        flushPara(); closeComparison();
        if (listType !== 'ul') {
          closeList();
          out += '<ul>\n';
          listType = 'ul';
        }
        out += '<li>' + inlineFmt(trimmed.slice(2)) + '</li>\n';
        continue;
      }

      // ── Ordered list: 1. text
      if (/^\d+\.\s/.test(trimmed)) {
        flushPara(); closeComparison();
        if (listType !== 'ol') {
          closeList();
          out += '<ol>\n';
          listType = 'ol';
        }
        out += '<li>' + inlineFmt(trimmed.replace(/^\d+\.\s*/, '')) + '</li>\n';
        continue;
      }

      // ── Regular text → accumulate into paragraph
      para.push(trimmed);
    }

    flushPara();
    closeList();
    closeComparison();
    return out;
  }

  /* ── Grab raw text and parse ─────────────────── */

  var rawEl = document.getElementById('article-raw');
  var rawText = rawEl ? rawEl.textContent : '';
  var articleHTML = parseText(rawText);

  // Reading time
  var wordCount = rawText.split(/\s+/).length;
  var minutes = Math.max(1, Math.round(wordCount / 200));

  /* ── Build tags HTML ─────────────────────────── */

  var tagsHTML = '';
  if (A.tags && A.tags.length) {
    tagsHTML = '<div class="article-tags">';
    A.tags.forEach(function (tag, i) {
      var cls = i === 0 ? 'tag tag-accent' : i === 1 ? 'tag tag-gold' : 'tag';
      tagsHTML += '<span class="' + cls + '">' + tag + '</span>';
    });
    tagsHTML += '</div>';
  }

  /* ── Set page title & meta ───────────────────── */

  document.title = A.title + ' \u2014 Jayakumar Sadhasivam';
  setMeta('description', A.excerpt || '');
  setMeta('og:title', A.title, 'property');
  setMeta('og:description', A.excerpt || '', 'property');
  setMeta('og:type', 'article', 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', A.title);
  setMeta('twitter:description', A.excerpt || '');

  /* ── Build full page layout ──────────────────── */

  document.body.innerHTML = ''
    /* Navigation */
    + '<nav class="article-nav">'
    +   '<div class="container">'
    +     '<a href="../index.html#articles" class="article-nav-back">'
    +       '<svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>'
    +       'Back to Portfolio'
    +     '</a>'
    +     '<a href="../index.html" class="article-nav-logo">'
    +       '<img src="../logo/transparent.png" alt="JS" style="height:24px;width:auto;" />'
    +       'Jayakumar<span>.</span>'
    +     '</a>'
    +   '</div>'
    + '</nav>'

    /* Header */
    + '<header class="article-header">'
    +   '<div class="container">'
    +     '<div class="article-meta">'
    +       '<span class="article-date">' + formatDate(A.date) + '</span>'
    +       '<span class="article-reading-time">' + minutes + ' min read</span>'
    +     '</div>'
    +     '<h1>' + A.title + '</h1>'
    +     (A.excerpt ? '<p class="article-subtitle">' + A.excerpt + '</p>' : '')
    +     tagsHTML
    +   '</div>'
    + '</header>'

    /* Article Body */
    + '<main class="article-body">'
    +   '<div class="container">'
    +     '<div class="article-content">'
    +       articleHTML
    +     '</div>'
    +   '</div>'
    + '</main>'

    /* Author Footer */
    + '<footer class="article-footer">'
    +   '<div class="container">'
    +     '<div class="article-author">'
    +       '<img src="../Profile-Photo.jpeg" alt="Jayakumar Sadhasivam" class="article-author-photo" />'
    +       '<div class="article-author-info">'
    +         '<h4>Jayakumar Sadhasivam</h4>'
    +         '<p>Associate Professor at VIT &amp; Assistant Director, Career Development Center. Writing about education, career readiness, cybersecurity, and the open web.</p>'
    +         '<div class="article-author-links">'
    +           '<a href="https://www.linkedin.com/in/iamjayakumars/" target="_blank" rel="noopener">LinkedIn</a>'
    +           '<a href="../index.html#articles">More Articles</a>'
    +           '<a href="../index.html#contact">Contact</a>'
    +         '</div>'
    +       '</div>'
    +     '</div>'
    +     '<div class="article-share">'
    +       '<p>Found this useful? Share it with someone who needs to hear it.</p>'
    +       '<a href="https://www.linkedin.com/in/iamjayakumars/" target="_blank" rel="noopener" class="btn btn-outline" style="margin-top:0.5rem;">Read on LinkedIn</a>'
    +     '</div>'
    +   '</div>'
    + '</footer>'

    /* Page Footer */
    + '<div class="article-page-footer">'
    +   '<div class="container">'
    +     '<p>&copy; 2026 Jayakumar Sadhasivam &middot; Built with <span class="heart">&hearts;</span> for the open web</p>'
    +   '</div>'
    + '</div>';

  /* ── Smooth fade-in ──────────────────────────── */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(function () {
    document.body.style.opacity = '1';
  });
})();
