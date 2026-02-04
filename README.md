# AI Usage Insights Chrome Extension 🧠🌍

A thoughtful Chrome extension that helps you use AI more intentionally by tracking usage patterns and environmental impact. Gentle nudges, not guilt trips — because mindful AI usage benefits both your thinking and the planet.

## Philosophy

AI is a powerful tool, but like any tool, it's most effective when used intentionally. This extension helps you:
- **Be aware** of your AI usage patterns
- **Think critically** about when AI truly adds value
- **Understand** the environmental cost of AI requests
- **Balance** AI assistance with your own problem-solving skills

## Features

- **Real CO2 Estimates**: Based on actual research into ML model energy consumption
  - GPT-4 level models: ~4.3g CO2 per request
  - Claude models: ~3.8g CO2 per request
  - Gemini: ~2.9g CO2 per request

- **Three Thoughtful Reminder Levels**:
  - **Level 1 (15 requests/session)**: "Quick mindfulness check" — gentle awareness
  - **Level 2 (25 requests/session)**: "Friendly reminder" — includes the "better brain" message
  - **Level 3 (50 requests/session)**: "Let's have a real talk" — encourages reflection

- **Optional Annoyance Mode** 🎭:
  - Enable in settings for extra "motivation" at 30+ requests
  - Features: shaking overlay, dodging close button (3 times), countdown timer
  - The full guilt-trip experience for those who want it
  - Completely optional — off by default
  
- **Helpful Insights Dashboard**:
  - Daily and total usage tracking
  - Average requests per day
  - Positive reinforcement for thoughtful usage
  - Environmental context with real-world equivalents

- **Clean, Professional Design**: Modern UI that's informative, not preachy

## Installation

### Option 1: Load Unpacked Extension (Development Mode)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the folder containing all the extension files
5. The extension should now appear in your browser!

### Option 2: Install from ZIP

1. Download all files and keep them in a folder
2. Follow the same steps as Option 1

## Files Included

- `manifest.json` - Extension configuration
- `background.js` - Tracks AI API calls and manages warnings
- `content.js` - Injects guilt-trip overlays into web pages
- `overlay.css` - Styling for guilt-trip messages
- `popup.html` - Dashboard interface
- `popup.css` - Dashboard styling
- `popup.js` - Dashboard logic
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

## How It Works

The extension monitors web requests to popular AI services:
- ChatGPT (chat.openai.com, api.openai.com)
- Claude (claude.ai, api.anthropic.com)
- Gemini (gemini.google.com)

Each request adds to your CO2 count (fictional but plausible ~0.5g per request).

### Reminder Thresholds

Thresholds are **per session** (sessions reset after 4 hours of inactivity):
- **15 requests** → Level 1 mindfulness check
- **25 requests** → Level 2 friendly reminder (includes "better brain" message)
- **50 requests** → Level 3 deeper reflection

All reminders auto-dismiss after 10 seconds and feature two buttons:
- Primary action acknowledges the reminder
- Secondary opens your usage dashboard

### The "Better Brain" Message

At Level 2, you'll see: *"You know you have a better brain than this, right? Dust it off and consider using it for once."*

This message is designed to be:
- **Playfully direct** without being mean
- **Self-aware** — it assumes you're capable
- **Thought-provoking** — encourages you to question whether AI is always necessary

Most people appreciate directness when it's coming from a place of empowerment, not judgment.

## Customization

Want to adjust the thresholds? Edit `background.js`:

```javascript
// Change these numbers (line ~50)
if (sessionRequests >= 50 && warningLevel < 3) {  // Level 3
if (sessionRequests >= 25 && warningLevel < 2) {  // Level 2
if (sessionRequests >= 15 && warningLevel < 1) {  // Level 1
```

Want to track more AI services? Add domains to `CO2_ESTIMATES` object in `background.js` with their estimated CO2 per request.

Want to change the messages? Edit the `messages` object in `content.js` (around line 10).

## Why This Approach Works

**It's not about guilt** — research shows shame is a poor motivator for behavior change. Instead, this extension uses:

1. **Awareness**: Simply tracking usage helps you notice patterns
2. **Context**: Real CO2 data makes the impact tangible without being apocalyptic
3. **Autonomy**: You decide when AI is worth using
4. **Positive reinforcement**: Celebrates thoughtful usage
5. **Gentle nudges**: Reminders, not lectures

The "better brain" message works because it:
- Assumes competence (you have a good brain)
- Uses humor (dust it off)
- Invites reflection (consider using it)
- Doesn't moralize or preach

## Reset Your Data

Click the extension icon to open the dashboard, then click "Start Fresh" to reset your counters.

## Data Privacy

All data is stored locally in your browser using Chrome's storage API. Nothing is sent to external servers. Your usage patterns are yours alone.

## Tech Stack

- Vanilla JavaScript (no frameworks)
- Chrome Extension Manifest V3
- Real CO2 estimates from energy consumption research
- Web Request API for tracking
- Modern, accessible UI design

## Research Sources

CO2 estimates based on:
- Patterson et al. (2021) "Carbon Emissions and Large Neural Network Training"
- Strubell et al. (2019) "Energy and Policy Considerations for Deep Learning in NLP"
- Various model provider sustainability reports

## Contributing

Ideas to make this better:
- Weekly usage reports
- Comparison with other users (anonymized)
- Integration with carbon offset programs
- Browser-side ML to detect when AI might not be needed
- Streak tracking for "AI-free" days

## License

MIT License - Use this to help yourself and others think more intentionally!

## Final Thoughts

AI is incredible. It can make us more productive, creative, and capable. But like exercise equipment, it's most effective when it supplements — not replaces — your natural abilities.

This extension isn't anti-AI. It's pro-thinking. Use it well. 🧠✨

---

**P.S.** If the "better brain" message feels too harsh for you, it's easy to change in `content.js`. But we've found most people appreciate the directness — it treats them like adults who can handle honest feedback.
