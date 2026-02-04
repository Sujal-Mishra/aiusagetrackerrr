(function () {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = args[0]?.toString?.() || "";

      if (
        url.includes("openai") ||
        url.includes("anthropic") ||
        url.includes("generativelanguage")
      ) {
        chrome.runtime.sendMessage({
          action: "AI_REQUEST_DETECTED",
          url
        });
      }
    } catch (e) {
      // silently ignoreee
    }

    return response;
  };
})();// Listen for guilt trip messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showGuiltTrip') {
    showGuiltTripOverlay(request.level, request.requests, request.co2);
  } else if (request.action === 'showAnnoyanceMode') {
    showAnnoyanceOverlay(request.requests, request.co2);
  }
});

function showGuiltTripOverlay(level, requests, co2) {
  // Remove any existing overlay
  const existing = document.getElementById('ai-guilt-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ai-guilt-overlay';
  overlay.className = `guilt-overlay level-${level}`;
  
  // Randomize messages for variety
  const level1Messages = [
    {
      title: "Quick mindfulness check ✨",
      message: `You've used AI ${requests} times recently. That's about ${co2.toFixed(1)}g of CO2 — roughly the same as charging your phone a couple times.`,
      tip: "Consider: Could you solve some of these yourself? Your brain is pretty amazing when you give it a chance."
    },
    {
      title: "Friendly heads up 🌱",
      message: `AI use limit reached. Please touch grass — for environmental reasons.`,
      tip: "Every extra prompt adds one more sigh from the atmosphere."
    }
  ];
  
  const level2Messages = [
    {
      title: "Friendly reminder 🌱",
      message: `${requests} AI requests add up to ${co2.toFixed(1)}g of CO2. For context, that's like driving about ${(co2 * 8.3).toFixed(0)} meters in a car.`,
      tip: "You know you have a better brain than this, right? Dust it off and consider using it for once."
    },
    {
      title: "Warning detected ⚠️",
      message: `This AI request has been paused to let the Earth breathe. Literally.`,
      tip: "Too many prompts, not enough trees."
    },
    {
      title: "Environmental alert 🌍",
      message: `You asked too many smart questions. Now a tree has to pay the price.`,
      tip: "Your curiosity is impressive. Your carbon footprint? Even more so."
    }
  ];
  
  const level3Messages = [
    {
      title: "Let's have a real talk 💬",
      message: `${requests} requests = ${co2.toFixed(1)}g of CO2. You're clearly working hard, but maybe it's time to balance AI with your own thinking?`,
      tip: "The most creative solutions often come from the struggle. AI is a tool, not a replacement for your judgment."
    },
    {
      title: "Congratulations! 🎉",
      message: `You've reached the AI usage limit. The planet would like a word.`,
      tip: "AI: Making life easier since forever. Making pollution worse since now."
    },
    {
      title: "Server status update 🔴",
      message: `Warning: Excessive intelligence detected. Carbon footprint crying in the corner.`,
      tip: "This conversation is eco-unfriendly. Please recycle your thoughts."
    }
  ];
  
  const messageBank = level === 1 ? level1Messages : level === 2 ? level2Messages : level3Messages;
  const msg = messageBank[Math.floor(Math.random() * messageBank.length)];
  
  overlay.innerHTML = `
    <div class="guilt-container">
      <div class="guilt-header">
        <span class="guilt-emoji">${level === 1 ? '🧠💡' : level === 2 ? '🌍💭' : '🎯✨'}</span>
        <h2 class="guilt-title">${msg.title}</h2>
      </div>
      <p class="guilt-message">${msg.message}</p>
      <div class="guilt-stats">
        <div class="stat">
          <div class="stat-value">${requests}</div>
          <div class="stat-label">This Session</div>
        </div>
        <div class="stat">
          <div class="stat-value">${co2.toFixed(1)}g</div>
          <div class="stat-label">CO2 Impact</div>
        </div>
        <div class="stat">
          <div class="stat-value">${getEquivalent(co2)}</div>
          <div class="stat-label">Equivalent</div>
        </div>
      </div>
      <div class="guilt-tip">
        <div class="tip-icon">💡</div>
        <div class="tip-text">${msg.tip}</div>
      </div>
      <div class="action-buttons">
        <button class="guilt-close primary" onclick="this.closest('.guilt-overlay').remove()">
          ${level === 1 ? 'Got it, I\'ll be mindful' : level === 2 ? 'Fair point, taking a break' : 'You\'re right, I\'ll reflect on this'}
        </button>
        <button class="guilt-close secondary" onclick="openDashboard(); this.closest('.guilt-overlay').remove()">
          See my stats
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Gentle fade out after 10 seconds (all levels)
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 10000);
}

function getEquivalent(co2) {
  if (co2 < 10) return `${(co2 / 8).toFixed(1)} charges`;
  if (co2 < 50) return `${(co2 * 8.3).toFixed(0)}m drive`;
  if (co2 < 100) return `${(co2 / 100).toFixed(1)}h lightbulb`;
  return `${(co2 / 1000).toFixed(2)}kg total`;
}

function openDashboard() {
  chrome.runtime.sendMessage({ action: 'openPopup' });
}

// ANNOYANCE MODE - For people who want the full experience
function showAnnoyanceOverlay(requests, co2) {
  // Remove any existing overlay
  const existing = document.getElementById('ai-guilt-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'ai-guilt-overlay';
  overlay.className = 'guilt-overlay annoyance-mode';
  
  // Rotate through hilarious messages
  const annoyanceMessages = [
    {
      title: "SERVER OVERHEATED. EARTH OFFENDED.",
      message: `${requests} AI requests. Try again tomorrow.`,
      tip: "Saving time with AI, wasting the planet efficiently."
    },
    {
      title: "⚠️ EXCESSIVE INTELLIGENCE DETECTED",
      message: `Warning: Excessive intelligence detected. Carbon footprint crying in the corner.`,
      tip: "Your curiosity is impressive. Your carbon footprint? Even more so."
    },
    {
      title: "ENVIRONMENTAL VIOLATION",
      message: `You asked too many smart questions. Now a tree has to pay the price.`,
      tip: "AI didn't break — the ozone layer did."
    },
    {
      title: "ECO-UNFRIENDLY ACTIVITY DETECTED",
      message: `This conversation is eco-unfriendly. Please recycle your thoughts.`,
      tip: "Every extra prompt adds one more sigh from the atmosphere."
    },
    {
      title: "ERROR 404: SUSTAINABLE AI NOT FOUND",
      message: `AI: Making life easier since forever. Making pollution worse since now.`,
      tip: "Smart tech, dumb consequences."
    }
  ];
  
  const msg = annoyanceMessages[Math.floor(Math.random() * annoyanceMessages.length)];
  
  overlay.innerHTML = `
    <div class="guilt-container annoyance-container">
      <div class="annoyance-badge">⚠️ ANNOYANCE MODE ⚠️</div>
      <div class="guilt-header">
        <span class="guilt-emoji shaking">🚨</span>
        <h2 class="guilt-title">${msg.title}</h2>
      </div>
      <p class="guilt-message">${msg.message}</p>
      <div class="guilt-stats">
        <div class="stat">
          <div class="stat-value">${requests}</div>
          <div class="stat-label">Excessive Requests</div>
        </div>
        <div class="stat">
          <div class="stat-value">${co2.toFixed(1)}g</div>
          <div class="stat-label">CO2 Wasted</div>
        </div>
        <div class="stat">
          <div class="stat-value">${(requests / 30 * 100).toFixed(0)}%</div>
          <div class="stat-label">AI Dependency</div>
        </div>
      </div>
      <div class="guilt-tip annoyance-tip">
        <div class="tip-icon">💀</div>
        <div class="tip-text">${msg.tip}</div>
      </div>
      <div class="action-buttons">
        <button class="guilt-close primary dodging-button" id="annoyance-close">
          I'm Sorry, I'll Do Better
        </button>
        <button class="guilt-close secondary" onclick="this.closest('.guilt-overlay').remove()">
          Make It Stop
        </button>
      </div>
      <div class="annoying-spinner"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Make it annoying!
  makeItAnnoying(overlay);

  // Auto-remove after 15 seconds (longer than normal)
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 15000);
}

