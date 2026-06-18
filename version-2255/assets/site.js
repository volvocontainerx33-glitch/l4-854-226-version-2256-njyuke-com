(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        if (!header) {
            return;
        }
        var setHeader = function () {
            if (window.scrollY > 24) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        };
        setHeader();
        window.addEventListener("scroll", setHeader, { passive: true });
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };
        var next = function () {
            show(current + 1);
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(next, 5200);
            });
        });
        timer = window.setInterval(next, 5200);
    }

    function makeResult(item) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = item.url;
        var img = document.createElement("img");
        img.src = item.cover;
        img.alt = item.title;
        img.loading = "lazy";
        var body = document.createElement("span");
        var title = document.createElement("strong");
        title.textContent = item.title;
        var meta = document.createElement("small");
        meta.textContent = [item.year, item.region, item.type, item.genre].filter(Boolean).join(" · ");
        body.appendChild(title);
        body.appendChild(meta);
        link.appendChild(img);
        link.appendChild(body);
        return link;
    }

    function setupSearch() {
        var data = window.SEARCH_INDEX || [];
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        forms.forEach(function (form) {
            var input = form.querySelector("[data-search-input]");
            var results = form.querySelector("[data-search-results]");
            if (!input || !results) {
                return;
            }
            var render = function () {
                var query = normalize(input.value);
                results.innerHTML = "";
                if (!query) {
                    results.classList.remove("is-open");
                    return;
                }
                var matched = data.filter(function (item) {
                    return normalize([item.title, item.region, item.type, item.year, item.genre, item.description].join(" ")).indexOf(query) !== -1;
                }).slice(0, 8);
                if (!matched.length) {
                    var empty = document.createElement("div");
                    empty.className = "search-result-item";
                    empty.textContent = "暂无匹配影片";
                    results.appendChild(empty);
                } else {
                    matched.forEach(function (item) {
                        results.appendChild(makeResult(item));
                    });
                }
                results.classList.add("is-open");
            };
            input.addEventListener("input", render);
            input.addEventListener("focus", render);
            form.addEventListener("submit", function (event) {
                var query = normalize(input.value);
                var first = results.querySelector("a");
                if (query && first) {
                    event.preventDefault();
                    window.location.href = first.href;
                }
            });
            document.addEventListener("click", function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove("is-open");
                }
            });
        });
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var list = scope ? scope.querySelector("[data-filter-list]") : null;
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
            var empty = scope ? scope.querySelector("[data-empty-state]") : null;
            var text = panel.querySelector("[data-filter-text]");
            var region = panel.querySelector("[data-filter-region]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            if (!cards.length) {
                return;
            }
            var apply = function () {
                var query = normalize(text && text.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre].join(" "));
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (regionValue && normalize(card.dataset.region) !== regionValue) {
                        ok = false;
                    }
                    if (typeValue && normalize(card.dataset.type) !== typeValue) {
                        ok = false;
                    }
                    if (yearValue && normalize(card.dataset.year) !== yearValue) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            };
            [text, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.setupMoviePlayer = function (videoId, buttonId, layerId, stream) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var layer = document.getElementById(layerId);
        if (!video || !stream) {
            return;
        }
        var hls = null;
        var started = false;
        var playVideo = function () {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        };
        var start = function () {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (layer) {
                layer.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                } else {
                    window.setTimeout(playVideo, 250);
                }
                return;
            }
            video.src = stream;
            playVideo();
        };
        if (button) {
            button.addEventListener("click", start);
        }
        if (layer) {
            layer.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!started) {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    ready(function () {
        setupHeader();
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupFilters();
    });
}());
