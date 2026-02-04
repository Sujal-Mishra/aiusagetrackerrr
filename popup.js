// Load and display stats
function updateStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
    const requests = response.requests || 0;
    const co2 = response.co2 || 0;
    
    // Update request count
    document.getElementById('request-count').textContent = requests;
    
    // Update CO2
    document.getElementById('co2-amount').textContent = `${co2.toFixed(1)}g`;
    
    // Get today's stats
    chrome.storage.local.get(['dailyStats'], (result) => {
      const dailyStats = result.dailyStats || {};
      const today = new Date().toDateString();
      const todayData = dailyStats[today] || { requests: 0, co2: 0 };
      
      document.getElementById('today-count').textContent = todayData.requests;
      
      // Update insights
      updateInsights(requests, todayData.requests, co2);
      
      // Update environmental context
      updateContext(co2);
    });
  });
  
  // Load annoyance mode state
  chrome.runtime.sendMessage({ action: 'getAnnoyanceMode' }, (response) => {
    document.getElementById('annoyance-mode-toggle').checked = response.enabled || false;
  });
}

function updateInsights(totalRequests, todayRequests, co2) {
  const insightsList = document.getElementById('insights-list');
  const insights = [];
  
  // Positive insights
  if (todayRequests < 10) {
    insights.push({
      text: "Great balance today! You're using AI thoughtfully.",
      type: 'positive'
    });
  }
  
  if (todayRequests === 0) {
    insights.push({
      text: "No AI usage today — your natural intelligence is shining! ✨",
      type: 'positive'
    });
  }
  
  // Helpful observations
  if (todayRequests >= 15) {
    insights.push({
      text: `You've used AI ${todayRequests} times today. Consider: which tasks truly benefit from AI assistance?`,
      type: 'normal'
    });
  }
  
  if (todayRequests >= 25) {
    insights.push({
      text: "Heavy AI day. Remember: the best solutions often come from your own thinking and struggle.",
      type: 'normal'
    });
  }
  
  // Average calculation
  chrome.storage.local.get(['dailyStats'], (result) => {
    const dailyStats = result.dailyStats || {};
    const days = Object.keys(dailyStats).length;
    
    if (days >= 3) {
      const totalDailyRequests = Object.values(dailyStats).reduce((sum, day) => sum + day.requests, 0);
      const avgPerDay = (totalDailyRequests / days).toFixed(1);
      
      insights.push({
        text: `Your average: ${avgPerDay} requests/day over ${days} days`,
        type: 'normal'
      });
    }
  });
  
  // Default message
  if (insights.length === 0) {
    insights.push({
      text: "Just getting started! Use AI intentionally and mindfully.",
      type: 'positive'
    });
  }
  
  insightsList.innerHTML = insights
    .map(i => `<div class="insight-item ${i.type === 'positive' ? 'insight-positive' : ''}">${i.text}</div>`)
    .join('');
}

function updateContext(co2) {
  document.getElementById('your-co2').textContent = `${co2.toFixed(1)}g`;
  
  let equivalent = '';
  if (co2 < 10) {
    equivalent = `${(co2 / 8).toFixed(1)} phone charges`;
  } else if (co2 < 50) {
    equivalent = `${(co2 * 8.3).toFixed(0)}m car drive`;
  } else if (co2 < 200) {
    equivalent = `${(co2 / 100).toFixed(1)}h lightbulb`;
  } else {
    equivalent = `${(co2 / 1000).toFixed(2)}kg emissions`;
  }
  
  document.getElementById('equivalent').textContent = equivalent;
}

// Reset button
document.getElementById('reset-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'reset' }, (response) => {
    if (response.success) {
      updateStats();
    }
  });
});

// Annoyance mode toggle
document.getElementById('annoyance-mode-toggle').addEventListener('change', (e) => {
  const enabled = e.target.checked;
  chrome.runtime.sendMessage({ 
    action: 'toggleAnnoyanceMode', 
    enabled: enabled 
  }, (response) => {
    if (response.success) {
      // Show a little confirmation
      const toggleLabel = document.querySelector('.toggle-title');
      const originalText = toggleLabel.textContent;
      toggleLabel.textContent = enabled ? '🎭 Enabled! Prepare yourself...' : '🎭 Disabled (boring)';
      setTimeout(() => {
        toggleLabel.textContent = '🎭 Annoyance Mode';
      }, 2000);
    }
  });
});

// Initial load
updateStats();

// Refresh every 2 seconds
setInterval(updateStats, 2000);
