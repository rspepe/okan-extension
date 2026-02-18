document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const languageSelect = document.getElementById("language");
  const saveButton = document.getElementById("save");
  const statusEl = document.getElementById("status");

  chrome.storage.local.get(["openRouterApiKey", "okanLanguage"], (data) => {
    if (data.openRouterApiKey) {
      apiKeyInput.value = data.openRouterApiKey;
    }
    if (data.okanLanguage) {
      languageSelect.value = data.okanLanguage;
    }
  });

  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showStatus("Please enter an API key.", "error");
      return;
    }
    const language = languageSelect.value;
    chrome.storage.local.set({ openRouterApiKey: apiKey, okanLanguage: language }, () => {
      showStatus("Saved!", "success");
    });
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.hidden = false;
    setTimeout(() => {
      statusEl.hidden = true;
    }, 3000);
  }
});
