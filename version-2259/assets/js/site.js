(function () {
  function toggleMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback-title]'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var wrapper = image.closest('.poster-wrap, .mini-thumb, .related-thumb');

        if (wrapper) {
          wrapper.classList.add('poster-fallback');
          wrapper.setAttribute('data-title', image.getAttribute('alt') || image.getAttribute('data-fallback-title') || '经典电影');
        }

        image.remove();
      });
    });
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var count = document.querySelector('[data-filter-count]');
    var quickButtons = Array.prototype.slice.call(document.querySelectorAll('[data-quick-filter]'));

    if (!input || !cards.length) {
      return;
    }

    function buildText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilter(value) {
      var keyword = String(value || '').trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var matched = !keyword || buildText(card).indexOf(keyword) !== -1;
        card.classList.toggle('hidden-by-filter', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '显示 ' + visible + ' 部影片';
      }
    }

    input.addEventListener('input', function () {
      applyFilter(input.value);
    });

    quickButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-quick-filter') || '';
        applyFilter(input.value);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMobileMenu();
    setupHeroSlider();
    setupImageFallbacks();
    setupPageFilter();
  });
})();
