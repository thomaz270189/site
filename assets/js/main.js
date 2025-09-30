
(function () {
  "use strict";

  /**
   * Helpers
   */
  function select(selector) {
    return document.querySelector(selector);
  }

  function selectAll(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function on(event, target, handler, options) {
    const el = typeof target === 'string' ? select(target) : target;
    if (!el) return;
    el.addEventListener(event, handler, options);
  }

  function onAll(event, targets, handler, options) {
    selectAll(targets).forEach((el) => el.addEventListener(event, handler, options));
  }

  /**
   * Header: alterna classe .scrolled quando há rolagem
   */
  function toggleScrolled() {
    const bodyEl = select('body');
    const headerEl = select('#header');
    if (!headerEl) return;
    const isSticky = headerEl.classList.contains('scroll-up-sticky') || headerEl.classList.contains('sticky-top') || headerEl.classList.contains('fixed-top');
    if (!isSticky) return;
    if (window.scrollY > 100) bodyEl.classList.add('scrolled');
    else bodyEl.classList.remove('scrolled');
  }

  on('scroll', document, toggleScrolled);
  on('load', window, toggleScrolled);

  /**
   * Menu móvel: abrir/fechar e fechar em navegação por âncora
   */
  const mobileNavToggleBtn = select('.mobile-nav-toggle');

  function mobileNavToggle() {
    const bodyEl = select('body');
    if (!bodyEl || !mobileNavToggleBtn) return;
    bodyEl.classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }

  if (mobileNavToggleBtn) on('click', mobileNavToggleBtn, mobileNavToggle);

  onAll('click', '#navmenu a', () => {
    if (select('.mobile-nav-active')) mobileNavToggle();
  });

  /**
   * Dropdowns do menu móvel
   */
  onAll('click', '.navmenu .toggle-dropdown', function (e) {
    e.preventDefault();
    const parent = this.parentNode;
    const next = parent ? parent.nextElementSibling : null;
    if (!parent || !next) return;
    parent.classList.toggle('active');
    next.classList.toggle('dropdown-active');
    e.stopImmediatePropagation();
  });

  /**
   * Preloader: remove ao carregar
   */
  const preloader = select('#preloader');
  if (preloader) on('load', window, () => preloader.remove());

  /**
   * Botão de voltar ao topo
   */
  const scrollTopBtn = select('.scroll-top');

  function toggleScrollTop() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 100) scrollTopBtn.classList.add('active');
    else scrollTopBtn.classList.remove('active');
  }

  if (scrollTopBtn) {
    on('click', scrollTopBtn, (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  on('load', window, toggleScrollTop);
  on('scroll', document, toggleScrollTop);

  /**
   * AOS: animações ao rolar
   */
  function aosInit() {
    if (typeof AOS === 'undefined') return;
    AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
  }
  on('load', window, aosInit);

  /**
   * PureCounter: contadores animados
   */
  if (typeof PureCounter !== 'undefined') new PureCounter();

  /**
   * Swiper: inicialização genérica
   */
  function initSwiper() {
    selectAll('.init-swiper').forEach((swiperElement) => {
      const configEl = swiperElement.querySelector('.swiper-config');
      if (!configEl) return;
      let config;
      try {
        config = JSON.parse(configEl.innerHTML.trim());
      } catch (e) {
        return;
      }
      if (swiperElement.classList.contains('swiper-tab')) {
        if (typeof initSwiperWithCustomPagination === 'function') {
          initSwiperWithCustomPagination(swiperElement, config);
        } else if (typeof Swiper !== 'undefined') {
          new Swiper(swiperElement, config);
        }
      } else if (typeof Swiper !== 'undefined') {
        new Swiper(swiperElement, config);
      }
    });
  }
  on('load', window, initSwiper);

  /**
   * FAQ: abre/fecha respostas
   */
  onAll('click', '.faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header', (e) => {
    const item = e.currentTarget;
    const parent = item ? item.parentNode : null;
    if (parent) parent.classList.toggle('faq-active');
  });

  /**
   * GLightbox: lightbox para galerias
   */
  if (typeof GLightbox !== 'undefined') {
    GLightbox({ selector: '.glightbox' });
  }

  /**
   * Isotope: layout e filtros
   */
  selectAll('.isotope-layout').forEach(function (isotopeItem) {
    const layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    const filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    const sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    const container = isotopeItem.querySelector('.isotope-container');
    if (!container || typeof imagesLoaded === 'undefined' || typeof Isotope === 'undefined') return;

    imagesLoaded(container, function () {
      initIsotope = new Isotope(container, {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        const active = isotopeItem.querySelector('.isotope-filters .filter-active');
        if (active) active.classList.remove('filter-active');
        this.classList.add('filter-active');
        if (initIsotope) {
          initIsotope.arrange({ filter: this.getAttribute('data-filter') });
        }
        if (typeof aosInit === 'function') aosInit();
      }, false);
    });
  });

  /**
   * Corrige posição de rolagem ao carregar com hash na URL
   */
  on('load', window, function () {
    if (!window.location.hash) return;
    const section = select(window.location.hash);
    if (!section) return;
    setTimeout(() => {
      const scrollMarginTop = parseInt(getComputedStyle(section).scrollMarginTop || '0', 10);
      window.scrollTo({ top: section.offsetTop - scrollMarginTop, behavior: 'smooth' });
    }, 100);
  });

  /**
   * Scrollspy do menu
   */
  const navmenuLinks = selectAll('.navmenu a');

  function navmenuScrollspy() {
    const position = window.scrollY + 200;
    navmenuLinks.forEach((link) => {
      const hash = link.hash;
      if (!hash) return;
      const section = select(hash);
      if (!section) return;
      const within = position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight);
      if (within) {
        selectAll('.navmenu a.active').forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  on('load', window, navmenuScrollspy);
  on('scroll', document, navmenuScrollspy);

  /**
   * Typed.js: efeito de digitação
   */
  const typedElement = select('.typed');
  if (typedElement && typeof Typed !== 'undefined') {
    const itemsAttr = typedElement.getAttribute('data-typed-items');
    if (itemsAttr) {
      const strings = itemsAttr.split(',').map((s) => s.trim()).filter(Boolean);
      if (strings.length > 0) {
        new Typed('.typed', { strings, loop: true, typeSpeed: 80, backSpeed: 40, backDelay: 1500 });
      }
    }
  }

})();