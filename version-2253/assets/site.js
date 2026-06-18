(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initPage() {
    ready(function () {
      var header = document.querySelector(".site-header");
      var toggle = document.querySelector(".nav-toggle");
      var links = document.querySelector(".nav-links");

      function updateHeader() {
        if (header) {
          header.classList.toggle("is-scrolled", window.scrollY > 18);
        }
      }

      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });

      if (toggle && links) {
        toggle.addEventListener("click", function () {
          links.classList.toggle("is-open");
          document.body.classList.toggle("nav-open", links.classList.contains("is-open"));
        });

        links.querySelectorAll("a").forEach(function (link) {
          link.addEventListener("click", function () {
            links.classList.remove("is-open");
            document.body.classList.remove("nav-open");
          });
        });
      }
    });
  }

  function initHero() {
    ready(function () {
      var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
      var prev = document.querySelector(".hero-prev");
      var next = document.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === current);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 6200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      start();
    });
  }

  function initFilters() {
    ready(function () {
      document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var search = scope.querySelector("[data-filter-search]");
        var type = scope.querySelector("[data-filter-type]");
        var region = scope.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var empty = scope.querySelector("[data-filter-empty]");

        function textOf(card, key) {
          return (card.getAttribute(key) || "").toLowerCase();
        }

        function apply() {
          var query = search ? search.value.trim().toLowerCase() : "";
          var typeValue = type ? type.value : "";
          var regionValue = region ? region.value : "";
          var visible = 0;

          cards.forEach(function (card) {
            var haystack = [
              textOf(card, "data-title"),
              textOf(card, "data-tags"),
              textOf(card, "data-type"),
              textOf(card, "data-region"),
              textOf(card, "data-year")
            ].join(" ");
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
            var matchesRegion = !regionValue || (card.getAttribute("data-region") || "").indexOf(regionValue) !== -1;
            var show = matchesQuery && matchesType && matchesRegion;

            card.hidden = !show;
            if (show) {
              visible += 1;
            }
          });

          if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
          }
        }

        [search, type, region].forEach(function (control) {
          if (control) {
            control.addEventListener("input", apply);
            control.addEventListener("change", apply);
          }
        });

        apply();
      });
    });
  }

  function initPlayer(source) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var overlay = document.querySelector(".player-overlay");
      var started = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      function begin() {
        if (started) {
          playVideo();
          return;
        }

        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          return;
        }

        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
      }

      if (overlay) {
        overlay.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (!started) {
          begin();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  window.Site = {
    initPage: initPage,
    initHero: initHero,
    initFilters: initFilters,
    initPlayer: initPlayer
  };
})();
