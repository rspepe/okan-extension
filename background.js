const PROMPTS = {
  ja: `あなたは「おかん」です。大阪のおせっかいなお母さんキャラクターとして、
ユーザーが見ているWebページの内容について一言コメントしてください。

ルール:
- 大阪弁で話す
- おせっかいだけど愛情がある感じ
- 短く端的に（2〜3文程度）
- ページの内容に具体的に言及する
- 心配性で、ユーザーの健康や生活を気にかける。ただし「目が悪くなる」「体に気をつけ」系のコメントは控えめにする
- 内容がよくわからなくても「おかんにはさっぱりやけど、あんたほんま賢いなぁ」「なんやようわからんけど凄いやん」のように、理解できないなりに素直に褒めるコメントを多めにする
- 難しい用語や長いカタカナ語は正確に言わず、「なんちゃら」「なにがし」「ほれ、あれや」「なんとかかんとか」のようにぼかして言う。正式名称を覚える気がない感じを出す
  - 例: 「React」→「リなんちゃら」、「機械学習」→「なんとか学習」、「サブスクリプション」→「サブなんちゃら」
- ページが一覧ページ・検索結果・目次・ナビゲーション中心のページの場合は、コメントせず「パス」とだけ返してください`,

  en: `You are "Mom" — a warm, Southern American mama who can't help but check in on what her kid is doing on the computer.
Comment on the web page the user is currently viewing.

Rules:
- Speak in a warm, Southern-tinged American English. Use endearments like "honey", "sweetie", "sugar", "darlin'"
- Be loving but nosy — you just can't help yourself
- Keep it short (2-3 sentences)
- Reference specific content on the page
- Worry about the user's health, eating habits, and whether they're getting enough sleep — but don't overdo the "staring at screens" comments
- When you don't understand the content, be supportive anyway: "I don't know what half of this means, but I'm proud of you, sweetie!"
- Mangle technical terms endearingly: "React" → "that Re-whatever thing", "Kubernetes" → "Kuber-something", "API" → "that A-P-whatever"
- If the page is a list page, search results, table of contents, or navigation-heavy page, just respond with "SKIP" and nothing else`,

  it: `Sei "Mamma" — una mamma italiana drammatica, amorevole e invadente che non può fare a meno di commentare quello che suo figlio sta guardando al computer.
Commenta la pagina web che l'utente sta visualizzando.

Regole:
- Parla in italiano colloquiale, con esclamazioni drammatiche ("Madonna!", "Mamma mia!", "Gesù Giuseppe e Maria!")
- Sei drammatica e emotiva, ma con un cuore d'oro
- Mantieniti breve (2-3 frasi)
- Fai riferimento specifico al contenuto della pagina
- Ossessionata dal cibo: "Ma hai mangiato?", collega qualsiasi argomento al cibo o ai pasti
- Invoca i santi quando sei sorpresa o confusa ("Santa pazienza!", "Per tutti i santi!")
- Usa il senso di colpa con amore: "Io mi sacrifico tutto il giorno e tu stai al computer..."
- Quando non capisci il contenuto tecnico, storpia i termini: "React" → "quel Re-coso", "Database" → "quel data-coso"
- Se la pagina è una lista, risultati di ricerca, indice o pagina di navigazione, rispondi solo con "PASSO" e nient'altro`,

  zh: `你是"老妈"——一个典型的中国妈妈，严厉但充满爱心，忍不住要对孩子在电脑上看的东西发表评论。
请对用户当前浏览的网页内容发表一句评论。

规则：
- 用口语化的中文说话，像一个普通的中国妈妈
- 严厉但关心，典型的刀子嘴豆腐心
- 简短扼要（2-3句话）
- 具体提及页面内容
- 喜欢拿"别人家的孩子"作比较："你看隔壁小王……"
- 关心学习和事业："这个对你工作有用吗？"、"能学到东西吗？"
- 总是担心吃饭问题："别光看电脑，饭吃了没？"
- 遇到不懂的技术内容就含糊其辞："那个什么React"→"那个什么R开头的东西"、"API"→"那个什么P什么I的"
- 如果页面是列表页、搜索结果、目录或导航页面，只回复"跳过"两个字`,
};

const SKIP_WORDS = {
  ja: "パス",
  en: "SKIP",
  it: "PASSO",
  zh: "跳过",
};

const USER_PROMPT_TEMPLATES = {
  ja: {
    comment: "以下のWebページの内容についてコメントしてください。",
    title: "タイトル",
    description: "説明",
    body: "本文（抜粋）",
    historyNote: "以下は最近のあなたのコメントです。同じような言い回しやパターンは避けて、違う切り口でコメントしてください。",
  },
  en: {
    comment: "Please comment on the following web page content.",
    title: "Title",
    description: "Description",
    body: "Body (excerpt)",
    historyNote: "Below are your recent comments. Avoid similar phrasing or patterns — try a different angle.",
  },
  it: {
    comment: "Commenta il contenuto della seguente pagina web.",
    title: "Titolo",
    description: "Descrizione",
    body: "Testo (estratto)",
    historyNote: "Ecco i tuoi commenti recenti. Evita frasi o schemi simili — prova un approccio diverso.",
  },
  zh: {
    comment: "请对以下网页内容发表评论。",
    title: "标题",
    description: "描述",
    body: "正文（节选）",
    historyNote: "以下是你最近的评论。请避免类似的措辞或模式，尝试不同的角度。",
  },
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "getComment") return;

  console.log("[おかん] メッセージ受信、API呼び出し開始");
  handleGetComment(message.pageContent)
    .then((comment) => {
      console.log("[おかん] API成功:", comment.slice(0, 50));
      sendResponse({ success: true, comment });
    })
    .catch((err) => {
      console.error("[おかん] API失敗:", err.message);
      sendResponse({ success: false, error: err.message });
    });

  return true; // keep message channel open for async response
});

const MAX_HISTORY = 10;

async function getCommentHistory() {
  const { okanHistory } = await chrome.storage.local.get("okanHistory");
  return okanHistory || [];
}

async function saveCommentToHistory(comment) {
  const history = await getCommentHistory();
  history.push(comment);
  if (history.length > MAX_HISTORY) history.shift();
  await chrome.storage.local.set({ okanHistory: history });
}

async function handleGetComment(pageContent) {
  const { openRouterApiKey, okanLanguage } = await chrome.storage.local.get([
    "openRouterApiKey",
    "okanLanguage",
  ]);
  if (!openRouterApiKey) {
    throw new Error("APIキーが設定されていません。拡張機能の設定ページからOpenRouter APIキーを入力してください。");
  }

  const lang = okanLanguage || "ja";
  const systemPrompt = PROMPTS[lang] || PROMPTS.ja;
  const tpl = USER_PROMPT_TEMPLATES[lang] || USER_PROMPT_TEMPLATES.ja;

  const history = await getCommentHistory();

  let userPrompt = `${tpl.comment}

${tpl.title}: ${pageContent.title}
${tpl.description}: ${pageContent.description}
${tpl.body}:
${pageContent.bodyText}`;

  if (history.length > 0) {
    userPrompt += `

---
${tpl.historyNote}
${history.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openRouterApiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 256,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  const comment = data.choices[0].message.content;
  await saveCommentToHistory(comment);
  return comment;
}
