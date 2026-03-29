(function () {
  const form = document.getElementById("input-form");
  const outputs = {
    comicManuscriptPost: document.getElementById("comic-manuscript-post-output"),
    comicRagDebug: document.getElementById("comic-rag-debug-output"),
    comicTitle: document.getElementById("comic-title-output"),
    comic: document.getElementById("comic-output"),
    comicBubbleScript8: document.getElementById("comic-bubble-script-8-output"),
    comicBubblePlacement8: document.getElementById("comic-bubble-placement-8-output"),
    comicPrompt: document.getElementById("comic-prompt-output"),
    comicUnifiedPrompt: document.getElementById("comic-unified-prompt-output"),
    noteIntroAssist: document.getElementById("note-intro-assist-output"),
    noteClosingAssist: document.getElementById("note-closing-assist-output"),
    comicEpisodeSummary: document.getElementById("comic-episode-summary-output"),
    noteTitleSuggestions: document.getElementById("note-title-suggestions-output"),
    noteBodyOnly: document.getElementById("note-body-only-output"),
    notePrePublishCheck: document.getElementById("note-prepublish-check-output"),
    note: document.getElementById("note-output"),
    kindle: document.getElementById("kindle-output"),
    kindleChapter: document.getElementById("kindle-chapter-output"),
    kindleBook: document.getElementById("kindle-book-output"),
    kindleDraftOutline: document.getElementById("kindle-draft-output"),
    kindleChapterDrafts: document.getElementById("kindle-chapter-drafts-output"),
    kindleFullDraft: document.getElementById("kindle-full-draft-output"),
    kindleManuscript: document.getElementById("kindle-manuscript-output"),
  };
  const chapterEpisodesField = document.getElementById("chapter-episodes");
  const detailedInputEl = document.getElementById("detailed-input");
  const comicGenPromptDraft = document.getElementById("comic-gen-prompt-draft");
  const comicUnifiedToDraftBtn = document.getElementById("comic-unified-to-draft-btn");
  const comicImageUrlInput = document.getElementById("comic-image-url");
  const comicImageApplyBtn = document.getElementById("comic-image-apply-btn");
  const comicImagePreviewWrap = document.getElementById("comic-image-preview-wrap");
  const comicImagePreview = document.getElementById("comic-image-preview");
  const comicImagePreviewStatus = document.getElementById("comic-image-preview-status");
  const comicImageApiStatus = document.getElementById("comic-image-api-status");
  const comicImageGenerateBtn = document.getElementById("comic-image-generate-btn");
  const comicImageDownloadBtn = document.getElementById("comic-image-download-btn");
  const comicBubbleOverlayCanvas = document.getElementById("comic-bubble-overlay-canvas");
  const comicBubbleOverlayWrap = document.getElementById("comic-bubble-overlay-wrap");
  const comicBubbleOverlayStatus = document.getElementById("comic-bubble-overlay-status");
  const comicBubbleOverlayGenerateBtn = document.getElementById("comic-bubble-overlay-generate-btn");
  const comicBubbleOverlayDownloadBtn = document.getElementById("comic-bubble-overlay-download-btn");

  const COMIC_IMAGE_DOWNLOAD_FILENAME = "comic-8panel.png";
  const COMIC_BUBBLE_OVERLAY_DOWNLOAD_FILENAME = "comic-8panel-with-bubbles.png";

  const COMIC_PREVIEW_STATUS_IDLE =
    "URL または data URL を入力し、「画像を表示」を押すか、入力欄で Ctrl+Enter（Mac は ⌘+Enter）で反映できます。";
  const COMIC_PREVIEW_STATUS_LOADING = "読み込み中…";
  const OUTPUT_PLACEHOLDER = "ここに生成結果が表示されます。";
  /* 将来APIの戻り（data URL 1本）を試す用: 1×1 PNG */
  const COMIC_IMAGE_DUMMY_1PX_PNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X9Z8kAAAAASUVORK5CYII=";

  /* 画像生成API（1箇所で差し替え）。ローカル既定。本番例: https://your-domain.com/api/comic-image */
  const COMIC_IMAGE_API_CONFIG = {
    url: "http://127.0.0.1:8787/api/comic-image",
  };

  const exampleData = {
    theme: "段取り確認とAI活用",
    incident: "朝礼後、作業の順番解釈が班ごとにずれて手戻りが出た。",
    learning: "着手前に1分だけでも手順を言語化するとズレが減る。",
    characters: "照屋親方、コパイロット、若手職人",
    tone: "少し真面目",
  };

  function compactOneLineMemo(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function stripTrailPunct(s) {
    return (s || "").replace(/[。！？!?]+$/, "").trim();
  }

  /** 題名向けに短くする（長いときだけ …） */
  function shortenTitleLike(s, maxLen) {
    const t = stripTrailPunct(compactOneLineMemo(s));
    if (!t) {
      return "";
    }
    if (t.length <= maxLen) {
      return t;
    }
    return t.slice(0, maxLen - 1) + "…";
  }

  /** 。！？ で区切り（末尾に句読点がない文も1つとして拾う） */
  function splitJapaneseSentences(s) {
    const t = compactOneLineMemo(s);
    if (!t) {
      return [];
    }
    const out = [];
    let buf = "";
    for (let i = 0; i < t.length; i += 1) {
      const ch = t[i];
      buf += ch;
      if (/[。！？!?]/.test(ch)) {
        const piece = buf.trim();
        if (piece) {
          out.push(piece);
        }
        buf = "";
      }
    }
    const tail = buf.trim();
    if (tail) {
      out.push(tail);
    }
    return out.length ? out : [t];
  }

  /** 1分割だけ：文・接続詞で theme / coreMain / coreConclusion を分ける */
  function expandSingleSegmentMemo(single) {
    const full = compactOneLineMemo(single);
    if (!full) {
      return null;
    }
    const sentences = splitJapaneseSentences(full);
    if (sentences.length >= 2) {
      const first = sentences[0];
      const last = sentences[sentences.length - 1];
      if (sentences.length === 2) {
        return {
          theme: shortenTitleLike(first, 36),
          coreMain: first,
          coreConclusion: last,
        };
      }
      const middle = sentences.slice(1, -1).join(" ");
      return {
        theme: shortenTitleLike(first, 36),
        coreMain: middle || first,
        coreConclusion: last,
      };
    }
    const conn = /^(.*?)(?:けど|でも|のに|だから)(.+)$/.exec(full);
    if (conn) {
      const left = compactOneLineMemo(conn[1]);
      const right = compactOneLineMemo(conn[2].replace(/^[、,]\s*/, ""));
      return {
        theme: shortenTitleLike(left || full, 36),
        coreMain: full,
        coreConclusion: right || full,
      };
    }
    return {
      theme: shortenTitleLike(full, 32),
      coreMain: full,
      coreConclusion: "",
    };
  }

  /** 1行メモを theme / coreMain / coreConclusion に展開（空なら null） */
  function expandOneLineMemoParts(line) {
    const raw = compactOneLineMemo(line);
    if (!raw) {
      return null;
    }
    const parts = raw
      .split(/[｜|]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    if (!parts.length) {
      return null;
    }
    if (parts.length >= 3) {
      return {
        theme: parts[0],
        coreMain: parts[1],
        coreConclusion: parts[2],
      };
    }
    if (parts.length === 2) {
      return {
        theme: parts[0],
        coreMain: parts[1],
        coreConclusion: "",
      };
    }
    return expandSingleSegmentMemo(parts[0]);
  }

  function getInputFromForm() {
    const data = new FormData(form);
    const oneLine = compactOneLineMemo(data.get("oneLineMemo"));
    const expanded = oneLine ? expandOneLineMemoParts(oneLine) : null;
    const themeForm = compactOneLineMemo(data.get("theme"));
    const coreMainForm = compactOneLineMemo(data.get("coreMain"));
    const coreConclusionForm = compactOneLineMemo(data.get("coreConclusion"));
    function mergeField(formValue, expandedKey) {
      if (formValue) {
        return formValue;
      }
      if (expanded && expanded[expandedKey]) {
        return expanded[expandedKey];
      }
      return "";
    }
    return {
      theme: mergeField(themeForm, "theme"),
      incident: data.get("incident"),
      learning: data.get("learning"),
      characters: data.get("characters"),
      tone: data.get("tone"),
      outputStyle: data.get("outputStyle"),
      notePreset: data.get("notePreset"),
      noteLengthPreset: data.get("noteLengthPreset"),
      coreMain: mergeField(coreMainForm, "coreMain"),
      corePhrase: data.get("corePhrase"),
      coreConclusion: mergeField(coreConclusionForm, "coreConclusion"),
    };
  }

  function setFormValues(values) {
    Object.keys(values).forEach(function (key) {
      const element = form.elements.namedItem(key);
      if (element) {
        element.value = values[key];
      }
    });
  }

  function renderOutputs(result) {
    resetBubbleOverlayPreview();
    if (outputs.comicManuscriptPost) {
      outputs.comicManuscriptPost.textContent =
        result.comicManuscriptPost != null && result.comicManuscriptPost !== ""
          ? result.comicManuscriptPost
          : OUTPUT_PLACEHOLDER;
    }
    if (outputs.comicRagDebug) {
      outputs.comicRagDebug.textContent =
        result.comicRagDebug != null && result.comicRagDebug !== "" ? result.comicRagDebug : "—";
    }
    if (outputs.comicTitle) {
      outputs.comicTitle.textContent =
        result.comicTitle != null && result.comicTitle !== "" ? result.comicTitle : OUTPUT_PLACEHOLDER;
    }
    outputs.comic.textContent = result.comic;
    if (outputs.comicBubbleScript8) {
      outputs.comicBubbleScript8.textContent =
        result.comicBubbleScript8 != null && result.comicBubbleScript8 !== ""
          ? result.comicBubbleScript8
          : OUTPUT_PLACEHOLDER;
    }
    if (outputs.comicBubblePlacement8) {
      outputs.comicBubblePlacement8.textContent =
        result.comicBubblePlacement8 != null && result.comicBubblePlacement8 !== ""
          ? result.comicBubblePlacement8
          : OUTPUT_PLACEHOLDER;
    }
    if (outputs.comicPrompt) {
      outputs.comicPrompt.textContent = result.comicPrompt || "コマ別描画プロンプトを生成できませんでした。";
    }
    const unifiedText = result.comicUnifiedPrompt || "統合画像プロンプトを生成できませんでした。";
    const unifiedEl = document.getElementById("comic-unified-prompt-output");
    if (unifiedEl) {
      unifiedEl.textContent = unifiedText;
      outputs.comicUnifiedPrompt = unifiedEl;
    }
    if (outputs.noteIntroAssist) {
      outputs.noteIntroAssist.textContent =
        result.noteIntroAssist != null && result.noteIntroAssist !== "" ? result.noteIntroAssist : OUTPUT_PLACEHOLDER;
    }
    if (outputs.noteClosingAssist) {
      outputs.noteClosingAssist.textContent =
        result.noteClosingAssist != null && result.noteClosingAssist !== ""
          ? result.noteClosingAssist
          : OUTPUT_PLACEHOLDER;
    }
    if (outputs.comicEpisodeSummary) {
      outputs.comicEpisodeSummary.textContent =
        result.comicEpisodeSummary != null && result.comicEpisodeSummary !== ""
          ? result.comicEpisodeSummary
          : OUTPUT_PLACEHOLDER;
    }
    outputs.note.textContent = result.note;
    if (outputs.noteBodyOnly) {
      outputs.noteBodyOnly.textContent =
        result.noteBodyOnly != null && result.noteBodyOnly !== "" ? result.noteBodyOnly : OUTPUT_PLACEHOLDER;
    }
    if (outputs.noteTitleSuggestions) {
      outputs.noteTitleSuggestions.textContent =
        result.noteTitleSuggestions != null && result.noteTitleSuggestions !== ""
          ? result.noteTitleSuggestions
          : OUTPUT_PLACEHOLDER;
    }
    if (outputs.notePrePublishCheck) {
      outputs.notePrePublishCheck.textContent =
        result.notePrePublishCheck != null && result.notePrePublishCheck !== ""
          ? result.notePrePublishCheck
          : OUTPUT_PLACEHOLDER;
    }
    updateComicImageReviewPanel();
  }

  function renderKindlePreview(input) {
    if (!outputs.kindle || !window.AIBusouKindleEngine) {
      return;
    }
    outputs.kindle.textContent = window.AIBusouKindleEngine.buildKindleSectionPreview(input);
  }

  function renderKindleChapterPreview(input) {
    if (!outputs.kindleChapter || !window.AIBusouKindleEngine) {
      return;
    }
    outputs.kindleChapter.textContent = window.AIBusouKindleEngine.buildKindleChapterPreview([input]);
  }

  function parseChapterEpisodeInputs(rawText, baseInput) {
    return (rawText || "")
      .split("---")
      .map(function (block) {
        return block.trim();
      })
      .filter(Boolean)
      .map(function (incidentText) {
        return {
          theme: baseInput.theme,
          incident: incidentText,
          learning: baseInput.learning,
          characters: baseInput.characters,
          tone: baseInput.tone,
          outputStyle: baseInput.outputStyle,
          notePreset: baseInput.notePreset,
          noteLengthPreset: baseInput.noteLengthPreset,
          coreMain: baseInput.coreMain,
          corePhrase: baseInput.corePhrase,
          coreConclusion: baseInput.coreConclusion,
        };
      });
  }

  function parseChapterBlocks(rawText) {
    return (rawText || "")
      .split("===")
      .map(function (block) {
        return block.trim();
      })
      .filter(Boolean);
  }

  function parseBookChapterInputs(rawText, baseInput) {
    const chapterBlocks = parseChapterBlocks(rawText);
    return chapterBlocks
      .map(function (chapterBlock) {
        return parseChapterEpisodeInputs(chapterBlock, baseInput);
      })
      .filter(function (chapterEpisodes) {
        return Array.isArray(chapterEpisodes) && chapterEpisodes.length > 0;
      });
  }

  function renderKindleChapterPreviewFromMultiInput(baseInput) {
    if (!outputs.kindleChapter || !window.AIBusouKindleEngine || !chapterEpisodesField) {
      return;
    }
    const rawText = chapterEpisodesField.value || "";
    const chapterBlocks = parseChapterBlocks(rawText);
    const firstChapterBlock = chapterBlocks[0] || "";
    const episodes = parseChapterEpisodeInputs(firstChapterBlock, baseInput);
    if (!episodes.length) {
      outputs.kindleChapter.textContent =
        "章確認用入力が空です。章内は `---`、章区切りは `===` で入力して「章素材を確認」を押してください。";
      return;
    }
    outputs.kindleChapter.textContent = window.AIBusouKindleEngine.buildKindleChapterPreview(episodes);
  }

  function renderKindleBookPreviewFromMultiInput(baseInput) {
    if (!outputs.kindleBook || !window.AIBusouKindleEngine || !chapterEpisodesField) {
      return;
    }
    const rawText = chapterEpisodesField.value || "";
    const chapters = parseBookChapterInputs(rawText, baseInput);
    if (!chapters.length) {
      outputs.kindleBook.textContent =
        "本確認用入力が空です。章内は `---`、章区切りは `===` で入力して「本素材を確認」を押してください。";
      return;
    }
    outputs.kindleBook.textContent = window.AIBusouKindleEngine.buildKindleBookPreview(chapters);
  }

  function renderKindleDraftOutlinePreviewFromMultiInput(baseInput) {
    if (!outputs.kindleDraftOutline || !window.AIBusouKindleEngine || !chapterEpisodesField) {
      return;
    }
    const rawText = chapterEpisodesField.value || "";
    const chapters = parseBookChapterInputs(rawText, baseInput);
    if (!chapters.length) {
      outputs.kindleDraftOutline.textContent =
        "本文骨子確認用入力が空です。章内は `---`、章区切りは `===` で入力して「本文骨子を確認」を押してください。";
      return;
    }
    outputs.kindleDraftOutline.textContent =
      window.AIBusouKindleEngine.buildKindleDraftOutlinePreview(chapters);
  }

  function renderKindleChapterDraftsPreviewFromMultiInput(baseInput) {
    if (!outputs.kindleChapterDrafts || !window.AIBusouKindleEngine || !chapterEpisodesField) {
      return;
    }
    const rawText = chapterEpisodesField.value || "";
    const chapters = parseBookChapterInputs(rawText, baseInput);
    if (!chapters.length) {
      outputs.kindleChapterDrafts.textContent =
        "章本文たたき台確認用入力が空です。章内は `---`、章区切りは `===` で入力して「章本文たたき台を確認」を押してください。";
      return;
    }
    outputs.kindleChapterDrafts.textContent =
      window.AIBusouKindleEngine.buildKindleChapterDraftsPreview(chapters);
  }

  function renderKindleFullDraftPreviewFromMultiInput(baseInput) {
    if (!outputs.kindleFullDraft || !window.AIBusouKindleEngine || !chapterEpisodesField) {
      return;
    }
    const rawText = chapterEpisodesField.value || "";
    const chapters = parseBookChapterInputs(rawText, baseInput);
    if (!chapters.length) {
      outputs.kindleFullDraft.textContent =
        "全体原稿たたき台確認用入力が空です。章内は `---`、章区切りは `===` で入力して「全体原稿たたき台を確認」を押してください。";
      return;
    }
    outputs.kindleFullDraft.textContent =
      window.AIBusouKindleEngine.buildKindleFullDraftPreview(chapters);
  }

  function renderKindleManuscriptPreviewFromMultiInput(baseInput) {
    if (!outputs.kindleManuscript || !window.AIBusouKindleEngine || !chapterEpisodesField) {
      return;
    }
    const rawText = chapterEpisodesField.value || "";
    const chapters = parseBookChapterInputs(rawText, baseInput);
    if (!chapters.length) {
      outputs.kindleManuscript.textContent =
        "完成原稿寄り確認用入力が空です。章内は `---`、章区切りは `===` で入力して「完成原稿寄りを確認」を押してください。";
      return;
    }
    outputs.kindleManuscript.textContent =
      window.AIBusouKindleEngine.buildKindleManuscriptPreview(chapters);
  }

  function transferUnifiedPromptToDraft() {
    if (!outputs.comicUnifiedPrompt || !comicGenPromptDraft) {
      return;
    }
    const text = (outputs.comicUnifiedPrompt.textContent || "").trim();
    if (!text || text === OUTPUT_PLACEHOLDER || text.indexOf("統合画像プロンプトを生成できませんでした") >= 0) {
      window.alert("先に「構成を生成」で統合画像プロンプトを表示してください。");
      return;
    }
    comicGenPromptDraft.value = outputs.comicUnifiedPrompt.textContent || "";
    comicGenPromptDraft.focus();
    updateComicImageReviewPanel();
  }

  function isAllowedComicImageSource(raw) {
    const s = (raw || "").trim();
    if (!s) {
      return false;
    }
    const lower = s.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("vbscript:")) {
      return false;
    }
    if (lower.startsWith("http://") || lower.startsWith("https://")) {
      return true;
    }
    if (lower.startsWith("data:image/")) {
      return true;
    }
    return false;
  }

  /* data URL（推奨）/ https URL 文字列 / { imageSrc } → { ok, imageSrc, reason } */
  function normalizeComicImageResult(raw) {
    if (raw == null) {
      return { ok: false, imageSrc: "", reason: "画像生成結果が空です。" };
    }
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) {
        return { ok: false, imageSrc: "", reason: "画像生成結果が空です。" };
      }
      if (isAllowedComicImageSource(t)) {
        return { ok: true, imageSrc: t };
      }
      return {
        ok: false,
        imageSrc: "",
        reason: "data:image/... または https?:// 形式が必要です（将来APIは data URL 1本推奨）。",
      };
    }
    if (typeof raw === "object" && raw !== null && typeof raw.imageSrc === "string") {
      return normalizeComicImageResult(raw.imageSrc);
    }
    if (typeof raw === "object" && raw !== null && typeof raw.dataUrl === "string") {
      return normalizeComicImageResult(raw.dataUrl);
    }
    return {
      ok: false,
      imageSrc: "",
      reason: "文字列、{ imageSrc }、{ dataUrl } のみ対応しています。",
    };
  }

  function getComicUnifiedPromptText() {
    if (!outputs.comicUnifiedPrompt) {
      return "";
    }
    const t = (outputs.comicUnifiedPrompt.textContent || "").trim();
    if (!t || t === OUTPUT_PLACEHOLDER || t.indexOf("統合画像プロンプトを生成できませんでした") >= 0) {
      return "";
    }
    return outputs.comicUnifiedPrompt.textContent || "";
  }

  function getPromptTextForComicImageApi() {
    const draft = (comicGenPromptDraft && comicGenPromptDraft.value) || "";
    if (draft.trim()) {
      return draft.trim();
    }
    return getComicUnifiedPromptText().trim();
  }

  function formatOutputStyleLabel(v) {
    const s = (v || "").trim();
    if (!s) {
      return "（指定なし・従来どおり）";
    }
    if (s === "note") {
      return "note向け";
    }
    if (s === "comic") {
      return "ネーム向け";
    }
    if (s === "kindle") {
      return "Kindle向け";
    }
    return s;
  }

  function formatNotePresetLabel(v) {
    const s = (v || "").trim();
    if (!s) {
      return "標準";
    }
    if (s === "strong") {
      return "強め";
    }
    if (s === "soft") {
      return "やわらかめ";
    }
    if (s === "biz") {
      return "経営寄り";
    }
    return s;
  }

  function setReviewText(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  }

  function updateComicImageReviewPanel() {
    const input = getInputFromForm();
    setReviewText("comic-review-theme", (input.theme || "").trim() || "（未入力）");
    setReviewText("comic-review-incident", (input.incident || "").trim() || "（未入力）");
    setReviewText("comic-review-learning", (input.learning || "").trim() || "（未入力）");
    setReviewText("comic-review-output-style", formatOutputStyleLabel(input.outputStyle));
    setReviewText("comic-review-note-preset", formatNotePresetLabel(input.notePreset));

    const cm = (input.coreMain || "").trim();
    const cp = (input.corePhrase || "").trim();
    const cc = (input.coreConclusion || "").trim();
    const coreBlock = document.getElementById("comic-review-core-block");
    if (coreBlock) {
      coreBlock.style.display = cm || cp || cc ? "block" : "none";
    }
    setReviewText("comic-review-core-main", cm || "（なし）");
    setReviewText("comic-review-core-phrase", cp || "（なし）");
    setReviewText("comic-review-core-conclusion", cc || "（なし）");

    const comicEl = document.getElementById("comic-output");
    let comicText = "";
    if (comicEl) {
      comicText = (comicEl.textContent || "").trim();
    }
    if (!comicText || comicText === OUTPUT_PLACEHOLDER) {
      comicText = "先に「構成を生成」してください。";
    }
    setReviewText("comic-review-comic", comicText);

    const apiPrompt = getPromptTextForComicImageApi();
    setReviewText(
      "comic-review-api-prompt",
      apiPrompt ||
        "（プロンプトがありません。「構成を生成」するか、上の生成用テキスト欄に入力してください。）"
    );
  }

  function normalizeComicImageApiPayload(json) {
    if (!json || typeof json !== "object") {
      return null;
    }
    const a = json.imageSrc;
    const b = json.dataUrl;
    if (typeof a === "string" && a.trim()) {
      return normalizeComicImageResult(a.trim());
    }
    if (typeof b === "string" && b.trim()) {
      return normalizeComicImageResult(b.trim());
    }
    return null;
  }

  function setComicImageApiStatus(message, color) {
    if (!comicImageApiStatus) {
      return;
    }
    comicImageApiStatus.textContent = message || "";
    comicImageApiStatus.style.color = color || "#6b7280";
  }

  function clearComicImageApiStatus() {
    setComicImageApiStatus("", "#6b7280");
  }

  async function requestComicImage(promptText) {
    const url = (COMIC_IMAGE_API_CONFIG.url || "").trim();
    if (!url) {
      return {
        ok: false,
        reason:
          "画像生成APIのURLが未設定です。js/app.js の COMIC_IMAGE_API_CONFIG.url に仮または本番のエンドポイントを設定してください。",
      };
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText }),
    });
    let json = null;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.indexOf("application/json") >= 0) {
      try {
        json = await res.json();
      } catch (e) {
        return { ok: false, reason: "APIの応答をJSONとして解釈できませんでした。" };
      }
    } else {
      try {
        const raw = (await res.text()).trim();
        if (raw) {
          json = JSON.parse(raw);
        }
      } catch (e) {
        return {
          ok: false,
          reason: "APIがJSON以外を返しました（HTTP " + res.status + "）。",
        };
      }
    }
    if (!res.ok) {
      return {
        ok: false,
        reason: "APIエラー（HTTP " + res.status + "）。応答内容を確認してください。",
      };
    }
    const normalized = normalizeComicImageApiPayload(json);
    if (!normalized || !normalized.ok) {
      return {
        ok: false,
        reason: "APIのJSONに imageSrc または dataUrl（data URL 推奨）がありません。",
      };
    }
    return { ok: true, imageSrc: normalized.imageSrc };
  }

  async function generateComicImageFromPrompt() {
    updateComicImageReviewPanel();
    const promptText = getPromptTextForComicImageApi();
    if (!promptText) {
      setComicImageApiStatus(
        "プロンプトがありません。「構成を生成」するか「生成用入力へ転記」し、生成用テキスト欄に内容がある状態にしてください。",
        "#b45309",
      );
      return;
    }
    const lastUsedEl = document.getElementById("comic-image-last-used-prompt");
    if (lastUsedEl) {
      lastUsedEl.textContent = promptText;
    }
    if (comicImageGenerateBtn) {
      comicImageGenerateBtn.disabled = true;
    }
    setComicImageApiStatus("画像を生成しています…", "#6b7280");
    try {
      const result = await requestComicImage(promptText);
      if (!result.ok) {
        setComicImageApiStatus(result.reason || "画像の取得に失敗しました。", "#b91c1c");
        return;
      }
      clearComicImageApiStatus();
      applyComicImageResult(result.imageSrc);
    } catch (e) {
      setComicImageApiStatus(
        "通信に失敗しました（ネットワーク・CORS・URL）。ローカルで file:// から開いている場合は同一オリジンまたはCORS設定を確認してください。",
        "#b91c1c",
      );
    } finally {
      if (comicImageGenerateBtn) {
        comicImageGenerateBtn.disabled = false;
      }
    }
  }

  /* 正規化 → #comic-image-url へ代入 → applyComicImagePreview */
  function applyComicImageResult(raw) {
    const normalized = normalizeComicImageResult(raw);
    if (!normalized.ok) {
      if (comicImagePreviewStatus) {
        comicImagePreviewStatus.textContent = normalized.reason || "画像結果を反映できませんでした。";
        comicImagePreviewStatus.style.color = "#b45309";
      }
      if (comicImagePreview) {
        comicImagePreview.onload = null;
        comicImagePreview.onerror = null;
        comicImagePreview.removeAttribute("src");
      }
      hideComicImagePreview();
      return false;
    }
    if (comicImageUrlInput) {
      comicImageUrlInput.value = normalized.imageSrc;
    }
    applyComicImagePreview();
    return true;
  }

  function resetComicImagePreview() {
    if (comicGenPromptDraft) {
      comicGenPromptDraft.value = "";
    }
    if (comicImageUrlInput) {
      comicImageUrlInput.value = "";
    }
    if (comicImagePreview) {
      comicImagePreview.onload = null;
      comicImagePreview.onerror = null;
      comicImagePreview.removeAttribute("src");
    }
    hideComicImagePreview();
    if (comicImagePreviewStatus) {
      comicImagePreviewStatus.textContent = COMIC_PREVIEW_STATUS_IDLE;
      comicImagePreviewStatus.style.color = "#6b7280";
    }
    clearComicImageApiStatus();
    if (comicImageGenerateBtn) {
      comicImageGenerateBtn.disabled = false;
    }
    resetBubbleOverlayPreview();
  }

  function hideComicImagePreview() {
    if (comicImagePreview) {
      comicImagePreview.style.display = "none";
    }
    if (comicImagePreviewWrap) {
      comicImagePreviewWrap.style.display = "none";
    }
  }

  function applyComicImagePreview() {
    if (!comicImageUrlInput || !comicImagePreview || !comicImagePreviewStatus) {
      return;
    }
    const trimmed = (comicImageUrlInput.value || "").trim();
    if (!trimmed) {
      resetComicImagePreview();
      return;
    }
    if (!isAllowedComicImageSource(trimmed)) {
      comicImagePreviewStatus.textContent = "https://... または data:image/... 形式で入力してください。";
      comicImagePreviewStatus.style.color = "#b45309";
      comicImagePreview.onload = null;
      comicImagePreview.onerror = null;
      comicImagePreview.removeAttribute("src");
      hideComicImagePreview();
      return;
    }

    comicImagePreviewStatus.textContent = COMIC_PREVIEW_STATUS_LOADING;
    comicImagePreviewStatus.style.color = "#6b7280";

    comicImagePreview.onload = function () {
      comicImagePreview.onload = null;
      comicImagePreview.onerror = null;
      comicImagePreview.style.display = "block";
      if (comicImagePreviewWrap) {
        comicImagePreviewWrap.style.display = "block";
      }
      comicImagePreviewStatus.textContent = "画像を表示しています。";
      comicImagePreviewStatus.style.color = "#6b7280";
      resetBubbleOverlayPreview();
    };
    comicImagePreview.onerror = function () {
      comicImagePreview.onload = null;
      comicImagePreview.onerror = null;
      comicImagePreview.removeAttribute("src");
      hideComicImagePreview();
      comicImagePreviewStatus.textContent =
        "画像を読み込めませんでした。URL・data URL・ネットワークを確認してください。";
      comicImagePreviewStatus.style.color = "#b91c1c";
    };

    comicImagePreview.src = trimmed;
  }

  function hasVisibleComicImagePreview() {
    if (!comicImagePreview || !comicImagePreviewWrap) {
      return false;
    }
    if (comicImagePreviewWrap.style.display === "none" || comicImagePreview.style.display === "none") {
      return false;
    }
    const src = (comicImagePreview.getAttribute("src") || comicImagePreview.src || "").trim();
    if (!src) {
      return false;
    }
    return true;
  }

  function isOutputPlaceholderText(text) {
    const t = (text || "").trim();
    return !t || t === OUTPUT_PLACEHOLDER;
  }

  /** 8コマ吹き出し台本テキスト → 各コマの行配列（8件） */
  function parseBubbleScript8(scriptText) {
    const raw = (scriptText || "").trim();
    if (!raw) {
      return null;
    }
    const panels = [];
    for (let i = 0; i < 8; i += 1) {
      panels[i] = [];
    }
    const blocks = raw.split(/\n\n+/);
    for (let b = 0; b < blocks.length; b += 1) {
      const lines = blocks[b].split("\n");
      if (!lines.length) {
        continue;
      }
      const header = (lines[0] || "").trim();
      const m = /^(\d)\/8[（(]/.exec(header);
      if (!m) {
        continue;
      }
      const idx = parseInt(m[1], 10) - 1;
      if (idx < 0 || idx > 7) {
        continue;
      }
      for (let j = 1; j < lines.length; j += 1) {
        const L = (lines[j] || "").trim();
        if (!L || L === "（空）") {
          continue;
        }
        panels[idx].push(L);
      }
    }
    return panels;
  }

  /** 8コマ吹き出し配置テキスト → 各コマの位置・サイズ */
  function parseBubblePlacement8(placeText) {
    const raw = (placeText || "").trim();
    if (!raw) {
      return null;
    }
    const panels = [];
    for (let i = 0; i < 8; i += 1) {
      panels[i] = { position: "上", size: "中" };
    }
    const blocks = raw.split(/\n\n+/);
    for (let b = 0; b < blocks.length; b += 1) {
      const lines = blocks[b].split("\n");
      if (!lines.length) {
        continue;
      }
      const header = (lines[0] || "").trim();
      const m = /^(\d)\/8/.exec(header);
      if (!m) {
        continue;
      }
      const idx = parseInt(m[1], 10) - 1;
      if (idx < 0 || idx > 7) {
        continue;
      }
      for (let j = 1; j < lines.length; j += 1) {
        const L = (lines[j] || "").trim();
        if (L.indexOf("位置:") === 0) {
          panels[idx].position = L.replace(/^位置:\s*/, "").trim() || "上";
        }
        if (L.indexOf("サイズ:") === 0) {
          panels[idx].size = L.replace(/^サイズ:\s*/, "").trim() || "中";
        }
      }
    }
    return panels;
  }

  function wrapLinesForBubble(ctx, text, maxInnerWidth) {
    const t = (text || "").trim();
    if (!t) {
      return [];
    }
    const chars = Array.from(t);
    const out = [];
    let line = "";
    for (let i = 0; i < chars.length; i += 1) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxInnerWidth && line.length > 0) {
        out.push(line);
        line = chars[i];
      } else {
        line = test;
      }
    }
    if (line) {
      out.push(line);
    }
    return out.length ? out : [t];
  }

  function drawComicBubbleOverlay(img, panels, placements) {
    if (!comicBubbleOverlayCanvas || !img || !img.naturalWidth) {
      return;
    }
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = comicBubbleOverlayCanvas;
    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const cols = 4;
    const cellW = w / cols;
    const cellH = h / 2;
    const fontFromCell = cellW * 0.042;

    for (let idx = 0; idx < 8; idx += 1) {
      const lines = panels[idx] || [];
      if (!lines.length) {
        continue;
      }
      const pos = (placements[idx] && placements[idx].position) || "上";
      const sizeLabel = (placements[idx] && placements[idx].size) || "中";
      let sizeMul = 1;
      if (sizeLabel === "小") {
        sizeMul = 0.88;
      }
      if (sizeLabel === "大") {
        sizeMul = 1.12;
      }

      let baseFont = Math.max(10, Math.min(28, fontFromCell * sizeMul));
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cellX = col * cellW;
      const cellY = row * cellH;
      const margin = Math.max(4, cellW * 0.015);
      const maxW = cellW - margin * 2 - 12;
      const maxCellH = cellH * 0.88;
      const padX = 6;
      const padY = 5;

      let drawLines = [];
      let bubbleW = 0;
      let bubbleH = 0;
      let lineHeight = baseFont * 1.38;

      for (let attempt = 0; attempt < 14; attempt += 1) {
        ctx.font =
          baseFont +
          'px "Yu Gothic UI", "Hiragino Kaku Gothic ProN", "Meiryo", system-ui, sans-serif';
        lineHeight = baseFont * 1.38;
        drawLines = [];
        for (let li = 0; li < lines.length; li += 1) {
          const wrapped = wrapLinesForBubble(ctx, lines[li], maxW - padX * 2);
          for (let j = 0; j < wrapped.length; j += 1) {
            drawLines.push(wrapped[j]);
          }
        }
        let maxLineW = 0;
        for (let d = 0; d < drawLines.length; d += 1) {
          maxLineW = Math.max(maxLineW, ctx.measureText(drawLines[d]).width);
        }
        bubbleW = Math.min(cellW - margin * 2, maxLineW + padX * 2);
        bubbleH = drawLines.length * lineHeight + padY * 2;
        if (bubbleH <= maxCellH) {
          break;
        }
        baseFont *= 0.92;
      }

      let bx = cellX + margin;
      let by = cellY + margin;
      switch (pos) {
        case "上中央":
        case "上":
          bx = cellX + (cellW - bubbleW) / 2;
          by = cellY + margin;
          break;
        case "右上":
          bx = cellX + cellW - bubbleW - margin;
          by = cellY + margin;
          break;
        case "左上":
          bx = cellX + margin;
          by = cellY + margin;
          break;
        case "中央":
          bx = cellX + (cellW - bubbleW) / 2;
          by = cellY + (cellH - bubbleH) / 2;
          break;
        case "左下":
          bx = cellX + margin;
          by = cellY + cellH - bubbleH - margin;
          break;
        case "下":
          bx = cellX + (cellW - bubbleW) / 2;
          by = cellY + cellH - bubbleH - margin;
          break;
        default:
          bx = cellX + (cellW - bubbleW) / 2;
          by = cellY + margin;
      }

      const rr = Math.min(8, bubbleW * 0.08);
      ctx.fillStyle = "rgba(255,255,255,0.94)";
      ctx.strokeStyle = "#111111";
      ctx.lineWidth = Math.max(1, w / 500);
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(bx, by, bubbleW, bubbleH, rr);
      } else {
        ctx.rect(bx, by, bubbleW, bubbleH);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#111111";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      let ty = by + padY;
      for (let di = 0; di < drawLines.length; di += 1) {
        ctx.fillText(drawLines[di], bx + padX, ty);
        ty += lineHeight;
      }
    }
  }

  function setBubbleOverlayStatus(message, color) {
    if (!comicBubbleOverlayStatus) {
      return;
    }
    comicBubbleOverlayStatus.textContent = message || "";
    comicBubbleOverlayStatus.style.color = color || "#6b7280";
  }

  function resetBubbleOverlayPreview() {
    if (comicBubbleOverlayCanvas) {
      const c = comicBubbleOverlayCanvas;
      const ctx = c.getContext("2d");
      if (ctx && c.width > 0) {
        ctx.clearRect(0, 0, c.width, c.height);
      }
      c.width = 0;
      c.height = 0;
    }
    if (comicBubbleOverlayWrap) {
      comicBubbleOverlayWrap.style.display = "none";
    }
    setBubbleOverlayStatus(
      "先に「構成を生成」と無字画像の表示を済ませてから押してください。",
      "#6b7280"
    );
  }

  function generateComicBubbleOverlayPreview() {
    const scriptEl = document.getElementById("comic-bubble-script-8-output");
    const placeEl = document.getElementById("comic-bubble-placement-8-output");
    const scriptText = scriptEl ? scriptEl.textContent || "" : "";
    const placeText = placeEl ? placeEl.textContent || "" : "";
    if (isOutputPlaceholderText(scriptText) || isOutputPlaceholderText(placeText)) {
      setBubbleOverlayStatus("先に「構成を生成」で吹き出し台本・配置が出た状態にしてください。", "#b45309");
      return;
    }
    if (!comicImagePreview || !comicImagePreview.complete || !comicImagePreview.naturalWidth) {
      setBubbleOverlayStatus("先に無字画像をプレビューに表示してください。", "#b45309");
      return;
    }
    if (!hasVisibleComicImagePreview()) {
      setBubbleOverlayStatus("先に無字画像をプレビューに表示してください。", "#b45309");
      return;
    }
    const panels = parseBubbleScript8(scriptText);
    const placements = parseBubblePlacement8(placeText);
    if (!panels || !placements) {
      setBubbleOverlayStatus("台本・配置の解析に失敗しました。", "#b91c1c");
      return;
    }
    try {
      drawComicBubbleOverlay(comicImagePreview, panels, placements);
      if (comicBubbleOverlayWrap) {
        comicBubbleOverlayWrap.style.display = "block";
      }
      setBubbleOverlayStatus("吹き出し付き完成漫画プレビューを表示しています。", "#6b7280");
    } catch (e) {
      setBubbleOverlayStatus("描画に失敗しました。", "#b91c1c");
    }
  }

  function downloadComicBubbleOverlay() {
    if (!comicBubbleOverlayCanvas || !comicBubbleOverlayWrap) {
      return;
    }
    if (comicBubbleOverlayWrap.style.display === "none" || comicBubbleOverlayCanvas.width < 1) {
      window.alert("先に「吹き出し付き完成漫画プレビューを生成」してください。");
      return;
    }
    try {
      const url = comicBubbleOverlayCanvas.toDataURL("image/png");
      triggerDownloadFromHref(url, COMIC_BUBBLE_OVERLAY_DOWNLOAD_FILENAME);
    } catch (e) {
      window.alert(
        "保存できませんでした。無字画像は data URL または同一オリジンのURLを使うと保存しやすいです。"
      );
    }
  }

  function triggerDownloadFromBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function triggerDownloadFromHref(href, filename) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadComicImageFromPreview() {
    if (!comicImagePreview) {
      return;
    }
    if (!hasVisibleComicImagePreview()) {
      window.alert("先に画像を表示してください。");
      return;
    }
    const src = comicImagePreview.src || "";
    const lower = src.toLowerCase();
    if (lower.startsWith("data:")) {
      triggerDownloadFromHref(src, COMIC_IMAGE_DOWNLOAD_FILENAME);
      return;
    }
    if (lower.startsWith("http://") || lower.startsWith("https://")) {
      fetch(src)
        .then(function (res) {
          if (!res.ok) {
            throw new Error("bad status");
          }
          return res.blob();
        })
        .then(function (blob) {
          triggerDownloadFromBlob(blob, COMIC_IMAGE_DOWNLOAD_FILENAME);
        })
        .catch(function () {
          window.alert("画像を保存できませんでした（ネットワーク・CORS・URLを確認してください）。");
        });
      return;
    }
    window.alert("この形式の画像は保存できませんでした。");
  }

  function clearOutputs() {
    const placeholder = "ここに生成結果が表示されます。";
    if (outputs.comicManuscriptPost) {
      outputs.comicManuscriptPost.textContent = placeholder;
    }
    if (outputs.comicRagDebug) {
      outputs.comicRagDebug.textContent = "—";
    }
    if (outputs.comicTitle) {
      outputs.comicTitle.textContent = placeholder;
    }
    outputs.comic.textContent = placeholder;
    if (outputs.comicBubbleScript8) {
      outputs.comicBubbleScript8.textContent = placeholder;
    }
    if (outputs.comicBubblePlacement8) {
      outputs.comicBubblePlacement8.textContent = placeholder;
    }
    if (outputs.comicPrompt) {
      outputs.comicPrompt.textContent = placeholder;
    }
    const unifiedClear = document.getElementById("comic-unified-prompt-output");
    if (unifiedClear) {
      unifiedClear.textContent = placeholder;
      outputs.comicUnifiedPrompt = unifiedClear;
    }
    if (outputs.noteIntroAssist) {
      outputs.noteIntroAssist.textContent = placeholder;
    }
    if (outputs.noteClosingAssist) {
      outputs.noteClosingAssist.textContent = placeholder;
    }
    if (outputs.comicEpisodeSummary) {
      outputs.comicEpisodeSummary.textContent = placeholder;
    }
    outputs.note.textContent = placeholder;
    if (outputs.noteBodyOnly) {
      outputs.noteBodyOnly.textContent = placeholder;
    }
    if (outputs.noteTitleSuggestions) {
      outputs.noteTitleSuggestions.textContent = placeholder;
    }
    if (outputs.notePrePublishCheck) {
      outputs.notePrePublishCheck.textContent = placeholder;
    }
    if (outputs.kindle) {
      outputs.kindle.textContent = placeholder;
    }
    if (outputs.kindleChapter) {
      outputs.kindleChapter.textContent = placeholder;
    }
    if (outputs.kindleBook) {
      outputs.kindleBook.textContent = placeholder;
    }
    if (outputs.kindleDraftOutline) {
      outputs.kindleDraftOutline.textContent = placeholder;
    }
    if (outputs.kindleChapterDrafts) {
      outputs.kindleChapterDrafts.textContent = placeholder;
    }
    if (outputs.kindleFullDraft) {
      outputs.kindleFullDraft.textContent = placeholder;
    }
    if (outputs.kindleManuscript) {
      outputs.kindleManuscript.textContent = placeholder;
    }
    const lastUsedClear = document.getElementById("comic-image-last-used-prompt");
    if (lastUsedClear) {
      lastUsedClear.textContent = "まだ生成していません。";
    }
    resetBubbleOverlayPreview();
    updateComicImageReviewPanel();
  }

  const COPY_BUNDLE_SEPARATOR = "\n\n---\n\n";

  function getOutputTextById(targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
      return "";
    }
    return (target.textContent || "").trim();
  }

  function copyTextById(targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    const text = target.textContent || "";
    if (!text.trim()) {
      return;
    }
    navigator.clipboard.writeText(text).catch(function () {
      window.alert("コピーに失敗しました。");
    });
  }

  function copyNotePostingBundle() {
    const title = getOutputTextById("note-title-suggestions-output");
    const body = getOutputTextById("note-body-only-output");
    if (!title && !body) {
      window.alert("コピーする内容がありません。先に「構成を生成」を押してください。");
      return;
    }
    const parts = [];
    if (title) {
      parts.push(title);
    }
    if (body) {
      parts.push(body);
    }
    const combined = parts.join(COPY_BUNDLE_SEPARATOR);
    navigator.clipboard.writeText(combined).catch(function () {
      window.alert("コピーに失敗しました。");
    });
  }

  function copyStyleBundle() {
    const data = new FormData(form);
    const style = (data.get("outputStyle") || "").trim();
    let ids;
    if (style === "note") {
      ids = [
        "comic-manuscript-post-output",
        "comic-title-output",
        "comic-output",
        "comic-bubble-script-8-output",
        "comic-bubble-placement-8-output",
        "note-intro-assist-output",
        "note-body-only-output",
        "note-closing-assist-output",
        "note-title-suggestions-output",
      ];
    } else if (style === "comic") {
      ids = [
        "comic-manuscript-post-output",
        "comic-title-output",
        "comic-output",
        "comic-bubble-script-8-output",
        "comic-bubble-placement-8-output",
        "comic-prompt-output",
        "comic-unified-prompt-output",
        "note-intro-assist-output",
        "note-closing-assist-output",
        "comic-episode-summary-output",
      ];
    } else if (style === "kindle") {
      ids = [
        "comic-manuscript-post-output",
        "comic-title-output",
        "comic-output",
        "comic-bubble-script-8-output",
        "comic-bubble-placement-8-output",
        "note-title-suggestions-output",
        "note-body-only-output",
      ];
    } else {
      ids = [
        "comic-manuscript-post-output",
        "comic-title-output",
        "comic-output",
        "comic-bubble-script-8-output",
        "comic-bubble-placement-8-output",
        "comic-prompt-output",
        "comic-unified-prompt-output",
        "note-intro-assist-output",
        "note-closing-assist-output",
        "comic-episode-summary-output",
        "note-title-suggestions-output",
        "note-body-only-output",
      ];
    }
    const parts = [];
    for (let i = 0; i < ids.length; i += 1) {
      const t = getOutputTextById(ids[i]);
      if (t) {
        parts.push(t);
      }
    }
    if (!parts.length) {
      window.alert("コピーする内容がありません。先に「構成を生成」を押してください。");
      return;
    }
    const combined = parts.join(COPY_BUNDLE_SEPARATOR);
    navigator.clipboard.writeText(combined).catch(function () {
      window.alert("コピーに失敗しました。");
    });
  }

  document.getElementById("generate-btn").addEventListener("click", function () {
    const input = getInputFromForm();
    const result = window.AIBusouEngine.buildAllOutputs(input);
    renderOutputs(result);
  });

  document.getElementById("example-btn").addEventListener("click", function () {
    setFormValues(exampleData);
    if (detailedInputEl) {
      detailedInputEl.setAttribute("open", "");
    }
  });

  document.getElementById("chapter-preview-btn").addEventListener("click", function () {
    const baseInput = getInputFromForm();
    renderKindleChapterPreviewFromMultiInput(baseInput);
  });

  document.getElementById("book-preview-btn").addEventListener("click", function () {
    const baseInput = getInputFromForm();
    renderKindleBookPreviewFromMultiInput(baseInput);
  });

  document.getElementById("draft-preview-btn").addEventListener("click", function () {
    const baseInput = getInputFromForm();
    renderKindleDraftOutlinePreviewFromMultiInput(baseInput);
  });

  document.getElementById("chapter-drafts-preview-btn").addEventListener("click", function () {
    const baseInput = getInputFromForm();
    renderKindleChapterDraftsPreviewFromMultiInput(baseInput);
  });

  document.getElementById("full-draft-preview-btn").addEventListener("click", function () {
    const baseInput = getInputFromForm();
    renderKindleFullDraftPreviewFromMultiInput(baseInput);
  });

  document.getElementById("manuscript-preview-btn").addEventListener("click", function () {
    const baseInput = getInputFromForm();
    renderKindleManuscriptPreviewFromMultiInput(baseInput);
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    form.reset();
    if (detailedInputEl) {
      detailedInputEl.removeAttribute("open");
    }
    clearOutputs();
    resetComicImagePreview();
  });

  if (comicUnifiedToDraftBtn) {
    comicUnifiedToDraftBtn.addEventListener("click", function () {
      transferUnifiedPromptToDraft();
    });
  }

  if (comicImageApplyBtn) {
    comicImageApplyBtn.addEventListener("click", function () {
      applyComicImagePreview();
    });
  }

  const comicImageAdapterTestBtn = document.getElementById("comic-image-adapter-test-btn");
  if (comicImageAdapterTestBtn) {
    comicImageAdapterTestBtn.addEventListener("click", function () {
      applyComicImageResult(COMIC_IMAGE_DUMMY_1PX_PNG);
    });
  }

  if (comicImageDownloadBtn) {
    comicImageDownloadBtn.addEventListener("click", function () {
      downloadComicImageFromPreview();
    });
  }

  window.AIBusouComicImageAdapter = {
    normalizeComicImageResult: normalizeComicImageResult,
    applyComicImageResult: applyComicImageResult,
    DUMMY_1PX_PNG_DATA_URL: COMIC_IMAGE_DUMMY_1PX_PNG,
    COMIC_IMAGE_API_CONFIG: COMIC_IMAGE_API_CONFIG,
    requestComicImage: requestComicImage,
    generateComicImageFromPrompt: generateComicImageFromPrompt,
    downloadComicImageFromPreview: downloadComicImageFromPreview,
    generateComicBubbleOverlayPreview: generateComicBubbleOverlayPreview,
    downloadComicBubbleOverlay: downloadComicBubbleOverlay,
  };

  if (comicImageGenerateBtn) {
    comicImageGenerateBtn.addEventListener("click", function () {
      generateComicImageFromPrompt();
    });
  }

  if (comicBubbleOverlayGenerateBtn) {
    comicBubbleOverlayGenerateBtn.addEventListener("click", function () {
      generateComicBubbleOverlayPreview();
    });
  }

  if (comicBubbleOverlayDownloadBtn) {
    comicBubbleOverlayDownloadBtn.addEventListener("click", function () {
      downloadComicBubbleOverlay();
    });
  }

  const comicImageReviewRefreshBtn = document.getElementById("comic-image-review-refresh-btn");
  if (comicImageReviewRefreshBtn) {
    comicImageReviewRefreshBtn.addEventListener("click", function () {
      updateComicImageReviewPanel();
    });
  }

  if (comicGenPromptDraft) {
    comicGenPromptDraft.addEventListener("input", function () {
      updateComicImageReviewPanel();
    });
  }

  if (comicImageUrlInput) {
    comicImageUrlInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        applyComicImagePreview();
      }
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (button) {
    if (button.getAttribute("data-copy-skip")) {
      return;
    }
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-copy-target");
      copyTextById(targetId);
    });
  });

  const copyNotePostingBundleBtn = document.getElementById("copy-note-posting-bundle-btn");
  if (copyNotePostingBundleBtn) {
    copyNotePostingBundleBtn.addEventListener("click", function () {
      copyNotePostingBundle();
    });
  }

  const copyStyleBundleBtn = document.getElementById("copy-style-bundle-btn");
  if (copyStyleBundleBtn) {
    copyStyleBundleBtn.addEventListener("click", function () {
      copyStyleBundle();
    });
  }

  clearOutputs();
})();