function makeItAnnoying(overlay) {
  const container = overlay.querySelector('.guilt-container');
  
  // Shake the container periodically
  let shakeCount = 0;
  const shakeInterval = setInterval(() => {
    const angle = Math.sin(shakeCount) * 2;
    container.style.transform = `rotate(${angle}deg)`;
    shakeCount += 0.2;
    
    if (shakeCount > 30) {
      clearInterval(shakeInterval);
      container.style.transform = 'rotate(0deg)';
    }
  }, 50);

  // Make the primary button dodge the cursor
  const dodgingBtn = overlay.querySelector('#annoyance-close');
  let dodgeCount = 0;
  
  const dodgeButton = (e) => {
    if (dodgeCount < 3) {
      dodgeCount++;
      const rect = dodgingBtn.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      
      // Move away from cursor
      const deltaX = btnCenterX - mouseX;
      const deltaY = btnCenterY - mouseY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < 100) {
        const moveX = (deltaX / distance) * 150;
        const moveY = (deltaY / distance) * 150;
        dodgingBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        const messages = [
          "Nice try! 😏",
          "Almost got me!",
          "Okay fine, last time..."
        ];
        dodgingBtn.textContent = messages[dodgeCount - 1];
      }
    } else {
      dodgingBtn.style.transform = 'translate(0, 0)';
      dodgingBtn.textContent = "Fine, Click Me Already";
      document.removeEventListener('mousemove', dodgeButton);
    }
  };
  
  document.addEventListener('mousemove', dodgeButton);
  
  dodgingBtn.addEventListener('click', () => {
    document.removeEventListener('mousemove', dodgeButton);
    overlay.remove();
  });
  
  // Add a countdown timer
  let countdown = 15;
  const countdownEl = document.createElement('div');
  countdownEl.className = 'annoyance-countdown';
  countdownEl.textContent = `Auto-close in ${countdown}s`;
  container.appendChild(countdownEl);
  
  const countdownInterval = setInterval(() => {
    countdown--;
    countdownEl.textContent = `Auto-close in ${countdown}s`;
    if (countdown <= 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}
