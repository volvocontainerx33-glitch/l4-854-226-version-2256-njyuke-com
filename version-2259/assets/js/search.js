(function () {
  function $(selector) {
    return document.querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString('zh-CN');
  }

  function createCard(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.link) + '">',
      '    <div class="poster-wrap" data-title="' + escapeHtml(movie.title) + '">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" data-fallback-title="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
      '      <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '      <span class="play-mark" aria-hidden="true">▶</span>',
      '    </div>',
      '    <div class="movie-info">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.one_line) + '</p>',
      '      <div class="meta-line">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + formatNumber(movie.views) + ' 次</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function setupImageFallbacks(scope) {
    var images = Array.prototype.slice.call(scope.querySelectorAll('img[data-fallback-title]'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var wrapper = image.closest('.poster-wrap');

        if (wrapper) {
          wrapper.classList.add('poster-fallback');
          wrapper.setAttribute('data-title', image.getAttribute('alt') || '经典电影');
        }

        image.remove();
      });
    });
  }

  function matches(movie, filters) {
    var text = normalize([
      movie.title,
      movie.one_line,
      movie.summary,
      movie.genre,
      movie.tags,
      movie.region,
      movie.type,
      movie.year
    ].join(' '));

    if (filters.query && text.indexOf(filters.query) === -1) {
      return false;
    }

    if (filters.category && normalize(movie.category) !== filters.category) {
      return false;
    }

    if (filters.year && normalize(movie.year).indexOf(filters.year) === -1) {
      return false;
    }

    if (filters.region && normalize(movie.region).indexOf(filters.region) === -1) {
      return false;
    }

    if (filters.type && normalize(movie.type).indexOf(filters.type) === -1) {
      return false;
    }

    return true;
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_DATA || [];
    var results = $('#search-results');
    var count = $('#search-count');
    var queryInput = $('#search-query');
    var categorySelect = $('#search-category');
    var yearInput = $('#search-year');
    var regionInput = $('#search-region');
    var typeInput = $('#search-type');
    var submitButton = $('#search-submit');
    var resetButton = $('#search-reset');
    var params = new URLSearchParams(window.location.search);

    if (!results) {
      return;
    }

    queryInput.value = params.get('q') || '';

    function collectFilters() {
      return {
        query: normalize(queryInput.value),
        category: normalize(categorySelect.value),
        year: normalize(yearInput.value),
        region: normalize(regionInput.value),
        type: normalize(typeInput.value)
      };
    }

    function render() {
      var filters = collectFilters();
      var matched = data.filter(function (movie) {
        return matches(movie, filters);
      });
      var limited = matched.slice(0, 240);

      results.innerHTML = limited.map(createCard).join('');
      setupImageFallbacks(results);

      if (count) {
        count.textContent = '共匹配 ' + matched.length + ' 部影片，当前显示 ' + limited.length + ' 部';
      }
    }

    submitButton.addEventListener('click', render);
    [queryInput, categorySelect, yearInput, regionInput, typeInput].forEach(function (field) {
      field.addEventListener('input', render);
      field.addEventListener('change', render);
    });

    resetButton.addEventListener('click', function () {
      queryInput.value = '';
      categorySelect.value = '';
      yearInput.value = '';
      regionInput.value = '';
      typeInput.value = '';
      render();
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', initSearchPage);
})();
