document.addEventListener("DOMContentLoaded", () => {
  // Core Elements
  const startScreen = document.getElementById("start-screen");
  const pressStartButton = document.getElementById("press-start-button");
  const portfolioContent = document.getElementById("portfolio-content");
  const arcadeScreen = document.querySelector(".arcade-screen");

  // Audio Elements
  const audioStart = document.getElementById("start-sound");
  const audioMenuHover = document.getElementById("menu-hover-sound");
  const audioMenuSelect = document.getElementById("menu-select-sound");

  // Options Menu Elements
  const optionsButton = document.getElementById("options-button");
  const optionsMenu = document.getElementById("options-menu");
  const menuToggleFxButton = document.getElementById("menu-toggle-fx");
  const menuExitButton = document.getElementById("menu-exit");

  // Portfolio Elements
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".game-section");
  const gameTitle = document.querySelector("#portfolio-content .game-title");

  // State Variables
  let currentSectionId = null;
  let retroEffectsInstance = null; // Will hold the RetroEffects instance
  let originalTitleText = "";
  let i = 0; // Typewriter index

  // --- Utility Functions ---

  function playSound(audioElement) {
    if (
      audioElement &&
      audioElement.src &&
      audioElement.src !== window.location.href // Prevent playing if src is invalid
    ) {
      audioElement.currentTime = 0;
      audioElement.play().catch((error) => {
        // Common warning, especially on first load before user interaction
        console.warn("Audio playback prevented:", error);
      });
    } else if (
      audioElement &&
      (!audioElement.src || audioElement.src === window.location.href)
    ) {
      console.warn("Audio source missing or invalid for:", audioElement.id);
    }
  }

  // --- Initialization ---

  // Force start screen initially
  if (startScreen && portfolioContent) {
    portfolioContent.classList.add("hidden");
    startScreen.classList.remove("hidden");
    if (optionsButton) optionsButton.classList.add("hidden"); // Hide options on start
    if (optionsMenu) optionsMenu.classList.add("hidden"); // Ensure menu is hidden
  }

  if (gameTitle) {
    originalTitleText = gameTitle.textContent.trim(); // Store original title
    gameTitle.textContent = ""; // Clear for typewriter
  }

  // --- Boot Sequence ---

  function createBootSequence(callback) {
    const bootOverlay = document.createElement("div");
    bootOverlay.className = "boot-sequence";
    // Ensure boot sequence overrides .hidden if applied to arcade-screen
    bootOverlay.style.display = "flex";
    bootOverlay.style.opacity = "1";
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

    // Clear arcade screen and add boot overlay
    if (arcadeScreen) {
      // Detach main content temporarily to ensure boot is visible
      if (startScreen && startScreen.parentNode === arcadeScreen)
        arcadeScreen.removeChild(startScreen);
      if (portfolioContent && portfolioContent.parentNode === arcadeScreen)
        arcadeScreen.removeChild(portfolioContent);
      // Clear any other potential children (like previous boot sequences)
      arcadeScreen.innerHTML = "";
      arcadeScreen.appendChild(bootOverlay);
    } else {
      console.error("Arcade screen not found for boot sequence.");
      if (callback) callback(); // Still run callback if screen missing
      return;
    }

    // Progress bar animation
    let progress = 0;
    const progressFill = bootOverlay.querySelector(".progress-fill");
    const loadingText = bootOverlay.querySelector(".loading-dots");
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);

        loadingText.innerHTML = "READY!";
        loadingText.classList.add("ready");

        // Fade out boot sequence
        setTimeout(() => {
          bootOverlay.classList.add("fade-out");
          // Remove boot sequence after fade out
          setTimeout(() => {
            if (bootOverlay.parentNode) {
              bootOverlay.parentNode.removeChild(bootOverlay);
            }
            // Re-attach main content AFTER boot completes and is removed
            if (arcadeScreen) {
              // Make sure they exist before appending
              if (startScreen) arcadeScreen.appendChild(startScreen);
              if (portfolioContent) arcadeScreen.appendChild(portfolioContent);
            }
            if (callback) callback(); // Execute the callback function
          }, 500); // Matches fade-out duration
        }, 500); // Delay before fade out starts
      }
      if (progressFill) progressFill.style.width = progress + "%";
    }, 100); // Interval duration
  }

  // --- Game State Management ---

  function exitToStartScreen() {
    playSound(audioMenuSelect);

    // Hide portfolio, show start screen
    if (portfolioContent) portfolioContent.classList.add("hidden");
    if (startScreen) startScreen.classList.remove("hidden");

    // Hide options menu and button
    if (optionsMenu) optionsMenu.classList.add("hidden");
    if (optionsButton) optionsButton.classList.add("hidden");

    // Reset portfolio state
    currentSectionId = null;
    sections.forEach((section) => section.classList.add("hidden"));
    menuItems.forEach((item) => item.classList.remove("active"));

    // Reset title
    if (gameTitle) {
      gameTitle.textContent = "";
      i = 0; // Reset typewriter counter
    }

    // Reset scroll
    if (arcadeScreen) {
      arcadeScreen.scrollTo({ top: 0, behavior: "instant" });
    }

    // Optional: Disable effects when exiting?
    // if (retroEffectsInstance && retroEffectsInstance.effectsEnabled) {
    //   retroEffectsInstance.toggleEffects();
    // }
  }

  function showSection(sectionId) {
    let sectionActuallyOpened = false;

    // Toggle section visibility
    sections.forEach((section) => {
      if (section.id === sectionId) {
        if (
          section.id === currentSectionId &&
          !section.classList.contains("hidden")
        ) {
          // Clicked active section: hide it
          section.classList.add("hidden");
          currentSectionId = null; // No section is active
        } else {
          // Clicked inactive section or different section: show it
          section.classList.remove("hidden");
          currentSectionId = section.id; // Set as active
          sectionActuallyOpened = true;
        }
      } else {
        // Hide all other sections
        section.classList.add("hidden");
      }
    });

    // Update active state of menu items
    menuItems.forEach((item) => {
      item.classList.toggle(
        "active",
        item.dataset.section === currentSectionId
      );
    });

    // Scroll to top when a section is opened or all are closed
    if (arcadeScreen && (sectionActuallyOpened || !currentSectionId)) {
      arcadeScreen.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Apply transition effect if a section was opened
    if (sectionActuallyOpened) {
      applyGlitchOnTransition();
    }

    // Hide options menu when changing sections
    if (optionsMenu && !optionsMenu.classList.contains("hidden")) {
      optionsMenu.classList.add("hidden");
    }
  }

  // --- UI Effects & Animations ---

  function typeWriterTitle() {
    if (gameTitle && i < originalTitleText.length) {
      gameTitle.textContent += originalTitleText.charAt(i);
      i++;
      setTimeout(typeWriterTitle, 80); // Adjust speed if needed
    }
  }

  function initializeFooterBlink() {
    const hireButton = document.querySelector(".hire-me-flashing");
    if (hireButton) {
      // Clear previous interval if any to prevent duplicates
      if (hireButton.blinkInterval) clearInterval(hireButton.blinkInterval);
      hireButton.blinkInterval = setInterval(() => {
        hireButton.style.visibility =
          hireButton.style.visibility === "hidden" ? "visible" : "hidden";
      }, 600); // Blink speed
    }
  }

  function applyGlitchOnTransition() {
    if (portfolioContent) {
      portfolioContent.classList.add("glitch-transition");
      setTimeout(() => {
        portfolioContent.classList.remove("glitch-transition");
      }, 300); // Duration of glitch effect
    }
  }

  function applyPowerOnEffect() {
    if (arcadeScreen) {
      arcadeScreen.classList.add("screen-power-on");
      setTimeout(() => {
        arcadeScreen.classList.remove("screen-power-on");
      }, 1000); // Duration of power-on effect
    }
  }

  // --- Event Listeners ---

  // Press Start Button
  if (startScreen && pressStartButton && portfolioContent) {
    pressStartButton.addEventListener("click", () => {
      playSound(audioStart);
      if (startScreen) startScreen.classList.add("hidden"); // Hide start screen immediately

      createBootSequence(() => {
        // Runs after boot sequence finishes
        if (portfolioContent) portfolioContent.classList.remove("hidden");
        showSection("chi-sono"); // Show default section

        // Start typewriter if title exists and is empty
        if (gameTitle && !gameTitle.textContent.trim() && originalTitleText) {
          typeWriterTitle();
        }
        initializeFooterBlink(); // Start footer blink

        // Initialize retro effects only once
        if (typeof RetroEffects !== "undefined" && !retroEffectsInstance) {
          retroEffectsInstance = new RetroEffects();
        }
        applyPowerOnEffect(); // Apply visual screen power-on

        // Show the options button
        if (optionsButton) optionsButton.classList.remove("hidden");
      });
    });
  } else {
    console.error("Start button or core containers not found.");
  }

  // Portfolio Menu Items
  menuItems.forEach((item) => {
    item.addEventListener("mouseover", () => {
      playSound(audioMenuHover);
    });
    item.addEventListener("click", (event) => {
      event.preventDefault();
      playSound(audioMenuSelect);
      const sectionId = item.dataset.section;
      if (sectionId) {
        showSection(sectionId);
      }
    });
  });

  // Options Menu Logic
  if (optionsButton && optionsMenu) {
    // Toggle Menu Visibility
    optionsButton.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent click reaching document listener immediately
      playSound(audioMenuSelect);
      optionsMenu.classList.toggle("hidden");
      // Optional: focus first item when opening
      if (!optionsMenu.classList.contains("hidden")) {
        optionsMenu.querySelector("button")?.focus();
      }
    });

    // Toggle Effects Button
    if (menuToggleFxButton) {
      menuToggleFxButton.addEventListener("click", () => {
        playSound(audioMenuSelect);
        if (retroEffectsInstance) {
          retroEffectsInstance.toggleEffects(); // Use the class method
        } else {
          console.warn("RetroEffects instance not available to toggle.");
        }
        optionsMenu.classList.add("hidden"); // Close menu
      });
    } else {
      console.error("Toggle FX button not found in options menu.");
    }

    // Exit Game Button
    if (menuExitButton) {
      menuExitButton.addEventListener("click", () => {
        // Sound is played inside exitToStartScreen
        exitToStartScreen();
        // Menu is hidden by exit function
      });
    } else {
      console.error("Exit button not found in options menu.");
    }

    // Close menu if clicking outside of it
    document.addEventListener("click", (event) => {
      if (optionsMenu && !optionsMenu.classList.contains("hidden")) {
        // Check if the click was outside the menu AND not on the options button
        if (
          !optionsMenu.contains(event.target) &&
          event.target !== optionsButton
        ) {
          optionsMenu.classList.add("hidden");
        }
      }
    });

    // Optional: Close menu with Escape key
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        optionsMenu &&
        !optionsMenu.classList.contains("hidden")
      ) {
        optionsMenu.classList.add("hidden");
      }
    });
  } else {
    console.error("Options button or menu container not found.");
  }
}); // End DOMContentLoaded

