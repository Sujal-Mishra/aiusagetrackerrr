// Track AI usage and provide helpful insights
let aiRequestCount = 0;
let warningLevel = 0;
let totalCO2 = 0;
let sessionStart = Date.now();
let dailyStats = {};
let annoyanceModeEnabled = false;

// Real-ish CO2 estimates based on research (grams per request)
// Source: Various studies on ML model energy consumption
const CO2_ESTIMATES = {
  'api.openai.com': 4.32,        // GPT-4 level models
  'chat.openai.com': 4.32,
  'api.anthropic.com': 3.8,      // Claude models
  'claude.ai': 3.8,
  'generativelanguage.googleapis.com': 2.9,  // Gemini
  'gemini.google.com': 2.9,
  'bard.google.com': 2.9
};

// AI domains to track
const AI_DOMAINS = [
  'api.openai.com',
  'api.anthropic.com',
  'generativelanguage.googleapis.com',
  'claude.ai',
  'chat.openai.com',
  'gemini.google.com'
];

// Load saved data
chrome.storage.local.get(['aiRequestCount', 'warningLevel', 'totalCO2', 'sessionStart', 'dailyStats', 'annoyanceModeEnabled'], (result) => {
  aiRequestCount = result.aiRequestCount || 0;
  warningLevel = result.warningLevel || 0;
  totalCO2 = result.totalCO2 || 0;
  sessionStart = result.sessionStart || Date.now();
  dailyStats = result.dailyStats || {};
  annoyanceModeEnabled = result.annoyanceModeEnabled || false;
  
  // Reset daily stats if it's a new day
  const today = new Date().toDateString();
  if (!dailyStats[today]) {
    dailyStats = { [today]: { requests: 0, co2: 0 } };
  }
});

// Listen for web requests to AI services
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method === 'POST' || details.method === 'GET') {
      // Determine which AI service
      const url = new URL(details.url);
      const domain = url.hostname;
      const co2Amount = CO2_ESTIMATES[domain] || 3.5; // default estimate
      
      aiRequestCount++;
      totalCO2 += co2Amount;
      
      // Update daily stats
      const today = new Date().toDateString();
      if (!dailyStats[today]) {
        dailyStats[today] = { requests: 0, co2: 0 };
      }
      dailyStats[today].requests++;
      dailyStats[today].co2 += co2Amount;
      
      // Save to storage
      chrome.storage.local.set({ 
        aiRequestCount, 
        warningLevel,
        totalCO2,
        sessionStart,
        dailyStats
      });

      // More reasonable warning thresholds (per session)
      const sessionRequests = getSessionRequests();
      
      if (sessionRequests >= 50 && warningLevel < 3) {
        warningLevel = 3;
        triggerGuiltTrip(3);
      } else if (annoyanceModeEnabled && sessionRequests >= 30 && warningLevel < 2.5) {
        // Special annoyance mode trigger at 30
        warningLevel = 2.5;

         showNotification(
        "🚨 ANN0YANCE MODE",
        "Bas bhai bas. Planet literally ro raha hai 😭"
  );
        triggerAnnoyanceMode();
      } else if (sessionRequests >= 25 && warningLevel < 2) {
        warningLevel = 2;
        triggerGuiltTrip(2);
      } else if (sessionRequests >= 15 && warningLevel < 1) {
        warningLevel = 1;

         showNotification(
        "🌱 Easy bhai",
        `You've already made ${aiRequestCount} AI requests. Thoda dimag bhi use kar le 😛`
  );

        triggerGuiltTrip(1);
      }

      chrome.storage.local.set({ warningLevel });
    }
  },
  { urls: Object.keys(CO2_ESTIMATES).map(d => `*://${d}/*`) }
);

function getSessionRequests() {
  const sessionDuration = Date.now() - sessionStart;
  const hoursSinceStart = sessionDuration / (1000 * 60 * 60);
  
  // Reset session after 4 hours of inactivity
  if (hoursSinceStart > 4) {
    sessionStart = Date.now();
    chrome.storage.local.set({ sessionStart });
    return 0;
  }
  
  return aiRequestCount;
}

// Trigger guilt trip overlays
function triggerGuiltTrip(level) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showGuiltTrip',
        level: level,
        requests: aiRequestCount,
        co2: totalCO2
      });
    }
  });
}

// Trigger annoyance mode (special overlay at 30 requests)
function triggerAnnoyanceMode() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'showAnnoyanceMode',
        requests: aiRequestCount,
        co2: totalCO2
      });
    }
  });
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon128.png",
    title: title,
    message: message,
    priority: 2
  });
}

// Listen for reset requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reset') {
    aiRequestCount = 0;
    warningLevel = 0;
    totalCO2 = 0;
    chrome.storage.local.set({ aiRequestCount: 0, warningLevel: 0, totalCO2: 0 });
    sendResponse({ success: true });
  } else if (request.action === 'getStats') {
    sendResponse({ 
      requests: aiRequestCount, 
      warningLevel: warningLevel,
      co2: totalCO2
    });
  } else if (request.action === 'toggleAnnoyanceMode') {
    annoyanceModeEnabled = request.enabled;
    chrome.storage.local.set({ annoyanceModeEnabled });
    sendResponse({ success: true, enabled: annoyanceModeEnabled });
  } else if (request.action === 'getAnnoyanceMode') {
    sendResponse({ enabled: annoyanceModeEnabled });
  }
  return true;
});
