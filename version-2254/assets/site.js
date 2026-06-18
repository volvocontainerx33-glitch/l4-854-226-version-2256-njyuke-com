(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileNavigation() {
    var toggle = document.querySelector("[data-mobile-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var intervalId = null;

    function showSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-active", index === activeIndex);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle("is-active", index === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      intervalId = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        showSlide(nextIndex);
        startAutoPlay();
      });
    });

    slider.addEventListener("mouseenter", stopAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);
    startAutoPlay();
  }

  function initFilterPanels() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var searchInput = panel.querySelector("[data-filter-search]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var counter = panel.querySelector("[data-filter-count]");
      var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-movie-card]"));

      function applyFilters() {
        var query = normalize(searchInput ? searchInput.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));

          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
          var matchesRegion = !region || normalize(card.getAttribute("data-region")) === region;
          var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
          var isVisible = matchesQuery && matchesYear && matchesRegion && matchesType;

          card.classList.toggle("is-hidden", !isVisible);

          if (isVisible) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = visibleCount + " 部影片";
        }
      }

      [searchInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = page.querySelector("[data-search-page-input]");
    var results = page.querySelector("[data-search-results]");
    var status = page.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function createCard(movie) {
      return [
        '<article class="movie-card movie-card-compact">',
        '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
        '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function render() {
      var query = normalize(input.value);
      var words = query.split(/\s+/).filter(Boolean);
      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        if (!words.length) {
          return true;
        }

        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(" "));

        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      results.innerHTML = matches.map(createCard).join("");

      if (status) {
        if (query) {
          status.textContent = "找到 " + matches.length + " 条结果，最多显示前 120 条。";
        } else {
          status.textContent = "默认展示前 120 部影片，可输入关键词继续筛选。";
        }
      }
    }

    input.value = initialQuery;
    input.addEventListener("input", render);
    render();
  }

  function initMoviePlayer() {
    var shell = document.querySelector("[data-player]");

    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var startButton = shell.querySelector("[data-player-start]");
    var message = shell.querySelector("[data-player-message]");
    var sourceUrl = shell.getAttribute("data-m3u8");
    var hasLoaded = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.add("is-visible");
    }

    function hideMessage() {
      if (message) {
        message.classList.remove("is-visible");
      }
    }

    function loadSource() {
      if (hasLoaded) {
        return Promise.resolve();
      }

      if (!sourceUrl) {
        showMessage("当前影片没有可用播放源。");
        return Promise.reject(new Error("Missing HLS source"));
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        hasLoaded = true;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hasLoaded = true;
        return Promise.resolve();
      }

      showMessage("当前浏览器不支持 HLS 播放，请换用现代浏览器或部署到服务器后再试。");
      return Promise.reject(new Error("HLS is not supported"));
    }

    function playVideo() {
      hideMessage();
      loadSource()
        .then(function () {
          return video.play();
        })
        .then(function () {
          if (startButton) {
            startButton.classList.add("is-hidden");
          }
        })
        .catch(function () {
          showMessage("播放源已绑定，浏览器阻止自动播放时请再次点击视频控件播放。");
        });
    }

    if (startButton) {
      startButton.addEventListener("click", playVideo);
    }

    video.addEventListener("play", function () {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileNavigation();
    initHeroSlider();
    initFilterPanels();
    initSearchPage();
    initMoviePlayer();
  });
})();
