(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('hidden');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var index = 0;
    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
        slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    if (slides.length) {
      showSlide(0);
      var prev = document.querySelector('.hero-control.prev');
      var next = document.querySelector('.hero-control.next');
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(index - 1);
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          showSlide(i);
        });
      });
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var searchInput = document.querySelector('[data-search-input]');
    if (searchInput && q) {
      searchInput.value = q;
    }

    function applyFilters(scope) {
      var input = scope.querySelector('[data-search-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]'));
      var activeType = 'all';
      chips.forEach(function (chip) {
        if (chip.classList.contains('active')) {
          activeType = chip.getAttribute('data-filter-type') || 'all';
        }
      });
      var term = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var type = card.getAttribute('data-type-group') || '';
        var matchedText = !term || text.indexOf(term) !== -1;
        var matchedType = activeType === 'all' || type === activeType;
        card.classList.toggle('hidden-by-filter', !(matchedText && matchedType));
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      if (input) {
        input.addEventListener('input', function () {
          applyFilters(scope);
        });
      }
      Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]')).forEach(function (chip) {
        chip.addEventListener('click', function () {
          Array.prototype.slice.call(scope.querySelectorAll('[data-filter-type]')).forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          applyFilters(scope);
        });
      });
      applyFilters(scope);
    });

    Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          form.setAttribute('action', './search.html');
        } else {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });

    var player = document.querySelector('[data-player]');
    if (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream') || '';
      var started = false;
      var hlsInstance = null;
      function startVideo() {
        if (!video || !stream) {
          return;
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (!started) {
          started = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                  hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                  hlsInstance.recoverMediaError();
                } else {
                  hlsInstance.destroy();
                }
              }
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', startVideo);
      }
      player.addEventListener('click', function (event) {
        if (event.target === player) {
          startVideo();
        }
      });
    }
  });
})();
