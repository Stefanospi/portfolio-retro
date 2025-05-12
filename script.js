document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen");
  const pressStartButton = document.getElementById("press-start-button");
  const portfolioContent = document.getElementById("portfolio-content");
  const arcadeScreen = document.querySelector(".arcade-screen");

  const audioStart = document.getElementById("start-sound");
  const audioMenuHover = document.getElementById("menu-hover-sound");
  const audioMenuSelect = document.getElementById("menu-select-sound");

  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".game-section");
  let currentSectionId = null;
  let retroEffectsInstance = null;

  function playSound(audioElement) {
    if (
      audioElement &&
      audioElement.src &&
      audioElement.src !== window.location.href
    ) {
      audioElement.currentTime = 0;
      audioElement.play().catch((error) => {
        console.warn(
          "Audio playback was prevented (this is common before user interaction):",
          error
        );
      });
    }
  }

  // Forza sempre la visualizzazione del start screen all'inizio
  if (startScreen && portfolioContent) {
    portfolioContent.classList.add("hidden");
    startScreen.classList.remove("hidden");
  }

  if (startScreen && pressStartButton && portfolioContent) {
    pressStartButton.addEventListener("click", () => {
      playSound(audioStart);

      // IMPORTANTE: Nascondi subito lo start screen prima di mostrare il boot
      startScreen.classList.add("hidden");

      // Crea la sequenza di boot DENTRO l'arcade screen
      createBootSequence(() => {
        portfolioContent.classList.remove("hidden");
        showSection("chi-sono");
        if (gameTitle && !gameTitle.textContent.trim() && originalTitleText) {
          typeWriterTitle();
        }
        initializeFooterBlink();

        // Inizializza effetti retro dopo il boot
        setTimeout(() => initializeRetroEffects(), 100);

        // Crea il pulsante EXIT
        createExitButton();
      });
    });
  }

  // Crea la sequenza di boot DENTRO l'arcade screen
  function createBootSequence(callback) {
    const bootOverlay = document.createElement("div");
    bootOverlay.className = "boot-sequence";
    bootOverlay.innerHTML = `
      <div class="boot-text">
        <p>STEFANO OS v1.337</p>
        <p>INITIALIZING PORTFOLIO SYSTEM...</p>
        <p class="loading-dots">LOADING<span></span></p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    `;

    // Aggiungi il boot overlay DENTRO l'arcade screen
    if (arcadeScreen) {
      // Clear any existing content to ensure boot is visible
      arcadeScreen.innerHTML = "";
      arcadeScreen.appendChild(bootOverlay);

      // Force boot overlay to be visible
      bootOverlay.style.display = "flex";
      bootOverlay.style.opacity = "1";
    }

    // Animazione progress bar
    let progress = 0;
    const progressFill = bootOverlay.querySelector(".progress-fill");
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);

        // Mostra "READY!" e poi esegui callback
        const loadingText = bootOverlay.querySelector(".loading-dots");
        loadingText.innerHTML = "READY!";
        loadingText.classList.add("ready");

        setTimeout(() => {
          bootOverlay.classList.add("fade-out");
          setTimeout(() => {
            bootOverlay.remove();
            // Re-add the content containers
            if (arcadeScreen) {
              arcadeScreen.appendChild(startScreen);
              arcadeScreen.appendChild(portfolioContent);
            }
            if (callback) callback();
          }, 500);
        }, 500);
      }
      progressFill.style.width = progress + "%";
    }, 100);
  }

  // Crea il pulsante EXIT
  function createExitButton() {
    const exitButton = document.createElement("button");
    exitButton.className = "exit-button";
    exitButton.innerHTML = "🚪 EXIT";
    exitButton.title = "Return to start screen";

    exitButton.addEventListener("click", () => {
      playSound(audioMenuSelect);

      // Nascondi portfolio e mostra start screen
      portfolioContent.classList.add("hidden");
      startScreen.classList.remove("hidden");

      // Reset stati
      currentSectionId = null;
      sections.forEach((section) => section.classList.add("hidden"));
      menuItems.forEach((item) => item.classList.remove("active"));

      // Reset del titolo
      const gameTitle = document.querySelector(
        "#portfolio-content .game-title"
      );
      if (gameTitle) {
        gameTitle.textContent = "";
        i = 0; // Reset del contatore typewriter
      }

      // Reset scroll
      if (arcadeScreen) {
        arcadeScreen.scrollTo({ top: 0, behavior: "instant" });
      }

      // Rimuovi il pulsante EXIT
      exitButton.remove();

      // Opzionale: disabilita temporaneamente gli effetti
      if (retroEffectsInstance) {
        retroEffectsInstance.effectsEnabled = false;
        setTimeout(() => {
          if (retroEffectsInstance) {
            retroEffectsInstance.effectsEnabled = true;
          }
        }, 1000);
      }
    });

    document.body.appendChild(exitButton);
  }

  function showSection(sectionId) {
    let sectionActuallyOpened = false;
    sections.forEach((section) => {
      if (section.id === sectionId) {
        if (
          section.id === currentSectionId &&
          !section.classList.contains("hidden")
        ) {
          section.classList.add("hidden");
          currentSectionId = null;
        } else {
          section.classList.remove("hidden");
          currentSectionId = section.id;
          sectionActuallyOpened = true;
        }
      } else {
        section.classList.add("hidden");
      }
    });

    menuItems.forEach((item) => {
      item.classList.toggle(
        "active",
        item.dataset.section === currentSectionId
      );
    });

    // Migliorato scrolling - sempre torna su quando si cambia sezione
    if (arcadeScreen) {
      if (sectionActuallyOpened && currentSectionId) {
        // Scrolla all'inizio del portfolio content quando si apre una sezione
        arcadeScreen.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else if (!currentSectionId) {
        // Se chiudiamo tutte le sezioni, torna all'inizio
        arcadeScreen.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }

    // Aggiungi effetto glitch quando cambi sezione
    if (sectionActuallyOpened) {
      applyGlitchOnTransition();
    }
  }

  menuItems.forEach((item) => {
    item.addEventListener("mouseover", () => {
      playSound(audioMenuHover);
    });
    item.addEventListener("click", (event) => {
      event.preventDefault();
      playSound(audioMenuSelect);
      const sectionId = item.dataset.section;
      showSection(sectionId);
    });
  });

  const gameTitle = document.querySelector("#portfolio-content .game-title");
  let originalTitleText = "";
  if (gameTitle) originalTitleText = gameTitle.textContent.trim();
  if (gameTitle) gameTitle.textContent = "";
  let i = 0;

  function typeWriterTitle() {
    if (gameTitle && i < originalTitleText.length) {
      gameTitle.textContent += originalTitleText.charAt(i);
      i++;
      setTimeout(typeWriterTitle, 80);
    }
  }

  function initializeFooterBlink() {
    const hireButton = document.querySelector(".hire-me-flashing");
    if (hireButton) {
      setInterval(() => {
        hireButton.style.visibility =
          hireButton.style.visibility === "hidden" ? "visible" : "hidden";
      }, 600);
    }
  }

  // Funzione per applicare glitch durante le transizioni
  function applyGlitchOnTransition() {
    const portfolioContent = document.querySelector("#portfolio-content");
    if (portfolioContent) {
      portfolioContent.classList.add("glitch-transition");
      setTimeout(() => {
        portfolioContent.classList.remove("glitch-transition");
      }, 300);
    }
  }

  // Inizializza effetti retro
  function initializeRetroEffects() {
    // Inizializza la classe RetroEffects se esiste
    if (typeof RetroEffects !== "undefined") {
      retroEffectsInstance = new RetroEffects();
    }

    // Aggiungi effetto di apertura
    const arcadeScreen = document.querySelector(".arcade-screen");
    if (arcadeScreen) {
      arcadeScreen.classList.add("screen-power-on");
      setTimeout(() => {
        arcadeScreen.classList.remove("screen-power-on");
      }, 1000);
    }
  }
});

