(function () {
  function compactSpaces(text) {
    return (text || "").toString().replace(/\s+/g, " ").trim();
  }

  function ensureActionEnding(text) {
    const trimmed = compactSpaces(text);
    if (!trimmed) {
      return "学びを次の現場で再現する。";
    }
    const withoutPeriod = trimmed.replace(/[。！？!?]+$/, "");
    if (/する$/.test(withoutPeriod)) {
      return withoutPeriod + "。";
    }
    if (/しよう$/.test(withoutPeriod)) {
      return withoutPeriod.replace(/しよう$/, "する") + "。";
    }
    if (/できる$/.test(withoutPeriod)) {
      return withoutPeriod.replace(/できる$/, "できるようにする") + "。";
    }
    return withoutPeriod + "する。";
  }

  function splitCharacters(charactersText) {
    return compactSpaces(charactersText)
      .split(/[、,\s]+/)
      .map(function (name) {
        return compactSpaces(name);
      })
      .filter(Boolean);
  }

  function isEpisodeModel(source) {
    return !!(source && typeof source === "object" && source.summaryLine && source.learningFocus);
  }

  function buildEpisodeModel(input) {
    const normalized = window.AIBusouEngine.normalizeInput(input || {});
    const summaryLine = compactSpaces(
      normalized.theme + "｜" + normalized.incident + "｜学び: " + normalized.learning
    );

    return {
      titleTheme: normalized.theme,
      incident: normalized.incident,
      lesson: normalized.learning,
      characters: splitCharacters(normalized.characters),
      tone: normalized.tone,
      comicPattern: normalized.comicPattern,
      learningFocus: normalized.learningFocus,
      summaryLine: summaryLine,
    };
  }

  function extractNoteBodyOutline(noteText) {
    const lines = (noteText || "").split("\n");
    const wantedHeaders = ["## 現場で起きたこと", "## なぜそれが起きたか", "## 学び", "## まとめ"];
    const outline = [];

    wantedHeaders.forEach(function (header) {
      const index = lines.indexOf(header);
      if (index < 0) {
        return;
      }
      let content = "";
      for (let i = index + 1; i < lines.length; i += 1) {
        const current = lines[i];
        if (current.indexOf("## ") === 0) {
          break;
        }
        if (compactSpaces(current)) {
          content = compactSpaces(current);
          break;
        }
      }
      if (content) {
        outline.push(header.replace("## ", "") + ": " + content);
      }
    });

    return outline;
  }

  function extractComicHook(comicText, fallbackIncident) {
    const lines = (comicText || "").split("\n");
    const incidentLine = lines.find(function (line) {
      return line.indexOf("状況:") === 0;
    });
    if (incidentLine) {
      return incidentLine;
    }
    return "導入フック: " + compactSpaces(fallbackIncident);
  }

  function buildSectionTitle(model) {
    return model.titleTheme + "（" + model.comicPattern + "）";
  }

  function toEpisodeModel(inputOrEpisodeModel) {
    if (isEpisodeModel(inputOrEpisodeModel)) {
      return inputOrEpisodeModel;
    }
    return buildEpisodeModel(inputOrEpisodeModel || {});
  }

  function buildKindleSectionMaterial(inputOrEpisodeModel) {
    const model = toEpisodeModel(inputOrEpisodeModel);
    const rawInput = {
      theme: model.titleTheme,
      incident: model.incident,
      learning: model.lesson,
      characters: model.characters.join("、"),
      tone: model.tone,
    };
    const comicText = window.AIBusouEngine.buildComic(rawInput);
    const noteText = window.AIBusouEngine.buildNote(rawInput);
    const xText = window.AIBusouEngine.buildXPost(rawInput);

    const sectionTitle = buildSectionTitle(model);
    const hook = extractComicHook(comicText, model.incident);
    const bodyOutline = extractNoteBodyOutline(noteText);
    const keyPoint = ensureActionEnding(model.lesson);

    return {
      sectionTitle: sectionTitle,
      hook: hook,
      bodyOutline: bodyOutline,
      keyPoint: keyPoint,
      sourceSummary: {
        comic: compactSpaces(comicText).slice(0, 160),
        note: compactSpaces(noteText).slice(0, 160),
        x: compactSpaces(xText).slice(0, 160),
      },
    };
  }

  function buildKindleSectionPreview(inputOrEpisodeModel) {
    const material = buildKindleSectionMaterial(inputOrEpisodeModel);
    const bodyLines = material.bodyOutline.map(function (item, index) {
      return (index + 1).toString() + ". " + item;
    });

    return [
      "【Kindle節素材プレビュー】",
      "節タイトル: " + material.sectionTitle,
      "",
      "導入フック:",
      material.hook,
      "",
      "本文アウトライン:",
      bodyLines.join("\n"),
      "",
      "節末要点:",
      material.keyPoint,
    ].join("\n");
  }

  window.AIBusouKindleEngine = {
    buildEpisodeModel: buildEpisodeModel,
    buildKindleSectionMaterial: buildKindleSectionMaterial,
    buildKindleSectionPreview: buildKindleSectionPreview,
  };
})();
