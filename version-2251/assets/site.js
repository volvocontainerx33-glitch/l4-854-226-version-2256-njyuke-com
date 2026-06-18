document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
    var slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  var searchInput = document.querySelector("[data-search-input]");
  var filters = Array.from(document.querySelectorAll("[data-filter]"));
  var cards = Array.from(document.querySelectorAll("[data-card]"));
  var activeFilter = "all";

  function applyFilter() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    cards.forEach(function (card) {
      var text = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-meta") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle("is-hidden", !(matchQuery && matchFilter));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      activeFilter = button.getAttribute("data-filter") || "all";
      filters.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applyFilter();
    });
  });
});
