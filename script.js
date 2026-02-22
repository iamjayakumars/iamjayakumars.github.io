/* ============================================================
   JAYAKUMAR SADHASIVAM — Portfolio Scripts
   Scroll animations, navigation, counters, typing effect
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ----------------------------------------------------------
     1. SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }

  /* ----------------------------------------------------------
     2. NAVIGATION — Scroll State & Active Links
     ---------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    const scrollY = window.scrollY;

    // Compact nav on scroll
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active link highlighting
    let currentSection = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href').substring(1);
      if (href === currentSection) {
        link.classList.add('active');
      }
      // Also highlight portfolio link when in any portfolio section
      if (href === 'portfolio-start' && currentSection && currentSection.startsWith('port-')) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------------------------
     3. MOBILE NAVIGATION
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

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

  /* ----------------------------------------------------------
     4. BACK TO TOP BUTTON
     ---------------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop() {
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     5. SCROLL EVENT (throttled)
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
  });

  // Initial call
  updateScrollProgress();
  updateNav();
  updateBackToTop();

  /* ----------------------------------------------------------
     6. SCROLL REVEAL (Intersection Observer)
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
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ----------------------------------------------------------
     7. COUNTER ANIMATION
     ---------------------------------------------------------- */
  const counters = document.querySelectorAll('.counter');
  let countersAnimated = false;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsContainer = document.querySelector('.hero-stats');
  if (statsContainer) {
    counterObserver.observe(statsContainer);
  }

  function animateCounters() {
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 2000;
      const startTime = performance.now();

      function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const current = Math.floor(easedProgress * target);

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
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  }

  /* ----------------------------------------------------------
     8. TYPING EFFECT
     ---------------------------------------------------------- */
  const typedElement = document.getElementById('typedText');
  const titles = [
    'Associate Professor — VIT SCOPE',
    'Assistant Director — Career Development Center',
    'Mozilla Open Source Contributor',
    'Cybersecurity & Malware Researcher',
    'Career Clarity Analyst',
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 50;

  function typeEffect() {
    const currentTitle = titles[titleIndex];

    if (isDeleting) {
      typedElement.innerHTML =
        currentTitle.substring(0, charIndex - 1) + '<span class="typed-cursor">|</span>';
      charIndex--;
      typeSpeed = 25;
    } else {
      typedElement.innerHTML =
        currentTitle.substring(0, charIndex + 1) + '<span class="typed-cursor">|</span>';
      charIndex++;
      typeSpeed = 55;
    }

    if (!isDeleting && charIndex === currentTitle.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typeSpeed = 400; // Pause before next title
    }

    setTimeout(typeEffect, typeSpeed);
  }

  typeEffect();

  /* ----------------------------------------------------------
     9. SKILL BAR ANIMATION
     ---------------------------------------------------------- */
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const width = fill.getAttribute('data-width');
          fill.style.width = width + '%';
          skillObserver.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillBars.forEach((bar) => skillObserver.observe(bar));

  /* ----------------------------------------------------------
     10. PORTFOLIO NAV — Smooth Scroll & Active State
     ---------------------------------------------------------- */
  const portfolioNavBtns = document.querySelectorAll('.portfolio-nav-btn');
  const portfolioSections = document.querySelectorAll('.portfolio-section');

  portfolioNavBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Update active state
      portfolioNavBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Update portfolio nav active state on scroll
  const portfolioNavObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          portfolioNavBtns.forEach((btn) => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-target') === id) {
              btn.classList.add('active');
            }
          });
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '-80px 0px -50% 0px',
    }
  );

  portfolioSections.forEach((section) => portfolioNavObserver.observe(section));

  /* ----------------------------------------------------------
     11. SMOOTH SCROLL for all anchor links
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ----------------------------------------------------------
     12. CARD TILT EFFECT (desktop only)
     ---------------------------------------------------------- */
  if (window.matchMedia('(hover: hover)').matches) {
    const tiltCards = document.querySelectorAll(
      '.info-card, .mozilla-card, .contribution-card, .nocode-card, .expertise-item'
    );

    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------
     13. LINKEDIN ARTICLES — Load from articles-data.js
     ---------------------------------------------------------- */
  const articlesGrid = document.getElementById('articlesGrid');
  const articlesEmpty = document.getElementById('articlesEmpty');
  const linkedinProfileLink = document.getElementById('linkedinProfileLink');

  function formatArticleDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function createArticleCard(article, index) {
    const card = document.createElement('a');
    // Link directly to the article HTML file
    card.href = 'articles/' + article.file;
    card.className = `article-card reveal reveal-delay-${Math.min(index + 1, 5)}`;

    const tagsHTML = article.tags && article.tags.length
      ? `<div class="article-card-tags">${article.tags.map((t) => `<span class="tag tag-accent">${t}</span>`).join('')}</div>`
      : '';

    card.innerHTML = `
      <div class="article-card-body">
        <div class="article-card-date">${formatArticleDate(article.date)}</div>
        <h3>${article.title}</h3>
        <p class="article-card-excerpt">${article.excerpt}</p>
        ${tagsHTML}
        <span class="article-card-link">Read Full Article &rarr;</span>
      </div>
    `;

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

    // Set LinkedIn profile link
    if (data.linkedin_profile && linkedinProfileLink) {
      linkedinProfileLink.href = data.linkedin_profile;
    }

    if (data.articles && data.articles.length > 0) {
      // Sort by date descending (newest first)
      const sorted = [...data.articles].sort((a, b) => new Date(b.date) - new Date(a.date));

      sorted.forEach((article, index) => {
        const card = createArticleCard(article, index);
        articlesGrid.appendChild(card);
      });

      // Re-observe new reveal elements
      articlesGrid.querySelectorAll('.reveal').forEach((el) => {
        revealObserver.observe(el);
      });

      // Also add tilt effect to new cards
      if (window.matchMedia('(hover: hover)').matches) {
        articlesGrid.querySelectorAll('.article-card').forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
          });
          card.addEventListener('mouseleave', () => {
            card.style.transform = '';
          });
        });
      }
    } else {
      if (articlesEmpty) {
        articlesEmpty.style.display = 'block';
        articlesEmpty.querySelector('p').textContent = 'No articles yet — check back soon.';
      }
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
    { quote: "I just wanted to sincerely thank you for being such an incredible mentor to me. Even though I never had the chance to be your student in a classroom, the guidance and support you’ve given me means so much. You’ve always been someone I could approach without hesitation and you’ve helped me navigate many important decisions with confidence. Thank you, sir. Your impact will always remain with me.", course: "Proctor", name: "Student"},
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

    function buildCard(t) {
      return `<div class="testimonial-card">
        <p class="testimonial-quote">${t.quote}</p>
        <div class="testimonial-meta">
          <span class="testimonial-course">${t.course} — ${t.name}</span>
          <span class="testimonial-semester">${t.sem}</span>
        </div>
      </div>`;
    }

    // Build cards — then duplicate for seamless infinite scroll
    const cardsHTML = testimonials.map(buildCard).join('');
    ticker.innerHTML = cardsHTML + cardsHTML;

    // Set animation duration based on card count (slower = more readable)
    const duration = testimonials.length * 5;
    ticker.style.setProperty('--ticker-duration', duration + 's');

    // Re-observe reveal elements
    ticker.closest('.testimonial-ticker-wrap')?.querySelectorAll('.reveal').forEach(el => {
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     15. PRELOADER — fade out body overlay
     ---------------------------------------------------------- */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });
});
