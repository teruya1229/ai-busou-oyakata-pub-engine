(function () {
  const form = document.getElementById("input-form");
  const outputs = {
    comic: document.getElementById("comic-output"),
    comicPrompt: document.getElementById("comic-prompt-output"),
    comicUnifiedPrompt: document.getElementById("comic-unified-prompt-output"),
    note: document.getElementById("note-output"),
    xPost: document.getElementById("x-output"),
    kindle: document.getElementById("kindle-output"),
    kindleChapter: document.getElementById("kindle-chapter-output"),
    kindleBook: document.getElementById("kindle-book-output"),
    kindleDraftOutline: document.getElementById("kindle-draft-output"),
    kindleChapterDrafts: document.getElementById("kindle-chapter-drafts-output"),
    kindleFullDraft: document.getElementById("kindle-full-draft-output"),
    kindleManuscript: document.getElementById("kindle-manuscript-output"),
  };
  const chapterEpisodesField = document.getElementById("chapter-episodes");
  const comicGenPromptDraft = document.getElementById("comic-gen-prompt-draft");
  const comicUnifiedToDraftBtn = document.getElementById("comic-unified-to-draft-btn");
  const comicImageUrlInput = document.getElementById("comic-image-url");
  const comicImageApplyBtn = document.getElementById("comic-image-apply-btn");
  const comicImagePreviewWrap = document.getElementById("comic-image-preview-wrap");
  const comicImagePreview = document.getElementById("comic-image-preview");
  const comicImagePreviewStatus = document.getElementById("comic-image-preview-status");
  const comicImageApiStatus = document.getElementById("comic-image-api-status");
  const comicImageGenerateBtn = document.getElementById("comic-image-generate-btn");

  const COMIC_PREVIEW_STATUS_IDLE =
    "URL または data URL を入力し、「4コマ画像を表示」を押すか、入力欄で Ctrl+Enter（Mac は ⌘+Enter）で反映できます。";
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

  function getInputFromForm() {
    const data = new FormData(form);
    return {
      theme: data.get("theme"),
      incident: data.get("incident"),
      learning: data.get("learning"),
      characters: data.get("characters"),
      tone: data.get("tone"),
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
    outputs.comic.textContent = result.comic;
    if (outputs.comicPrompt) {
      outputs.comicPrompt.textContent = result.comicPrompt || "4コマ描画プロンプトを生成できませんでした。";
    }
    if (outputs.comicUnifiedPrompt) {
      outputs.comicUnifiedPrompt.textContent =
        result.comicUnifiedPrompt || "4コマ統合画像プロンプトを生成できませんでした。";
    }
    outputs.note.textContent = result.note;
    outputs.xPost.textContent = result.xPost;
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
    if (!text || text === OUTPUT_PLACEHOLDER || text.indexOf("4コマ統合画像プロンプトを生成できませんでした") >= 0) {
      window.alert("先に「構成を生成」で4コマ統合画像プロンプトを表示してください。");
      return;
    }
    comicGenPromptDraft.value = outputs.comicUnifiedPrompt.textContent || "";
    comicGenPromptDraft.focus();
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
    if (!t || t === OUTPUT_PLACEHOLDER || t.indexOf("4コマ統合画像プロンプトを生成できませんでした") >= 0) {
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
    const promptText = getPromptTextForComicImageApi();
    if (!promptText) {
      setComicImageApiStatus(
        "プロンプトがありません。「構成を生成」するか「生成用入力へ転記」し、生成用テキスト欄に内容がある状態にしてください。",
        "#b45309",
      );
      return;
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

  function clearOutputs() {
    const placeholder = "ここに生成結果が表示されます。";
    outputs.comic.textContent = placeholder;
    if (outputs.comicPrompt) {
      outputs.comicPrompt.textContent = placeholder;
    }
    if (outputs.comicUnifiedPrompt) {
      outputs.comicUnifiedPrompt.textContent = placeholder;
    }
    outputs.note.textContent = placeholder;
    outputs.xPost.textContent = placeholder;
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

  document.getElementById("generate-btn").addEventListener("click", function () {
    const input = getInputFromForm();
    const result = window.AIBusouEngine.buildAllOutputs(input);
    renderOutputs(result);
    renderKindlePreview(input);
    renderKindleChapterPreview(input);
  });

  document.getElementById("example-btn").addEventListener("click", function () {
    setFormValues(exampleData);
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

  window.AIBusouComicImageAdapter = {
    normalizeComicImageResult: normalizeComicImageResult,
    applyComicImageResult: applyComicImageResult,
    DUMMY_1PX_PNG_DATA_URL: COMIC_IMAGE_DUMMY_1PX_PNG,
    COMIC_IMAGE_API_CONFIG: COMIC_IMAGE_API_CONFIG,
    requestComicImage: requestComicImage,
    generateComicImageFromPrompt: generateComicImageFromPrompt,
  };

  if (comicImageGenerateBtn) {
    comicImageGenerateBtn.addEventListener("click", function () {
      generateComicImageFromPrompt();
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
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-copy-target");
      copyTextById(targetId);
    });
  });

  clearOutputs();
})();