// ============================
// Retro Visual Effects Module
// ============================
class RetroEffects {
  constructor() {
    this.effectsEnabled = true; // Effects start enabled
    this.glitchInterval = null;
    this.flickerInterval = null;
    this.noiseInterval = null;
    this.crtEffectApplied = false;

    console.log("Initializing Retro Effects..."); // Debug log

    // Initialize effects immediately
    this.initCRTEffect();
    this.initGlitchEffect();
    this.initPixelTrail();
    this.initScreenFlicker();
    this.initStaticNoise();
    this.initRGBShift();
    // No button creation needed here anymore
  }

  // --- Public Method to Toggle Effects ---
  toggleEffects() {
    this.effectsEnabled = !this.effectsEnabled;
    console.log("Retro Effects Enabled:", this.effectsEnabled);

    // Toggle visibility of overlays
    const crtOverlay = document.querySelector(".crt-overlay");
    const noiseCanvas = document.querySelector(".static-noise");

    if (crtOverlay)
      crtOverlay.style.display = this.effectsEnabled ? "block" : "none";
    if (noiseCanvas)
      noiseCanvas.style.display = this.effectsEnabled ? "block" : "none";

    // Optional: Add/remove a global class for CSS targeting if needed
    document.body.classList.toggle(
      "retro-effects-disabled",
      !this.effectsEnabled
    );

    // Note: We are not stopping/starting intervals here for simplicity,
    // the checks within the interval callbacks will prevent them from running.
    // If performance on low-end devices is critical, consider clearing/restarting intervals.
  }

