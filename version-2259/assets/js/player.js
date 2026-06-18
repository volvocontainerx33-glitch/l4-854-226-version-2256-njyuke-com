(function () {
  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
  var initialized = false;
  var hlsInstance = null;

  function setStatus(text) {
    var status = document.querySelector('[data-player-status]');

    if (status) {
      status.textContent = text;
    }
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = HLS_CDN;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS 播放库加载失败'));
      };
      document.head.appendChild(script);
    });
  }

  function attachNative(video, source) {
    video.src = source;
    video.load();
    initialized = true;
    setStatus('已使用浏览器原生 HLS 播放。');
  }

  function attachWithHls(video, source, Hls) {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('HLS 播放源已载入，可正常播放。');
    });
    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus('网络错误，正在重新载入播放源。');
        hlsInstance.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus('媒体错误，正在尝试恢复播放。');
        hlsInstance.recoverMediaError();
        return;
      }

      setStatus('播放器遇到无法恢复的错误。');
      hlsInstance.destroy();
    });

    initialized = true;
  }

  function initializePlayer(video) {
    var source = video.getAttribute('data-video-src');

    if (!source) {
      setStatus('未找到播放源。');
      return Promise.reject(new Error('未找到播放源'));
    }

    if (initialized) {
      return Promise.resolve();
    }

    setStatus('正在初始化 HLS 播放器...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      attachNative(video, source);
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        attachWithHls(video, source, Hls);
        return;
      }

      video.src = source;
      initialized = true;
      setStatus('当前浏览器将尝试直接播放 m3u8。');
    }).catch(function (error) {
      setStatus(error.message || 'HLS 播放器初始化失败。');
      throw error;
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');

    if (!video) {
      return;
    }

    initializePlayer(video).catch(function () {
      return null;
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        initializePlayer(video).then(function () {
          overlay.classList.add('hidden');
          return video.play();
        }).catch(function () {
          overlay.classList.remove('hidden');
        });
      });
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('hidden');
      }
    });
  });
})();