// Retro Visual Effects Module
class RetroEffects {
  constructor() {
    this.effectsEnabled = true;
    this.glitchInterval = null;
    this.crtEffectApplied = false;

    // Inizializza effetti
    this.initCRTEffect();
    this.initGlitchEffect();
    this.initPixelTrail();
    this.initScreenFlicker();
    this.initStaticNoise();
    this.initRGBShift();
    this.addEffectsToggle();
  }

  // 1. Effetto CRT (Cathode Ray Tube)
  initCRTEffect() {
    if (this.crtEffectApplied) return;

    const crtOverlay = document.createElement("div");
    crtOverlay.className = "crt-overlay";
    crtOverlay.innerHTML = `
      <div class="crt-scanlines"></div>
      <div class="crt-vignette"></div>
      <div class="crt-flicker"></div>
    `;

    const arcadeScreen = document.querySelector(".arcade-screen");
    if (arcadeScreen) {
      arcadeScreen.appendChild(crtOverlay);
      this.crtEffectApplied = true;
    }
  }

  // 2. Effetto Glitch Casuale
  initGlitchEffect() {
    const glitchElements = [
      ".game-title",
      ".section-title",
      ".menu-item",
      ".arcade-marquee .marquee-text",
    ];

    this.glitchInterval = setInterval(() => {
      if (!this.effectsEnabled) return;

      // Ridotta probabilità del glitch al 2% per essere meno invasivo
      if (Math.random() < 0.02) {
        const elements = document.querySelectorAll(glitchElements.join(","));
        const element = elements[Math.floor(Math.random() * elements.length)];
        if (element && !element.classList.contains("glitch-effect")) {
          this.applyGlitch(element);
        }
      }
    }, 2000);
  }

