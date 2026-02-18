# Okan - The Strongest, Kindest Mom on the Internet

**Okan** is a Chrome extension that gives you a loving, opinionated mother who comments on every web page you visit. She's tough, she's warm, and she always has something to say.

Whether she's a fast-talking Osaka mom, a sweet Southern American mama, a dramatic Italian mamma, or a no-nonsense Chinese mother — Okan watches over your browsing with tough love and a warm heart.

## Features

- Automatically reads the page you're viewing and delivers a short, heartfelt comment from Mom
- **4 languages, 4 personalities:**
  - **Japanese** — 大阪のおかん: Osaka dialect, nosy, loving, mangles technical terms
  - **English** — American Mom: Southern charm, "honey" and "sweetie", proud of you no matter what
  - **Italian** — Mamma Italiana: Dramatic, food-obsessed, invokes saints, guilt-trips with love
  - **Chinese** — 中国妈妈: Tough love, compares you to the neighbor's kid, always asks if you've eaten
- Skips list pages, search results, and navigation-heavy pages automatically
- Avoids repeating the same comment patterns
- Cute speech bubble UI that stays out of your way

## Setup

1. Install the extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked)
2. Open the extension's **Options** page
3. Enter your [OpenRouter](https://openrouter.ai/) API key
4. Choose your preferred language
5. Browse the web and let Mom do her thing

## How It Works

Okan uses the OpenRouter API (Gemini 2.5 Flash) to generate short, in-character comments based on the page content. The system prompt defines each mother's personality, speech patterns, and quirks. Comments are stored locally to avoid repetition.

## Files

```
manifest.json    — Chrome extension manifest (MV3)
background.js    — Service worker: prompt definitions, API calls
content.js       — Content script: page extraction, bubble UI
content.css      — Bubble positioning
options.html     — Settings page
options.js       — Settings logic (API key + language)
options.css      — Settings page styles
icons/           — Extension icons (16/48/128px)
```

## Requirements

- Chrome (or Chromium-based browser)
- [OpenRouter](https://openrouter.ai/) API key

## License

MIT
