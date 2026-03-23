/* ============================================================
   CHIPPERFIELD VILLAGE HALL — Premium JavaScript v2
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Scroll Progress Bar ---
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / docHeight) * 100;
      scrollProgress.style.width = scrolled + '%';
    }, { passive: true });
  }


  // --- Navbar scroll behavior ---
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');
  const isHomepage = !!hero;
  let lastScroll = 0;

  function updateNav() {
    if (!nav) return;

    if (isHomepage) {
      if (window.scrollY > 60) {
        nav.classList.remove('nav--transparent');
        nav.classList.add('nav--solid');
      } else {
        nav.classList.add('nav--transparent');
        nav.classList.remove('nav--solid');
      }
    } else {
      nav.classList.add('nav--solid');
      nav.classList.remove('nav--transparent');
    }
    lastScroll = window.scrollY;
  }

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });


  // --- Hero word reveal animation ---
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !isReduced) {
    const html = heroTitle.innerHTML;
    // Wrap each word in a span, preserving HTML tags like <em>
    const wrapped = html.replace(/(<[^>]+>)|(\S+)/g, (match, tag, word) => {
      if (tag) return tag;
      return `<span class="word">${word}</span>`;
    });
    heroTitle.innerHTML = wrapped;

    // Stagger animation delays
    const words = heroTitle.querySelectorAll('.word');
    words.forEach((word, i) => {
      word.style.animationDelay = (0.1 + i * 0.06) + 's';
    });
  }


  // --- Hero parallax on scroll ---
  if (hero && !isReduced) {
    const heroBg = hero.querySelector('.hero__bg img');
    const heroContent = hero.querySelector('.hero__content');

    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) return;
      const ratio = window.scrollY / window.innerHeight;

      if (heroBg) {
        heroBg.style.transform = `scale(${1 + ratio * 0.08}) translateY(${ratio * 30}px)`;
      }
      if (heroContent) {
        heroContent.style.opacity = 1 - ratio * 1.2;
        heroContent.style.transform = `translateY(${ratio * 60}px)`;
      }
    }, { passive: true });
  }


  // --- Mobile menu ---
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta a');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }


  // --- Scroll reveal animations ---
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  if (reveals.length > 0 && !isReduced) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }


  // --- Stat counter animation ---
  const statNumbers = document.querySelectorAll('[data-count]');

  if (statNumbers.length > 0) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => countObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = isReduced ? 0 : 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(target * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    if (duration === 0) {
      el.textContent = prefix + target.toLocaleString() + suffix;
    } else {
      requestAnimationFrame(update);
    }
  }


  // --- FAQ Accordion ---
  const accordionTriggers = document.querySelectorAll('.accordion__trigger');

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const content = item.querySelector('.accordion__content');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.accordion__item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.accordion__content').style.maxHeight = '0';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        content.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });


  // --- Gallery Lightbox ---
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox__img');
  const galleryItems = document.querySelectorAll('.gallery-item');
  let currentGalleryIndex = 0;
  let galleryImages = [];

  if (lightbox && galleryItems.length > 0) {
    galleryImages = Array.from(galleryItems).map(item => {
      const img = item.querySelector('img');
      return img ? img.src : '';
    }).filter(Boolean);

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentGalleryIndex = index;
        openLightbox(galleryImages[index]);
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox__close')) {
        closeLightbox();
      }
    });

    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
        updateLightboxImage();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }

  function updateLightboxImage() {
    if (!lightboxImg) return;
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';
    setTimeout(() => {
      lightboxImg.src = galleryImages[currentGalleryIndex];
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  }

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }


  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  // --- Form interaction enhancements ---
  const formInputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
  formInputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.closest('.form-group')?.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.form-group')?.classList.remove('focused');
    });
  });


  // --- Magnetic effect on CTA buttons (desktop only) ---
  if (!isReduced && window.matchMedia('(min-width: 1024px) and (hover: hover)').matches) {
    document.querySelectorAll('.btn--primary.btn--lg').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translateY(-2px) translate(${x * 0.1}px, ${y * 0.1}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

    // ---- Availability Calendar ----
    const calGrid = document.getElementById('calGrid');
    const calMonthYear = document.getElementById('calMonthYear');
    const calPrev = document.getElementById('calPrev');
    const calNext = document.getElementById('calNext');

    if (calGrid && !window.BOOKINGS_DATA) {
        calGrid.innerHTML = '<div style="grid-column:1/-1;padding:2rem;text-align:center;color:var(--warm-gray);">Please contact us to check availability.</div>';
    }

    if (calGrid && window.BOOKINGS_DATA) {
        const bookedHours = {};

        function addHours(dateStr, hours) {
            if (!dateStr || !hours) return;
            bookedHours[dateStr] = (bookedHours[dateStr] || 0) + hours;
        }

        window.BOOKINGS_DATA.forEach(function(b) {
            if (!b.bookingDate || !b.hours) return;
            // Skip entries with non-date values (e.g. "TBC", "Checking")
            if (!/^\d{4}-\d{2}-\d{2}$/.test(b.bookingDate)) return;
            addHours(b.bookingDate, b.hours);
            if (b.recurringWeeks > 0) {
                var baseDate = new Date(b.bookingDate + 'T00:00:00');
                if (isNaN(baseDate.getTime())) return;
                for (var w = 1; w <= b.recurringWeeks; w++) {
                    var nextDate = new Date(baseDate);
                    nextDate.setDate(nextDate.getDate() + (w * 7));
                    var dateStr = nextDate.toISOString().split('T')[0];
                    addHours(dateStr, b.hours);
                }
            }
        });

        var calCurrentMonth = new Date().getMonth();
        var calCurrentYear = new Date().getFullYear();

        function renderCalendar(month, year) {
            var monthNames = ['January','February','March','April','May','June',
                              'July','August','September','October','November','December'];
            calMonthYear.textContent = monthNames[month] + ' ' + year;
            calGrid.innerHTML = '';

            var firstDay = new Date(year, month, 1).getDay();
            var daysInMonth = new Date(year, month + 1, 0).getDate();
            var today = new Date();
            today.setHours(0, 0, 0, 0);

            for (var e = 0; e < firstDay; e++) {
                var emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day calendar-day--empty';
                calGrid.appendChild(emptyCell);
            }

            for (var d = 1; d <= daysInMonth; d++) {
                var cell = document.createElement('div');
                cell.className = 'calendar-day';
                var cellDate = new Date(year, month, d);
                var dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
                var hours = bookedHours[dateStr] || 0;

                var dayNum = document.createElement('span');
                dayNum.textContent = d;
                cell.appendChild(dayNum);

                if (cellDate < today) {
                    cell.classList.add('calendar-day--past');
                } else if (hours >= 12) {
                    cell.classList.add('calendar-day--booked');
                } else if (hours > 0) {
                    cell.classList.add('calendar-day--partial');
                }

                if (cellDate.getTime() === today.getTime()) {
                    cell.classList.add('calendar-day--today');
                }

                if (hours > 0 && cellDate >= today) {
                    var tooltip = document.createElement('div');
                    tooltip.className = 'calendar-tooltip';
                    tooltip.textContent = hours + ' of 14 hours booked';
                    cell.appendChild(tooltip);
                }

                calGrid.appendChild(cell);
            }
        }

        renderCalendar(calCurrentMonth, calCurrentYear);

        calPrev.addEventListener('click', function() {
            calCurrentMonth--;
            if (calCurrentMonth < 0) { calCurrentMonth = 11; calCurrentYear--; }
            renderCalendar(calCurrentMonth, calCurrentYear);
        });

        calNext.addEventListener('click', function() {
            calCurrentMonth++;
            if (calCurrentMonth > 11) { calCurrentMonth = 0; calCurrentYear++; }
            renderCalendar(calCurrentMonth, calCurrentYear);
        });

        var activePopover = null;
        calGrid.addEventListener('click', function(e) {
            var day = e.target.closest('.calendar-day');
            if (!day) return;
            var tooltip = day.querySelector('.calendar-tooltip');
            if (!tooltip) return;
            if (window.matchMedia('(max-width: 767px)').matches) {
                if (activePopover && activePopover !== tooltip) {
                    activePopover.style.display = 'none';
                }
                var isVisible = tooltip.style.display === 'block';
                tooltip.style.display = isVisible ? 'none' : 'block';
                tooltip.style.opacity = isVisible ? '0' : '1';
                activePopover = isVisible ? null : tooltip;
            }
        });

        document.addEventListener('click', function(e) {
            if (activePopover && !e.target.closest('.calendar-day')) {
                activePopover.style.display = 'none';
                activePopover = null;
            }
        });
    }


  // --- Demo Modal ---
  const demoModal = document.getElementById('demoModal');
  if (demoModal) {
    const openModal = () => {
      demoModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      demoModal.classList.remove('open');
      document.body.style.overflow = '';
    };

    // CTA buttons trigger modal
    document.querySelectorAll('[data-demo-cta]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    // Close on X button
    demoModal.querySelector('.demo-modal__close').addEventListener('click', closeModal);

    // Close on backdrop click
    demoModal.querySelector('.demo-modal__backdrop').addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && demoModal.classList.contains('open')) {
        closeModal();
      }
    });
  }

});