  // --- Effect Initializations ---

  // 1. CRT Effect
  initCRTEffect() {
    if (this.crtEffectApplied) return;
    const arcadeScreen = document.querySelector(".arcade-screen");
    if (!arcadeScreen) return;

    const crtOverlay = document.createElement("div");
    crtOverlay.className = "crt-overlay";
    crtOverlay.innerHTML = `
      <div class="crt-scanlines"></div>
      <div class="crt-vignette"></div>
      <div class="crt-flicker"></div>
    `;
    arcadeScreen.appendChild(crtOverlay);
    this.crtEffectApplied = true;
    // Set initial visibility based on state
    crtOverlay.style.display = this.effectsEnabled ? "block" : "none";
    console.log("CRT Effect Initialized.");
  }

  // 2. Glitch Effect
  initGlitchEffect() {
    if (this.glitchInterval) clearInterval(this.glitchInterval); // Clear previous if any

    const glitchElements = [
      ".game-title",
      ".section-title",
      ".menu-item",
      ".arcade-marquee .marquee-text",
    ];

    this.glitchInterval = setInterval(() => {
      if (!this.effectsEnabled) return; // Check flag

      if (Math.random() < 0.02) {
        // Low probability
        const elements = document.querySelectorAll(glitchElements.join(","));
        if (elements.length > 0) {
          const element = elements[Math.floor(Math.random() * elements.length)];
          // Check if element exists and doesn't already have glitch copies
          if (element && !element.querySelector(".glitch-copy-1")) {
            this.applyGlitch(element);
          }
        }
      }
    }, 2000); // Interval
    console.log("Glitch Effect Interval Initialized.");
  }

