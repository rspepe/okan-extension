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
- **4 AI services supported:** OpenRouter, Anthropic, OpenAI, Google Gemini — pick your provider
- Displays the model name and token count used in the speech bubble header
- Skips list pages, search results, and navigation-heavy pages automatically
- Avoids repeating the same comment patterns
- Cute speech bubble UI that stays out of your way

## Setup

1. Install the extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked)
2. Open the extension's **Options** page
3. Select your preferred **AI Service** (OpenRouter, Anthropic, OpenAI, or Gemini)
4. Enter the corresponding API key
5. Choose a model and your preferred language
6. Browse the web and let Mom do her thing

## AI Services

| Service | Where to get a key | Default model |
|---|---|---|
| [OpenRouter](https://openrouter.ai/) | openrouter.ai | Gemini 2.5 Flash |
| [Anthropic](https://console.anthropic.com/) | console.anthropic.com | Claude Sonnet 4.6 |
| [OpenAI](https://platform.openai.com/) | platform.openai.com | GPT-5.2 |
| [Google Gemini](https://aistudio.google.com/) | aistudio.google.com | Gemini 2.5 Flash |

After saving your API key, Okan attempts to fetch the live model list for your chosen service and updates the model dropdown automatically.

## How It Works

Okan reads the title, description, and body text of the page you're viewing, sends it to your chosen AI service, and displays the response as a speech bubble in the corner of the screen. The system prompt defines each mother's personality, speech patterns, and quirks. Recent comments are stored locally to avoid repetition.

## Files

```
manifest.json    — Chrome extension manifest (MV3)
background.js    — Service worker: prompt definitions, multi-service API routing
content.js       — Content script: page extraction, bubble UI (shows model + token count)
content.css      — Bubble positioning
options.html     — Settings page
options.js       — Settings logic (service selection, API keys, model picker)
options.css      — Settings page styles
icons/           — Extension icons (16/48/128px)
```

## Requirements

- Chrome (or Chromium-based browser)
- API key for at least one supported AI service

## License

MIT