  applyGlitch(element) {
    // Previeni glitch multipli sullo stesso elemento
    if (element.querySelector(".glitch-copy-1")) return;

    element.classList.add("glitch-effect");

    // Crea copie per l'effetto glitch
    const glitchCopy1 = document.createElement("span");
    const glitchCopy2 = document.createElement("span");
    glitchCopy1.textContent = element.textContent;
    glitchCopy2.textContent = element.textContent;
    glitchCopy1.classList.add("glitch-copy-1");
    glitchCopy2.classList.add("glitch-copy-2");

    element.appendChild(glitchCopy1);
    element.appendChild(glitchCopy2);

    // Rimuovi effetto dopo animazione
    setTimeout(() => {
      element.classList.remove("glitch-effect");
      glitchCopy1.remove();
      glitchCopy2.remove();
    }, 400);
  }

  // 3. Pixel Trail Effect
  initPixelTrail() {
    let lastTime = 0;
    const pixels = [];
    const maxPixels = 8;

    document.addEventListener("mousemove", (e) => {
      if (!this.effectsEnabled) return;

      // Limita la frequenza di creazione pixel
      const currentTime = Date.now();
      if (currentTime - lastTime < 50) return; // 20 FPS
      lastTime = currentTime;

      const rect = document
        .querySelector(".arcade-screen")
        ?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Crea pixel trail solo dentro lo schermo arcade
      if (
        mouseX >= 0 &&
        mouseY >= 0 &&
        mouseX <= rect.width &&
        mouseY <= rect.height
      ) {
        this.createPixel(mouseX, mouseY, pixels, maxPixels);
      }
    });
  }

  createPixel(x, y, pixels, maxPixels) {
    const pixel = document.createElement("div");
    pixel.className = "pixel-trail";
    pixel.style.left = x + "px";
    pixel.style.top = y + "px";

    const arcadeScreen = document.querySelector(".arcade-screen");
    arcadeScreen.appendChild(pixel);
    pixels.push(pixel);

    // Fade out animation
    setTimeout(() => {
      pixel.style.opacity = "0";
      setTimeout(() => {
        pixel.remove();
        pixels.shift();
      }, 300);
    }, 100);

    // Mantieni solo maxPixels
    if (pixels.length > maxPixels) {
      const oldPixel = pixels.shift();
      oldPixel.remove();
    }
  }

  // 4. Screen Flicker
  initScreenFlicker() {
    setInterval(() => {
      if (!this.effectsEnabled) return;

      // Ridotta probabilità di flicker a 1%
      if (Math.random() < 0.01) {
        const arcadeScreen = document.querySelector(".arcade-screen");
        if (arcadeScreen) {
          arcadeScreen.classList.add("screen-flicker");
          setTimeout(() => {
            arcadeScreen.classList.remove("screen-flicker");
          }, 100);
        }
      }
    }, 5000);
  }

  // 5. Static Noise
  initStaticNoise() {
    const canvas = document.createElement("canvas");
    canvas.className = "static-noise";
    canvas.width = 200;
    canvas.height = 200;

    const ctx = canvas.getContext("2d");

    const arcadeScreen = document.querySelector(".arcade-screen");
    if (arcadeScreen) {
      arcadeScreen.appendChild(canvas);
    }

    // Update meno frequente per migliori performance
    setInterval(() => {
      if (!this.effectsEnabled) return;
      this.updateStaticNoise(ctx, canvas);
    }, 100);
  }

  updateStaticNoise(ctx, canvas) {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 3; // Ancora più trasparente
    }

    ctx.putImageData(imageData, 0, 0);
  }

  // 6. RGB Shift on Click
  initRGBShift() {
    document.addEventListener("click", (e) => {
      if (!this.effectsEnabled) return;

      if (
        e.target.classList.contains("menu-item") ||
        e.target.id === "press-start-button" ||
        e.target.classList.contains("exit-button")
      ) {
        const arcadeScreen = document.querySelector(".arcade-screen");
        if (arcadeScreen) {
          arcadeScreen.classList.add("rgb-shift");
          setTimeout(() => {
            arcadeScreen.classList.remove("rgb-shift");
          }, 200);
        }
      }
    });
  }

  // Toggle per abilitare/disabilitare effetti
  addEffectsToggle() {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "effects-toggle";
    toggleBtn.innerHTML = '<span class="fx-icon">⚡</span> FX';
    toggleBtn.title = "Toggle retro effects";

    toggleBtn.addEventListener("click", () => {
      this.effectsEnabled = !this.effectsEnabled;
      toggleBtn.classList.toggle("disabled", !this.effectsEnabled);

      const effectElements = document.querySelectorAll(
        ".crt-overlay, .static-noise, .pixel-trail"
      );

      if (!this.effectsEnabled) {
        // Disabilita tutti gli effetti
        effectElements.forEach((el) => {
          el.style.display = "none";
        });
      } else {
        // Riabilita effetti
        document
          .querySelectorAll(".crt-overlay, .static-noise")
          .forEach((el) => {
            el.style.display = "block";
          });
      }
    });

    document.body.appendChild(toggleBtn);
  }
}