  applyGlitch(element) {
    if (!element) return;
    element.classList.add("glitch-effect");

    const glitchCopy1 = document.createElement("span");
    const glitchCopy2 = document.createElement("span");
    glitchCopy1.textContent = element.textContent;
    glitchCopy2.textContent = element.textContent;
    glitchCopy1.classList.add("glitch-copy-1");
    glitchCopy2.classList.add("glitch-copy-2");

    element.appendChild(glitchCopy1);
    element.appendChild(glitchCopy2);

    setTimeout(() => {
      // Check if element still exists before removing class/children
      if (element) {
        element.classList.remove("glitch-effect");
        // Check if copies still exist before removing
        if (glitchCopy1 && glitchCopy1.parentNode === element)
          glitchCopy1.remove();
        if (glitchCopy2 && glitchCopy2.parentNode === element)
          glitchCopy2.remove();
      }
    }, 400); // Glitch duration
  }

  // 3. Pixel Trail Effect
  initPixelTrail() {
    let lastTime = 0;
    const pixels = [];
    const maxPixels = 8; // Max trail length

    document.addEventListener("mousemove", (e) => {
      if (!this.effectsEnabled) return; // Check flag

      const currentTime = Date.now();
      if (currentTime - lastTime < 50) return; // Throttle to ~20fps
      lastTime = currentTime;

      const arcadeScreen = document.querySelector(".arcade-screen");
      if (!arcadeScreen) return;
      const rect = arcadeScreen.getBoundingClientRect();

      // Calculate mouse position relative to the arcade screen
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Create pixel only if mouse is inside the arcade screen
      if (
        mouseX >= 0 &&
        mouseY >= 0 &&
        mouseX <= rect.width &&
        mouseY <= rect.height
      ) {
        this.createPixel(mouseX, mouseY, pixels, maxPixels, arcadeScreen);
      }
    });
    console.log("Pixel Trail Listener Initialized.");
  }

