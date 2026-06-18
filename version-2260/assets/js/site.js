(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        if (index < 0) {
            index = 0;
        }
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function setupFilters() {
        var grid = document.querySelector(".filter-grid");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".filter-card"));
        var keyword = document.getElementById("keyword-filter");
        var category = document.getElementById("category-filter");
        var sort = document.getElementById("sort-filter");
        var empty = document.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        if (keyword && params.get("q")) {
            keyword.value = params.get("q");
        }
        if (sort && params.get("sort")) {
            sort.value = params.get("sort");
        }
        if (category && params.get("category")) {
            category.value = params.get("category");
        }
        function apply() {
            var term = keyword ? keyword.value.trim().toLowerCase() : "";
            var selected = category ? category.value : "all";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || ""
                ].join(" ").toLowerCase();
                var matchesTerm = !term || haystack.indexOf(term) !== -1;
                var matchesCategory = selected === "all" || card.getAttribute("data-category") === selected;
                var show = matchesTerm && matchesCategory;
                card.classList.toggle("is-hidden", !show);
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        function sortCards() {
            if (!sort) {
                return;
            }
            var mode = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (mode === "popular") {
                    return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                }
                if (mode === "likes") {
                    return Number(b.getAttribute("data-likes")) - Number(a.getAttribute("data-likes"));
                }
                return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }
        [keyword, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        if (sort) {
            sort.addEventListener("change", function () {
                sortCards();
                apply();
            });
        }
        sortCards();
        apply();
    }

    function setupPlayer() {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        if (!video) {
            return;
        }
        var url = video.getAttribute("data-video-url");
        var hlsInstance = null;
        function start() {
            if (!url) {
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.src) {
                    video.src = url;
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                }
                video.play().catch(function () {});
                return;
            }
            if (!video.src) {
                video.src = url;
            }
            video.play().catch(function () {});
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
