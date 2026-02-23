(() => {
  const MAX_BODY_LENGTH = 3000;
  const WAIT_MS = 1500; // ページ描画完了を待つ

  const EXCLUDED_DOMAINS = [
    "*.google.com",
    "chatgpt.com",
    "claude.ai",
    "*.cloudflare.com",
  ];

  const LOADING_MESSAGES = {
    ja: [
      "おかんが振り向いてきました",
      "おかんが何か喋りたそうにしている",
      "おかんが食器洗いの手を止めました",
      "おかんが階段を上がってくる音がする",
      "おかんが階段を降りてくる音がする",
      "おかんが準備運動を始めました",
      "おかんが喉を鳴らしました",
      "おかんがテレビを消しました",
      "おかんがドアをノックしています",
    ],
    en: [
      "Mom just looked up from her crossword",
      "Mom is putting down her coffee mug",
      "You can hear Mom's slippers in the hallway",
      "Mom stopped folding laundry",
      "Mom is adjusting her reading glasses",
      "Mom just turned off the TV",
      "Mom is clearing her throat",
      "Mom is coming up the stairs",
      "Mom is knocking on your door",
    ],
    it: [
      "Mamma ha spento i fornelli",
      "Mamma si sta asciugando le mani col grembiule",
      "Si sentono i passi di Mamma nel corridoio",
      "Mamma ha posato il mestolo",
      "Mamma si sta facendo il segno della croce",
      "Mamma ha spento la TV",
      "Mamma sta bussando alla porta",
      "Mamma sta salendo le scale",
      "Mamma ha qualcosa da dire...",
    ],
    zh: [
      "老妈放下了手里的拖把",
      "老妈从厨房探出头来了",
      "听到老妈的拖鞋声越来越近",
      "老妈关掉了电视",
      "老妈正在走上楼梯",
      "老妈清了清嗓子",
      "老妈正在敲你的门",
      "老妈停下了手里的活",
      "老妈好像有话要说",
    ],
  };

  const UI_STRINGS = {
    ja: { label: "おかんより", close: "閉じる", error: "APIキー設定してへんやん！拡張機能の設定から入れてな！", skipWord: "パス" },
    en: { label: "From Mom", close: "Close", error: "You haven't set your API key yet, honey! Go to the extension settings and pop it in!", skipWord: "SKIP" },
    it: { label: "Da Mamma", close: "Chiudi", error: "Non hai messo la chiave API! Vai nelle impostazioni e inseriscila!", skipWord: "PASSO" },
    zh: { label: "老妈说", close: "关闭", error: "API密钥还没设置呢！去扩展设置里填上！", skipWord: "跳过" },
  };

  function isExcludedDomain() {
    const host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true; // IPv4
    if (host.startsWith("[")) return true; // IPv6
    return EXCLUDED_DOMAINS.some((pattern) => {
      if (pattern.startsWith("*.")) {
        const suffix = pattern.slice(1); // ".gmo.jp"
        return host === pattern.slice(2) || host.endsWith(suffix);
      }
      return host === pattern;
    });
  }

  function extractPageContent() {
    const title = document.title || "";
    const descMeta = document.querySelector('meta[name="description"]');
    const description = descMeta ? descMeta.getAttribute("content") || "" : "";
    const bodyText = (document.body.innerText || "").slice(0, MAX_BODY_LENGTH);
    return { title, description, bodyText };
  }


  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createUI(strings, lang) {
    const host = document.createElement("div");
    host.id = "okan-extension-root";
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      .okan-bubble {
        background: #fff;
        border: 2px solid #e8734a;
        border-radius: 16px;
        padding: 16px 20px;
        max-width: 320px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        line-height: 1.7;
        color: #333;
        position: relative;
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        font-family: "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
      }
      .okan-bubble.visible {
        transform: translateY(0);
        opacity: 1;
      }
      .okan-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .okan-label {
        font-weight: bold;
        color: #e8734a;
        font-size: 13px;
      }
      .okan-close {
        background: none;
        border: none;
        font-size: 18px;
        color: #999;
        cursor: pointer;
        padding: 0 0 0 8px;
        line-height: 1;
      }
      .okan-close:hover {
        color: #333;
      }
      .okan-text {
        margin: 0;
        white-space: pre-wrap;
      }
      .okan-loading {
        color: #999;
        font-size: 13px;
      }
      .okan-meta {
        font-size: 11px;
        color: #aaa;
        margin-left: 6px;
        flex: 1;
      }
    `;
    shadow.appendChild(style);

    const messages = LOADING_MESSAGES[lang] || LOADING_MESSAGES.ja;
    const firstMessage = pickRandom(messages);

    const bubble = document.createElement("div");
    bubble.className = "okan-bubble";
    bubble.innerHTML = `
      <div class="okan-header">
        <span class="okan-label">${strings.label}</span>
        <span class="okan-meta" hidden></span>
        <button class="okan-close" aria-label="${strings.close}">&times;</button>
      </div>
      <p class="okan-text okan-loading">${firstMessage}</p>
    `;
    shadow.appendChild(bubble);

    // Cycle loading messages
    const loadingEl = shadow.querySelector(".okan-text");
    let prev = firstMessage;
    const loadingTimer = setInterval(() => {
      let next;
      do { next = pickRandom(messages); } while (next === prev && messages.length > 1);
      prev = next;
      loadingEl.textContent = next;
    }, 2500);

    // Slide in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bubble.classList.add("visible");
      });
    });

    shadow.querySelector(".okan-close").addEventListener("click", () => {
      clearInterval(loadingTimer);
      bubble.classList.remove("visible");
      setTimeout(() => host.remove(), 300);
    });

    return {
      setResult(text, model, tokensUsed) {
        clearInterval(loadingTimer);
        const p = shadow.querySelector(".okan-text");
        p.classList.remove("okan-loading");
        p.textContent = text;
        if (model) {
          const meta = shadow.querySelector(".okan-meta");
          meta.textContent = `${model}  •  ${tokensUsed} tokens`;
          meta.hidden = false;
        }
      },
      remove() {
        clearInterval(loadingTimer);
        bubble.classList.remove("visible");
        setTimeout(() => host.remove(), 300);
      },
    };
  }

  // --- メインロジック ---

  let pendingTimer = null;
  let currentUI = null;

  function removeCurrentUI() {
    if (currentUI) {
      currentUI.remove();
      currentUI = null;
    }
  }

  function run() {
    // 前回のタイマー・UIをクリーンアップ
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
    removeCurrentUI();

    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      const pageContent = extractPageContent();

      // Skip near-empty pages
      if (!pageContent.title && pageContent.bodyText.trim().length < 50) return;

      // 言語設定を取得してからメッセージ送信
      chrome.storage.local.get("okanLanguage", (langData) => {
        const lang = langData.okanLanguage || "ja";
        const strings = UI_STRINGS[lang] || UI_STRINGS.ja;

        const ui = createUI(strings, lang);
        currentUI = ui;

        chrome.runtime.sendMessage(
          { type: "getComment", pageContent },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("[おかん] runtime.lastError:", chrome.runtime.lastError.message);
              ui.remove();
              currentUI = null;
              return;
            }
            if (!response || !response.success) {
              const errMsg = response?.error || "不明なエラー";
              console.error("[おかん] response error:", errMsg);
              if (errMsg.includes("APIキーが設定されていません")) {
                ui.setResult(strings.error);
              } else {
                ui.remove();
                currentUI = null;
              }
              return;
            }
            // LLMがスキップワードを返した場合はUI表示しない
            if (response.comment.trim() === strings.skipWord) {
              console.log("[おかん] LLMがパス判定、スキップ");
              ui.remove();
              currentUI = null;
              return;
            }
            ui.setResult(response.comment, response.model, response.tokensUsed);
          }
        );
      });
    }, WAIT_MS);
  }

  // --- SPA対応: pushState / replaceState / popstate を監視 ---

  let lastUrl = location.href;

  function onUrlChange() {
    const current = location.href;
    if (current === lastUrl) return;
    lastUrl = current;
    console.log("[おかん] SPA遷移を検知:", current);
    run();
  }

  // history.pushState / replaceState をフック
  const origPushState = history.pushState;
  history.pushState = function (...args) {
    origPushState.apply(this, args);
    onUrlChange();
  };

  const origReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    onUrlChange();
  };

  // ブラウザの戻る・進む
  window.addEventListener("popstate", onUrlChange);

  // 除外ドメインチェック（待たずに即判定）
  if (isExcludedDomain()) return;

  // 初回実行
  run();
})();
