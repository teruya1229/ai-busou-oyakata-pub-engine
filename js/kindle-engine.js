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

  function isSectionMaterial(source) {
    return !!(
      source &&
      typeof source === "object" &&
      typeof source.sectionTitle === "string" &&
      typeof source.hook === "string" &&
      Array.isArray(source.bodyOutline)
    );
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

  function uniqueNonEmpty(values) {
    const map = {};
    const result = [];
    (values || []).forEach(function (value) {
      const text = compactSpaces(value);
      if (!text || map[text]) {
        return;
      }
      map[text] = true;
      result.push(text);
    });
    return result;
  }

  function buildChapterTheme(sectionMaterials, options) {
    const optionTheme = compactSpaces(options && options.chapterTheme);
    if (optionTheme) {
      return optionTheme;
    }
    if (!sectionMaterials.length) {
      return "現場改善";
    }
    const firstTitle = compactSpaces(sectionMaterials[0].sectionTitle);
    if (!firstTitle) {
      return "現場改善";
    }
    const base = compactSpaces(firstTitle.split("（")[0]);
    return base || "現場改善";
  }

  function buildChapterTitle(sectionMaterials, options) {
    const optionTitle = compactSpaces(options && options.chapterTitle);
    if (optionTitle) {
      return optionTitle;
    }
    const theme = buildChapterTheme(sectionMaterials, options);
    if (theme.indexOf("AI武装親方｜") === 0) {
      return theme;
    }
    return "AI武装親方｜" + theme;
  }

  function normalizeChapterSections(inputsOrSections) {
    if (!Array.isArray(inputsOrSections)) {
      return [];
    }
    return inputsOrSections
      .map(function (item) {
        if (isSectionMaterial(item)) {
          return item;
        }
        return buildKindleSectionMaterial(item || {});
      })
      .filter(function (item) {
        return isSectionMaterial(item);
      })
      .slice(0, 4);
  }

  function buildKindleChapterMaterial(inputsOrSections, options) {
    const sectionMaterials = normalizeChapterSections(inputsOrSections);
    const chapterTheme = buildChapterTheme(sectionMaterials, options || {});
    const chapterTitle = buildChapterTitle(sectionMaterials, options || {});

    const hookCandidates = sectionMaterials
      .map(function (section) {
        return section.hook;
      })
      .slice(0, 2);
    const chapterHook = uniqueNonEmpty(hookCandidates).join(" / ") || "導入フック: 章素材を準備中。";

    const chapterOutline = sectionMaterials.map(function (section, index) {
      const firstOutline = compactSpaces((section.bodyOutline || [])[0] || "");
      const summary = firstOutline || "本文アウトラインを準備中。";
      return "第" + (index + 1).toString() + "節 " + section.sectionTitle + ": " + summary;
    });

    const chapterKeyTakeaways = uniqueNonEmpty(
      sectionMaterials.map(function (section) {
        return section.keyPoint;
      })
    );

    return {
      chapterTitle: chapterTitle,
      chapterTheme: chapterTheme,
      sectionMaterials: sectionMaterials,
      chapterHook: chapterHook,
      chapterOutline: chapterOutline,
      chapterKeyTakeaways: chapterKeyTakeaways,
      sourceSummary: sectionMaterials.map(function (section, index) {
        return {
          sectionIndex: index + 1,
          sectionTitle: section.sectionTitle,
          sourceSummary: section.sourceSummary || { comic: "", note: "", x: "" },
        };
      }),
    };
  }

  function buildKindleChapterPreview(inputsOrSections, options) {
    const material = buildKindleChapterMaterial(inputsOrSections, options);
    const sectionTitles = material.sectionMaterials.map(function (section, index) {
      return (index + 1).toString() + ". " + section.sectionTitle;
    });
    const outlineLines = (material.chapterOutline || []).map(function (line, index) {
      return (index + 1).toString() + ". " + line;
    });
    const takeawayLines = (material.chapterKeyTakeaways || []).map(function (line, index) {
      return (index + 1).toString() + ". " + line;
    });

    return [
      "【Kindle章素材プレビュー】",
      "章タイトル: " + material.chapterTitle,
      "章テーマ: " + material.chapterTheme,
      "",
      "節タイトル一覧:",
      sectionTitles.join("\n") || "（節素材なし）",
      "",
      "章導入:",
      material.chapterHook,
      "",
      "章アウトライン:",
      outlineLines.join("\n") || "（アウトラインなし）",
      "",
      "学びの要点:",
      takeawayLines.join("\n") || "（要点なし）",
    ].join("\n");
  }

  function isChapterMaterial(source) {
    return !!(
      source &&
      typeof source === "object" &&
      typeof source.chapterTitle === "string" &&
      Array.isArray(source.sectionMaterials)
    );
  }

  function normalizeBookChapters(chaptersOrInputs, options) {
    if (!Array.isArray(chaptersOrInputs)) {
      return [];
    }
    return chaptersOrInputs
      .map(function (item) {
        if (isChapterMaterial(item)) {
          return item;
        }
        if (Array.isArray(item)) {
          return buildKindleChapterMaterial(item, options || {});
        }
        if (item && Array.isArray(item.inputs)) {
          return buildKindleChapterMaterial(item.inputs, item.options || options || {});
        }
        return buildKindleChapterMaterial([item], options || {});
      })
      .filter(function (chapter) {
        return isChapterMaterial(chapter);
      })
      .slice(0, 5);
  }

  function buildBookTheme(chapterMaterials, options) {
    const optionTheme = compactSpaces(options && options.bookTheme);
    if (optionTheme) {
      return optionTheme;
    }
    if (!chapterMaterials.length) {
      return "現場改善";
    }
    return compactSpaces(chapterMaterials[0].chapterTheme) || "現場改善";
  }

  function buildBookTitle(chapterMaterials, options) {
    const optionTitle = compactSpaces(options && options.bookTitle);
    if (optionTitle) {
      return optionTitle;
    }
    const theme = buildBookTheme(chapterMaterials, options);
    if (!theme) {
      return "AI武装親方｜実践集";
    }
    if (theme.indexOf("AI武装親方｜") === 0) {
      return theme + "実践集";
    }
    return "AI武装親方｜" + theme + "実践集";
  }

  function buildKindleBookMaterial(chaptersOrInputs, options) {
    const chapterMaterials = normalizeBookChapters(chaptersOrInputs, options || {});
    const bookTheme = buildBookTheme(chapterMaterials, options || {});
    const bookTitle = buildBookTitle(chapterMaterials, options || {});

    const introductionOutline =
      uniqueNonEmpty(
        chapterMaterials.map(function (chapter) {
          return chapter.chapterHook;
        })
      )
        .slice(0, 2)
        .join(" / ") || "本書導入: 章素材を準備中。";

    const chapterSummaries = chapterMaterials.map(function (chapter, index) {
      const firstOutline = compactSpaces((chapter.chapterOutline || [])[0] || "");
      const fallback = compactSpaces((chapter.chapterKeyTakeaways || [])[0] || "");
      const summary = firstOutline || fallback || "要約準備中。";
      return "第" + (index + 1).toString() + "章 " + chapter.chapterTitle + ": " + summary;
    });

    const keyInsights = uniqueNonEmpty(
      chapterMaterials.reduce(function (acc, chapter) {
        return acc.concat(chapter.chapterKeyTakeaways || []);
      }, [])
    ).slice(0, 8);

    const endingOutline =
      keyInsights.length > 0
        ? "終わり方: 重要な学びを次の現場へ再利用し、再発防止と改善を継続する。"
        : "終わり方: 章素材を統合し、次段で学びの再利用方針を確定する。";

    return {
      bookTitle: bookTitle,
      bookTheme: bookTheme,
      chapterMaterials: chapterMaterials,
      introductionOutline: introductionOutline,
      chapterSummaries: chapterSummaries,
      keyInsights: keyInsights,
      endingOutline: endingOutline,
      sourceSummary: chapterMaterials.map(function (chapter, index) {
        return {
          chapterIndex: index + 1,
          chapterTitle: chapter.chapterTitle,
          sourceSummary: chapter.sourceSummary || [],
        };
      }),
    };
  }

  function buildKindleBookPreview(chaptersOrInputs, options) {
    const material = buildKindleBookMaterial(chaptersOrInputs, options);
    const chapterTitles = material.chapterMaterials.map(function (chapter, index) {
      return (index + 1).toString() + ". " + chapter.chapterTitle;
    });
    const summaryLines = (material.chapterSummaries || []).map(function (line, index) {
      return (index + 1).toString() + ". " + line;
    });
    const insightLines = (material.keyInsights || []).map(function (line, index) {
      return (index + 1).toString() + ". " + line;
    });

    return [
      "【Kindle本素材プレビュー】",
      "本タイトル: " + material.bookTitle,
      "本テーマ: " + material.bookTheme,
      "",
      "章タイトル一覧:",
      chapterTitles.join("\n") || "（章素材なし）",
      "",
      "導入概要:",
      material.introductionOutline,
      "",
      "各章要約:",
      summaryLines.join("\n") || "（要約なし）",
      "",
      "重要な学び:",
      insightLines.join("\n") || "（学びなし）",
      "",
      "終わり方の骨子:",
      material.endingOutline,
    ].join("\n");
  }

  window.AIBusouKindleEngine = {
    buildEpisodeModel: buildEpisodeModel,
    buildKindleSectionMaterial: buildKindleSectionMaterial,
    buildKindleSectionPreview: buildKindleSectionPreview,
    buildKindleChapterMaterial: buildKindleChapterMaterial,
    buildKindleChapterPreview: buildKindleChapterPreview,
    buildKindleBookMaterial: buildKindleBookMaterial,
    buildKindleBookPreview: buildKindleBookPreview,
  };
})();
