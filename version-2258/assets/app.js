(function () {
    'use strict';

    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = $('.mobile-menu-button');
        var menu = $('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!isOpen));
            menu.hidden = isOpen;
        });
    }

    function setupHeaderSearch() {
        $all('.site-search-form').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function setupHeroSlider() {
        var slides = $all('.hero-slide');
        var dots = $all('.hero-dot');
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-slide')) || 0);
                start();
            });
        });

        start();
    }

    function setupFilters() {
        var panel = $('.filter-panel');
        if (!panel) {
            return;
        }
        var keywordInput = $('.filter-input', panel);
        var selects = $all('.filter-select', panel);
        var cards = $all('.filter-results .movie-card');
        var count = $('.js-visible-count', panel);

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var selected = {};
            selects.forEach(function (select) {
                selected[select.getAttribute('data-filter')] = normalize(select.value);
            });

            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' '));

                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesSelects = Object.keys(selected).every(function (key) {
                    return !selected[key] || normalize(card.getAttribute('data-' + key)) === selected[key];
                });
                var shouldShow = matchesKeyword && matchesSelects;
                card.classList.toggle('is-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible;
            }
        }

        if (keywordInput) {
            keywordInput.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        applyFilters();
    }

    function movieCardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '    <a class="movie-thumb" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
            '        <span class="play-mark">▶</span>',
            '        <span class="category-pill">' + escapeHtml(movie.category) + '</span>',
            '        <span class="duration">' + escapeHtml(movie.duration) + '</span>',
            '    </a>',
            '    <div class="movie-info">',
            '        <a href="./' + movie.file + '" class="movie-title">' + escapeHtml(movie.title) + '</a>',
            '        <p>' + escapeHtml(movie.description) + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + Number(movie.views).toLocaleString() + ' 次播放</span>',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[character];
        });
    }

    function setupSearchPage() {
        var input = $('.search-page-input');
        var resultsWrap = $('.search-results-wrap');
        var results = $('.search-results');
        var resultCount = $('.search-result-count');
        if (!input || !resultsWrap || !results || !window.MOVIE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        input.value = initialQuery;

        function runSearch() {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                resultsWrap.hidden = true;
                results.innerHTML = '';
                if (resultCount) {
                    resultCount.textContent = '';
                }
                return;
            }

            var words = query.split(/\s+/).filter(Boolean);
            var matches = window.MOVIE_INDEX.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.tags,
                    movie.description
                ].join(' ').toLowerCase();
                return words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
            });

            resultsWrap.hidden = false;
            if (resultCount) {
                resultCount.textContent = matches.length + ' 条结果';
            }
            results.innerHTML = matches.slice(0, 240).map(movieCardTemplate).join('\n');
            if (matches.length === 0) {
                results.innerHTML = '<p class="search-note">没有找到匹配影片，请尝试更换关键词。</p>';
            }
        }

        input.addEventListener('input', runSearch);
        if (initialQuery) {
            runSearch();
        }
    }

    function setupVideoPlayers() {
        $all('.js-video-player').forEach(function (video) {
            var shell = video.closest('.video-shell');
            var button = shell ? $('.js-play-video', shell) : null;
            var status = shell ? $('.video-status', shell) : null;
            if (!button) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function playWithNative(source) {
                video.src = source;
                video.play().catch(function () {
                    setStatus('请再次点击播放器开始播放。');
                });
            }

            function startPlayback() {
                var source = video.getAttribute('data-src');
                if (!source) {
                    setStatus('未找到播放源。');
                    return;
                }
                button.classList.add('hidden');
                setStatus('正在载入播放源...');

                if (window.Hls && window.Hls.isSupported()) {
                    if (video._hlsInstance) {
                        video._hlsInstance.destroy();
                    }
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    video._hlsInstance = hls;
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('播放源已就绪。');
                        video.play().catch(function () {
                            setStatus('请再次点击播放器开始播放。');
                        });
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络波动，正在重新载入...');
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体解码异常，正在恢复...');
                            hls.recoverMediaError();
                        } else {
                            setStatus('当前浏览器无法播放该 HLS 源。');
                            hls.destroy();
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    setStatus('使用浏览器原生 HLS 播放。');
                    playWithNative(source);
                } else {
                    setStatus('当前浏览器需要启用 HLS.js 后播放。');
                }
            }

            button.addEventListener('click', startPlayback);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeaderSearch();
        setupHeroSlider();
        setupFilters();
        setupSearchPage();
        setupVideoPlayers();
    });
}());