  createPixel(x, y, pixels, maxPixels, container) {
    // Double-check flag just before creating
    if (!this.effectsEnabled || !container) return;

    const pixel = document.createElement("div");
    pixel.className = "pixel-trail";
    pixel.style.left = x + "px";
    pixel.style.top = y + "px";

    container.appendChild(pixel);
    pixels.push(pixel);

    // Fade out and remove
    setTimeout(() => {
      pixel.style.opacity = "0";
      setTimeout(() => {
        if (pixel.parentNode) pixel.remove();
        // Remove from array safely
        const index = pixels.indexOf(pixel);
        if (index > -1) pixels.splice(index, 1);
      }, 300); // Matches opacity transition
    }, 100); // Time before fade starts

    // Limit array size
    while (pixels.length > maxPixels) {
      const oldPixel = pixels.shift();
      if (oldPixel && oldPixel.parentNode) oldPixel.remove();
    }
  }

  // 4. Screen Flicker
  initScreenFlicker() {
    if (this.flickerInterval) clearInterval(this.flickerInterval); // Clear previous if any

    this.flickerInterval = setInterval(() => {
      if (!this.effectsEnabled) return; // Check flag

      if (Math.random() < 0.01) {
        // Low probability
        const arcadeScreen = document.querySelector(".arcade-screen");
        if (arcadeScreen) {
          arcadeScreen.classList.add("screen-flicker");
          setTimeout(() => {
            // Check element still exists
            if (arcadeScreen) arcadeScreen.classList.remove("screen-flicker");
          }, 100); // Flicker duration
        }
      }
    }, 5000); // Interval check
    console.log("Screen Flicker Interval Initialized.");
  }

  // 5. Static Noise
  initStaticNoise() {
    const arcadeScreen = document.querySelector(".arcade-screen");
    if (!arcadeScreen) return;

    const canvas = document.createElement("canvas");
    canvas.className = "static-noise";
    canvas.width = 200; // Smaller canvas for performance
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    arcadeScreen.appendChild(canvas);
    // Set initial visibility based on state
    canvas.style.display = this.effectsEnabled ? "block" : "none";

    if (this.noiseInterval) clearInterval(this.noiseInterval); // Clear previous if any

    this.noiseInterval = setInterval(() => {
      // Update is controlled by canvas visibility now
      this.updateStaticNoise(ctx, canvas);
    }, 100); // Update frequency
    console.log("Static Noise Interval Initialized.");
  }

  updateStaticNoise(ctx, canvas) {
    // Only run if effects are on AND canvas is visible
    if (!this.effectsEnabled || !canvas || canvas.style.display === "none")
      return;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value; // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 3; // Alpha (very low)
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // 6. RGB Shift on Click
  initRGBShift() {
    document.addEventListener("click", (e) => {
      if (!this.effectsEnabled) return; // Check flag

      // Check if the clicked element is one of the interactive ones
      if (
        e.target.closest(".menu-item") || // Portfolio menu
        e.target.id === "press-start-button" ||
        e.target.id === "options-button" || // Options gear button
        e.target.closest(".menu-option-button") // Options menu items
      ) {
        const arcadeScreen = document.querySelector(".arcade-screen");
        if (arcadeScreen) {
          arcadeScreen.classList.add("rgb-shift");
          setTimeout(() => {
            // Check element still exists
            if (arcadeScreen) arcadeScreen.classList.remove("rgb-shift");
          }, 200); // Duration of shift
        }
      }
    });
    console.log("RGB Shift Listener Initialized.");
  }
} // End RetroEffects Class
