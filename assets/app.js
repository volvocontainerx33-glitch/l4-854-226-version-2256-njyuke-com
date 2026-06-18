(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuToggle = qs('.menu-toggle');
  var mobilePanel = qs('.mobile-panel');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobilePanel.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  qsa('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = qs('input[name="q"]', form);
      var value = input ? input.value.trim() : '';
      if (value) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(value);
      }
    });
  });

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var list = qs('[data-movie-list]');

    if (!panel || !list) {
      return;
    }

    var searchInput = qs('#movieSearch');
    var yearFilter = qs('#yearFilter');
    var regionFilter = qs('#regionFilter');
    var typeFilter = qs('#typeFilter');
    var categoryFilter = qs('#categoryFilter');
    var visibleCount = qs('[data-visible-count]');
    var cards = qsa('.movie-card', list);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput && query) {
      searchInput.value = query;
    }

    function matchesText(card, q) {
      if (!q) {
        return true;
      }
      return (card.dataset.search || '').toLowerCase().indexOf(q.toLowerCase()) !== -1;
    }

    function matchesExact(card, key, value) {
      if (!value) {
        return true;
      }
      return (card.dataset[key] || '') === value;
    }

    function applyFilters() {
      var q = searchInput ? searchInput.value.trim() : '';
      var year = yearFilter ? yearFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';
      var type = typeFilter ? typeFilter.value : '';
      var category = categoryFilter ? categoryFilter.value : '';
      var count = 0;

      cards.forEach(function (card) {
        var ok = matchesText(card, q) &&
          matchesExact(card, 'year', year) &&
          matchesExact(card, 'region', region) &&
          matchesExact(card, 'type', type) &&
          matchesExact(card, 'category', category);

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          count += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(count);
      }
    }

    [searchInput, yearFilter, regionFilter, typeFilter, categoryFilter].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', applyFilters);
    });

    applyFilters();
  }

  setupFilters();

  var backTop = qs('.back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 500);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}());
