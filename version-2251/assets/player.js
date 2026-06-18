import { H as Hls } from "./hls.js";

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(function (root) {
    var video = root.querySelector("video");
    var button = root.querySelector("[data-play]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var ready = false;
    var hls = null;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function activate() {
      attach();
      if (button) {
        button.hidden = true;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.hidden = false;
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", activate);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          activate();
        }
      });
      video.addEventListener("ended", function () {
        if (button) {
          button.hidden = false;
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
});
