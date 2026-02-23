const MODEL_DEFAULTS = {
  openrouter: [
    { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { id: "openai/gpt-4o", label: "GPT-4o" },
    { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  ],
  anthropic: [
    { id: "claude-opus-4-6", label: "Claude Opus 4.6" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    { id: "claude-opus-4-5", label: "Claude Opus 4.5" },
    { id: "claude-sonnet-4-5-20251022", label: "Claude Sonnet 4.5" },
  ],
  openai: [
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gpt-5", label: "GPT-5" },
    { id: "gpt-5-mini", label: "GPT-5 Mini" },
    { id: "gpt-5-nano", label: "GPT-5 Nano" },
    { id: "o3-mini", label: "o3-mini" },
  ],
  gemini: [
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Preview)" },
    { id: "gemini-3-flash-preview", label: "Gemini 3 Flash (Preview)" },
  ],
};

const ALL_STORAGE_KEYS = [
  "aiService",
  "openRouterApiKey",
  "anthropicApiKey",
  "openAIApiKey",
  "geminiApiKey",
  "openRouterModel",
  "anthropicModel",
  "openAIModel",
  "geminiModel",
  "okanLanguage",
];

const MODEL_KEY_FOR = {
  openrouter: "openRouterModel",
  anthropic: "anthropicModel",
  openai: "openAIModel",
  gemini: "geminiModel",
};

document.addEventListener("DOMContentLoaded", () => {
  const aiServiceSelect = document.getElementById("aiService");
  const modelSelect = document.getElementById("modelSelect");
  const languageSelect = document.getElementById("language");
  const saveButton = document.getElementById("save");
  const statusEl = document.getElementById("status");

  // Load all saved values
  chrome.storage.local.get(ALL_STORAGE_KEYS, (data) => {
    const service = data.aiService || "openrouter";
    aiServiceSelect.value = service;

    if (data.openRouterApiKey) document.getElementById("openRouterApiKey").value = data.openRouterApiKey;
    if (data.anthropicApiKey)  document.getElementById("anthropicApiKey").value  = data.anthropicApiKey;
    if (data.openAIApiKey)     document.getElementById("openAIApiKey").value     = data.openAIApiKey;
    if (data.geminiApiKey)     document.getElementById("geminiApiKey").value     = data.geminiApiKey;

    if (data.okanLanguage) languageSelect.value = data.okanLanguage;

    showServiceSection(service);
    populateModelDropdown(service, data[MODEL_KEY_FOR[service]] || null);
  });

  // Service selection change
  aiServiceSelect.addEventListener("change", () => {
    const service = aiServiceSelect.value;
    showServiceSection(service);
    chrome.storage.local.get(MODEL_KEY_FOR[service], (data) => {
      populateModelDropdown(service, data[MODEL_KEY_FOR[service]] || null);
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const storageKey = btn.dataset.key;
      const fieldId = btn.dataset.field;
      chrome.storage.local.remove(storageKey, () => {
        document.getElementById(fieldId).value = "";
        showStatus("API key deleted.", "success");
      });
    });
  });

  // Save button
  saveButton.addEventListener("click", () => {
    const service = aiServiceSelect.value;
    const apiKeyFieldId = {
      openrouter: "openRouterApiKey",
      anthropic: "anthropicApiKey",
      openai: "openAIApiKey",
      gemini: "geminiApiKey",
    }[service];

    const apiKey = document.getElementById(apiKeyFieldId).value.trim();
    if (!apiKey) {
      showStatus("Please enter an API key.", "error");
      return;
    }

    const selectedModel = modelSelect.value;
    const modelStorageKey = MODEL_KEY_FOR[service];
    const language = languageSelect.value;

    const toSave = {
      aiService: service,
      okanLanguage: language,
      [apiKeyFieldId]: apiKey,
      [modelStorageKey]: selectedModel,
    };

    chrome.storage.local.set(toSave, () => {
      showStatus("Saved!", "success");
      // Attempt to fetch live model list after saving
      fetchModels(service, apiKey).then((models) => {
        if (models && models.length > 0) {
          populateModelDropdown(service, selectedModel, models);
          chrome.storage.local.set({ [modelStorageKey]: modelSelect.value });
        }
      }).catch(() => { /* keep defaults */ });
    });
  });

  function showServiceSection(service) {
    ["openrouter", "anthropic", "openai", "gemini"].forEach((s) => {
      const el = document.getElementById(`section-${s}`);
      if (el) el.hidden = s !== service;
    });
  }

  function populateModelDropdown(service, savedModel, models) {
    const list = models || MODEL_DEFAULTS[service] || [];
    modelSelect.innerHTML = "";
    list.forEach(({ id, label }) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = label;
      modelSelect.appendChild(opt);
    });
    if (savedModel && list.some((m) => m.id === savedModel)) {
      modelSelect.value = savedModel;
    }
  }

  async function fetchModels(service, apiKey) {
    if (service === "anthropic") return null; // No public list endpoint

    if (service === "openrouter") {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error("openrouter models fetch failed");
      const data = await res.json();
      return data.data.slice(0, 20).map((m) => ({ id: m.id, label: m.name || m.id }));
    }

    if (service === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error("openai models fetch failed");
      const data = await res.json();
      const filtered = data.data
        .filter((m) => /^(gpt-|o1|o3)/.test(m.id))
        .sort((a, b) => b.created - a.created)
        .slice(0, 10)
        .map((m) => ({ id: m.id, label: m.id }));
      return filtered;
    }

    if (service === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
      );
      if (!res.ok) throw new Error("gemini models fetch failed");
      const data = await res.json();
      const filtered = (data.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
        .slice(0, 10)
        .map((m) => {
          const id = m.name.replace("models/", "");
          return { id, label: m.displayName || id };
        });
      return filtered;
    }

    return null;
  }

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.hidden = false;
    setTimeout(() => { statusEl.hidden = true; }, 3000);
  }
});
