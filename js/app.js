(function () {
  const form = document.getElementById("input-form");
  const outputs = {
    comic: document.getElementById("comic-output"),
    note: document.getElementById("note-output"),
    xPost: document.getElementById("x-output"),
    kindle: document.getElementById("kindle-output"),
    kindleChapter: document.getElementById("kindle-chapter-output"),
    kindleBook: document.getElementById("kindle-book-output"),
  };
  const chapterEpisodesField = document.getElementById("chapter-episodes");

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

  function clearOutputs() {
    const placeholder = "ここに生成結果が表示されます。";
    outputs.comic.textContent = placeholder;
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

  document.getElementById("reset-btn").addEventListener("click", function () {
    form.reset();
    clearOutputs();
  });

  document.querySelectorAll(".copy-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-copy-target");
      copyTextById(targetId);
    });
  });

  clearOutputs();
})();
