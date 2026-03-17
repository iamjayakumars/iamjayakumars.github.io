/* ============================================================
   JAYAKUMAR SADHASIVAM — Portfolio Scripts
   Scroll animations, navigation, counters, typing effect
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     CONFIG — all magic numbers in one place
     ---------------------------------------------------------- */
  const CFG = {
    NAV_SCROLL_THRESHOLD:  50,
    BACK_TO_TOP_THRESHOLD: 600,
    REVEAL_ROOT_MARGIN:    '0px 0px -40px 0px',
    REVEAL_THRESHOLD:      0.1,
    COUNTER_DURATION:      2000,
    TILT_STRENGTH:         3,
    TYPE_CHAR_SPEED:       55,
    TYPE_DELETE_SPEED:     25,
    TYPE_PAUSE_END:        2000,
    TYPE_PAUSE_NEXT:       400,
    TICKER_SECS_PER_CARD:  5,
    TICKER_RESUME_DELAY:   3000,
    PRELOADER_MAX_MS:      8000,   // failsafe: show page after 8s regardless
  };

  /* ----------------------------------------------------------
     1. PRELOADER — fade in with safety timeout
     ---------------------------------------------------------- */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  const showBody = () => { document.body.style.opacity = '1'; };
  window.addEventListener('load', showBody, { once: true });
  // Failsafe: never leave page invisible
  setTimeout(showBody, CFG.PRELOADER_MAX_MS);

  /* ----------------------------------------------------------
     2. SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }

  /* ----------------------------------------------------------
     3. NAVIGATION — Scroll State & Active Links
     ---------------------------------------------------------- */
  const nav      = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    if (!nav) return;
    const scrollY = window.scrollY;

    nav.classList.toggle('scrolled', scrollY > CFG.NAV_SCROLL_THRESHOLD);

    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop    = section.offsetTop - 120;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === currentSection) link.classList.add('active');
      if (href === 'portfolio-start' && currentSection && currentSection.startsWith('port-')) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------------------------
     4. MOBILE NAVIGATION
     ---------------------------------------------------------- */
  const navToggle  = document.getElementById('navToggle');
  const navMobile  = document.getElementById('navMobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMobile.classList.toggle('open');
      document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMobile.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     5. BACK TO TOP BUTTON
     ---------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > CFG.BACK_TO_TOP_THRESHOLD);
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     6. SCROLL EVENT (passive, RAF-throttled)
     ---------------------------------------------------------- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollProgress();
        updateNav();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial calls
  updateScrollProgress();
  updateNav();
  updateBackToTop();

  /* ----------------------------------------------------------
     7. SCROLL REVEAL (Intersection Observer)
     ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold:  CFG.REVEAL_THRESHOLD,
      rootMargin: CFG.REVEAL_ROOT_MARGIN,
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------
     8. COUNTER ANIMATION
     ---------------------------------------------------------- */
  const counters     = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          counterObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsContainer = document.querySelector('.hero-stats');
  if (statsContainer) counterObserver.observe(statsContainer);

  function animateCounters() {
    counters.forEach((counter) => {
      const target    = parseInt(counter.getAttribute('data-target'), 10);
      const startTime = performance.now();

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function update(currentTime) {
        const elapsed      = currentTime - startTime;
        const progress     = Math.min(elapsed / CFG.COUNTER_DURATION, 1);
        const easedProgress = easeOutExpo(progress);
        const current      = Math.floor(easedProgress * target);
        counter.textContent = formatNumber(current);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = formatNumber(target);
        }
      }
      requestAnimationFrame(update);
    });
  }

  function formatNumber(num) {
    return num >= 1000 ? num.toLocaleString() : String(num);
  }

  /* ----------------------------------------------------------
     9. TYPING EFFECT  (uses textContent — no XSS risk)
     ---------------------------------------------------------- */
  const typedElement = document.getElementById('typedText');
  const titles = [
    'Associate Professor — VIT SCOPE',
    'Assistant Director — Career Development Center',
    'Mozilla Open Source Contributor',
    'Cybersecurity & Malware Researcher',
    'Career Clarity Analyst',
  ];

  if (typedElement) {
    let titleIndex = 0;
    let charIndex  = 0;
    let isDeleting = false;
    let typeSpeed  = CFG.TYPE_CHAR_SPEED;

    // Build cursor element once, reuse it
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typed-cursor';
    cursorSpan.textContent = '|';
    typedElement.appendChild(cursorSpan);

    function typeEffect() {
      const currentTitle = titles[titleIndex];

      if (isDeleting) {
        charIndex--;
        typeSpeed = CFG.TYPE_DELETE_SPEED;
      } else {
        charIndex++;
        typeSpeed = CFG.TYPE_CHAR_SPEED;
      }

      // Set text safely using textContent
      typedElement.textContent = currentTitle.substring(0, charIndex);
      typedElement.appendChild(cursorSpan);

      if (!isDeleting && charIndex === currentTitle.length) {
        typeSpeed = CFG.TYPE_PAUSE_END;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting  = false;
        titleIndex  = (titleIndex + 1) % titles.length;
        typeSpeed   = CFG.TYPE_PAUSE_NEXT;
      }

      setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();
  }

  /* ----------------------------------------------------------
     10. PORTFOLIO NAV — Smooth Scroll & Active State
     ---------------------------------------------------------- */
  const portfolioNavBtns    = document.querySelectorAll('.portfolio-nav-btn');
  const portfolioSections   = document.querySelectorAll('.portfolio-section');

  portfolioNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId      = btn.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      portfolioNavBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const portfolioNavObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          portfolioNavBtns.forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-target') === id);
          });
        }
      });
    },
    { threshold: 0.15, rootMargin: '-80px 0px -50% 0px' }
  );

  portfolioSections.forEach((s) => portfolioNavObserver.observe(s));

  /* ----------------------------------------------------------
     11. SMOOTH SCROLL for all anchor links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href   = this.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     12. CARD TILT EFFECT (desktop only, RAF-throttled)
     ---------------------------------------------------------- */
  if (window.matchMedia('(hover: hover)').matches) {
    let tiltRaf = null;

    function applyTilt(card, e) {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -CFG.TILT_STRENGTH;
      const rotateY = ((x - centerX) / centerX) *  CFG.TILT_STRENGTH;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    }

    function addTiltTo(cards) {
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          if (tiltRaf) cancelAnimationFrame(tiltRaf);
          tiltRaf = requestAnimationFrame(() => applyTilt(card, e));
        });
        card.addEventListener('mouseleave', () => {
          if (tiltRaf) cancelAnimationFrame(tiltRaf);
          card.style.transform = '';
        });
      });
    }

    addTiltTo(document.querySelectorAll(
      '.info-card, .mozilla-card, .contribution-card, .nocode-card, .expertise-item'
    ));
  }

  /* ----------------------------------------------------------
     13. ARTICLES — Load from articles-data.js (XSS-safe DOM API)
     ---------------------------------------------------------- */
  const articlesGrid       = document.getElementById('articlesGrid');
  const articlesEmpty      = document.getElementById('articlesEmpty');
  const linkedinProfileLink = document.getElementById('linkedinProfileLink');

  function formatArticleDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // XSS-safe: use DOM APIs, never innerHTML for dynamic data
  function createArticleCard(article, index) {
    const card = document.createElement('a');

    // Validate file path — allow only safe filenames (alphanumeric, hyphens, dots)
    const safeFile = /^[\w\-.]+\.html$/.test(article.file) ? article.file : '#';
    card.href       = 'articles/' + safeFile;
    card.className  = `article-card reveal reveal-delay-${Math.min(index + 1, 5)}`;

    // Build body div
    const body = document.createElement('div');
    body.className = 'article-card-body';

    const dateEl = document.createElement('div');
    dateEl.className   = 'article-card-date';
    dateEl.textContent = formatArticleDate(article.date);

    const titleEl = document.createElement('h3');
    titleEl.textContent = article.title;

    const excerptEl = document.createElement('p');
    excerptEl.className   = 'article-card-excerpt';
    excerptEl.textContent = article.excerpt || '';

    body.appendChild(dateEl);
    body.appendChild(titleEl);
    body.appendChild(excerptEl);

    // Tags
    if (article.tags && article.tags.length) {
      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'article-card-tags';
      article.tags.forEach((t) => {
        const span = document.createElement('span');
        span.className   = 'tag tag-accent';
        span.textContent = t;
        tagsDiv.appendChild(span);
      });
      body.appendChild(tagsDiv);
    }

    const linkEl = document.createElement('span');
    linkEl.className   = 'article-card-link';
    linkEl.textContent = 'Read Full Article →';
    body.appendChild(linkEl);

    card.appendChild(body);
    return card;
  }

  function loadArticles() {
    const data = window.ARTICLES_DATA;

    if (!data) {
      if (articlesEmpty) {
        articlesEmpty.style.display = 'block';
        articlesEmpty.querySelector('p').textContent = 'Articles coming soon.';
      }
      return;
    }

    // Validate & set LinkedIn URL (reject non-http protocols)
    if (data.linkedin_profile && linkedinProfileLink) {
      try {
        const url = new URL(data.linkedin_profile);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          linkedinProfileLink.href = data.linkedin_profile;
        }
      } catch (_) {
        // Invalid URL — leave href as '#'
      }
    }

    if (!Array.isArray(data.articles) || data.articles.length === 0) {
      if (articlesEmpty) {
        articlesEmpty.style.display = 'block';
        articlesEmpty.querySelector('p').textContent = 'No articles yet — check back soon.';
      }
      return;
    }

    const sorted = [...data.articles].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach((article, index) => {
      const card = createArticleCard(article, index);
      articlesGrid.appendChild(card);
    });

    // Observe newly added reveal elements
    articlesGrid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // Tilt for article cards (desktop)
    if (window.matchMedia('(hover: hover)').matches) {
      let articleTiltRaf = null;
      articlesGrid.querySelectorAll('.article-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          if (articleTiltRaf) cancelAnimationFrame(articleTiltRaf);
          articleTiltRaf = requestAnimationFrame(() => {
            const rect    = card.getBoundingClientRect();
            const x       = e.clientX - rect.left;
            const y       = e.clientY - rect.top;
            const centerX = rect.width  / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -CFG.TILT_STRENGTH;
            const rotateY = ((x - centerX) / centerX) *  CFG.TILT_STRENGTH;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
          });
        });
        card.addEventListener('mouseleave', () => {
          if (articleTiltRaf) cancelAnimationFrame(articleTiltRaf);
          card.style.transform = '';
        });
      });
    }
  }

  loadArticles();

  /* ----------------------------------------------------------
     14. STUDENT TESTIMONIALS — Randomised vertical ticker
     ---------------------------------------------------------- */
  const testimonials = [
    { quote: "A great faculty with sound knowledge and practical exposure in Information Security Management.", course: "BCSE354E", name: "Information Security Management", sem: "WS 2023–24" },
    { quote: "The faculty is very thorough with the topics and explains each part clearly.", course: "BCSE354E", name: "Information Security Management", sem: "WS 2023–24" },
    { quote: "Every theory and practical class was very productive and well delivered.", course: "BCSE354E", name: "Information Security Management", sem: "WS 2023–24" },
    { quote: "I just wanted to sincerely thank you for being such an incredible mentor to me. Even though I never had the chance to be your student in a classroom, the guidance and support you've given me means so much. You've always been someone I could approach without hesitation and you've helped me navigate many important decisions with confidence. Thank you, sir. Your impact will always remain with me.", course: "Proctor", name: "Student", sem: "" },
    { quote: "The faculty was knowledgeable about the subject and made the content easy to understand.", course: "BCSE354E", name: "Information Security Management", sem: "WS 2023–24" },
    { quote: "Classes were very informative and helped in building strong fundamentals.", course: "BCSE354E", name: "Information Security Management", sem: "WS 2023–24" },
    { quote: "Explains the classes clearly and covers everything from the start to make the whole semester easy.", course: "BCSE203E", name: "Web Programming", sem: "WS 2023–24" },
    { quote: "Teaching was good, clear, and simplified, which helped a lot in understanding web technologies.", course: "BCSE203E", name: "Web Programming", sem: "WS 2023–24" },
    { quote: "Faculty explains topics very well with practical demonstrations that help students understand better.", course: "BCSE203E", name: "Web Programming", sem: "WS 2023–24" },
    { quote: "Good teaching experience overall; everything was fine throughout the course.", course: "BCSE203E", name: "Web Programming", sem: "WS 2023–24" },
    { quote: "Sir is very passionate about teaching and wants each one of us to understand everything he teaches.", course: "BCSE203E", name: "Web Programming", sem: "WS 2024–25" },
    { quote: "I am not buttering, but Jayakumar Sadhasivam is the best faculty I have ever seen. Very supporting and knowledgeable.", course: "BCSE203E", name: "Web Programming", sem: "WS 2024–25" },
    { quote: "Sir is flexible, considers student requests, and conducts classwork in an organised manner.", course: "BCSE203E", name: "Web Programming", sem: "WS 2024–25" },
    { quote: "Your teaching was really amazing — to be frank, better than other faculties — as you teach topics in depth.", course: "BCSE203E", name: "Web Programming", sem: "WS 2024–25" },
    { quote: "The faculty explained concepts in a simple way with good real-time examples, making the course enjoyable.", course: "BCSE325L", name: "Introduction to Bitcoin", sem: "WS 2024–25" },
    { quote: "The course was extremely insightful and gave a very good introduction to blockchain and decentralisation.", course: "BCSE325L", name: "Introduction to Bitcoin", sem: "WS 2024–25" },
    { quote: "Well-structured and to the point; very helpful for understanding Bitcoin fundamentals.", course: "BCSE325L", name: "Introduction to Bitcoin", sem: "WS 2024–25" },
    { quote: "Very informative sessions that built foundational knowledge clearly.", course: "BCSE325L", name: "Introduction to Bitcoin", sem: "WS 2024–25" },
    { quote: "Great class experience; learned a lot about decentralised systems.", course: "BCSE325L", name: "Introduction to Bitcoin", sem: "WS 2024–25" },
    { quote: "Explains the classes clearly and uploads all required materials on time, making the entire semester smooth.", course: "CSE3002", name: "Internet & Web Programming", sem: "FS 2022–23" },
    { quote: "Your teaching was really amazing — to be frank, better than other faculties — as you teach topics in depth.", course: "CSE3002", name: "Internet & Web Programming", sem: "FS 2022–23" },
    { quote: "Very supportive and knowledgeable faculty; enjoyed the learning experience.", course: "CSE3002", name: "Internet & Web Programming", sem: "FS 2022–23" },
    { quote: "Everything in this course was fine; well taught and presented.", course: "CSE3002", name: "Internet & Web Programming", sem: "FS 2022–23" },
    { quote: "Thank you for one of the best classes this semester. It was a very practical-oriented class which made it fun and interesting.", course: "BCSE355L", name: "AWS Solutions Architect", sem: "FS 2024–25" },
    { quote: "Your enthusiasm for the Apple environment and your organised habits are truly inspiring. The way you ask for detailed feedback to improve reflects a strong growth mindset.", course: "BCSE355L", name: "AWS Solutions Architect", sem: "FS 2024–25" },
    { quote: "Got placed due to these on-hand experiences — very helpful class sessions.", course: "BCSE355L", name: "AWS Solutions Architect", sem: "FS 2024–25" },
    { quote: "Overall very good experience; great support and guidance throughout the semester.", course: "BCSE355L", name: "AWS Solutions Architect", sem: "FS 2024–25" },
    { quote: "Really liked this subject; found the lab very interesting. Thank you.", course: "BCSE355L", name: "AWS Solutions Architect", sem: "FS 2024–25" },
    { quote: "One of the most interesting subjects in the curriculum; the faculty made the entire malware analysis journey engaging.", course: "BCSE321", name: "Malware Analysis", sem: "FS 2024–25" },
    { quote: "Dr. Jayakumar Sadhasivam has been one of the most supporting faculty — explains everything clearly and ensures we understand.", course: "BCSE321", name: "Malware Analysis", sem: "FS 2024–25" },
    { quote: "The classes and what we learnt were very valuable; helped in gaining practical skills.", course: "BCSE321", name: "Malware Analysis", sem: "FS 2024–25" },
    { quote: "Thank you for one of the best classes this semester. Very practical and interesting learning experience.", course: "BCSE321", name: "Malware Analysis", sem: "FS 2024–25" },
  ];

  const ticker = document.getElementById('testimonialTicker');
  if (ticker) {
    // Fisher-Yates shuffle
    for (let i = testimonials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [testimonials[i], testimonials[j]] = [testimonials[j], testimonials[i]];
    }

    // Build cards using DOM APIs (no innerHTML with dynamic data)
    function buildCard(t) {
      const card = document.createElement('div');
      card.className = 'testimonial-card';

      const quote = document.createElement('p');
      quote.className   = 'testimonial-quote';
      quote.textContent = t.quote;

      const meta = document.createElement('div');
      meta.className = 'testimonial-meta';

      const course = document.createElement('span');
      course.className   = 'testimonial-course';
      course.textContent = t.course + ' — ' + t.name;

      meta.appendChild(course);

      if (t.sem) {
        const sem = document.createElement('span');
        sem.className   = 'testimonial-semester';
        sem.textContent = t.sem;
        meta.appendChild(sem);
      }

      card.appendChild(quote);
      card.appendChild(meta);
      return card;
    }

    // Append all cards, then duplicate for seamless infinite scroll
    const fragment = document.createDocumentFragment();
    testimonials.forEach((t) => fragment.appendChild(buildCard(t)));
    ticker.appendChild(fragment);

    // Clone for loop
    const cloneFragment = document.createDocumentFragment();
    testimonials.forEach((t) => cloneFragment.appendChild(buildCard(t)));
    ticker.appendChild(cloneFragment);

    // Duration based on count
    const duration = testimonials.length * CFG.TICKER_SECS_PER_CARD;
    ticker.style.setProperty('--ticker-duration', duration + 's');

    // Arrow scroll controls
    const tickerUp   = document.getElementById('testimonialUp');
    const tickerDown = document.getElementById('testimonialDown');

    if (tickerUp && tickerDown) {
      let autoResumeTimer = null;

      function getCurrentY() {
        const t = window.getComputedStyle(ticker).transform;
        if (!t || t === 'none') return 0;
        // Extract translateY from matrix(a,b,c,d,e,f) or matrix3d
        const match = t.match(/matrix(?:3d)?\(([^)]+)\)/);
        if (!match) return 0;
        const values = match[1].split(',').map(Number);
        // matrix: values[5] is translateY; matrix3d: values[13]
        return values.length === 6 ? values[5] : values[13];
      }

      function scrollTicker(dir) {
        const currentY = getCurrentY();
        const cardEl   = ticker.querySelector('.testimonial-card');
        const step     = (cardEl ? cardEl.offsetHeight : 180) + 16;
        const half     = ticker.scrollHeight / 2;

        // Freeze at current animated position
        ticker.style.animation  = 'none';
        ticker.style.transition = 'none';
        ticker.style.transform  = `translateY(${currentY}px)`;
        ticker.offsetHeight; // force reflow

        let newY = currentY + (dir === 'up' ? step : -step);
        if (newY > 0)     newY = -(half - step);
        if (newY < -half) newY = -step;

        ticker.style.transition = 'transform 0.35s ease';
        ticker.style.transform  = `translateY(${newY}px)`;

        clearTimeout(autoResumeTimer);
        autoResumeTimer = setTimeout(() => {
          const progress = Math.abs(newY) / half;
          const delay    = -(progress * duration);
          ticker.style.transition = '';
          ticker.style.animation  = `tickerScroll ${duration}s ${delay}s linear infinite`;
        }, CFG.TICKER_RESUME_DELAY);
      }

      tickerUp.addEventListener('click',   () => scrollTicker('up'));
      tickerDown.addEventListener('click', () => scrollTicker('down'));
    }
  }

});
