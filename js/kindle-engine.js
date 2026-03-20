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
      outputStyle: normalized.outputStyle,
      coreMain: normalized.coreMain,
      corePhrase: normalized.corePhrase,
      coreConclusion: normalized.coreConclusion,
    };
  }

  function stripNoteTitle(noteText) {
    let body = (noteText || "").replace(/\r\n/g, "\n").trim();
    if (body.indexOf("# ") === 0) {
      body = body.replace(/^#[^\n]*\n+/, "");
    }
    return body.trim();
  }

  function sliceBetween(text, startTag, endTag) {
    const i = text.indexOf(startTag);
    if (i < 0) {
      return "";
    }
    const start = i + startTag.length;
    if (!endTag) {
      return text.slice(start).trim();
    }
    const j = text.indexOf(endTag, start);
    if (j < 0) {
      return text.slice(start).trim();
    }
    return text.slice(start, j).trim();
  }

  function extractNoteBodyOutline(noteText) {
    const raw = (noteText || "").replace(/\r\n/g, "\n").trim();
    if (!raw) {
      return [];
    }
    const body = stripNoteTitle(raw);
    if (body.indexOf("【実話】") >= 0) {
      const tags = ["【実話】", "【なぜそうなったか】", "【気づき】", "【まとめ】"];
      const labels = ["実話", "なぜそうなったか", "気づき", "まとめ"];
      const endAfterMatome = "（章や本の中では";
      const outline = [];
      for (let i = 0; i < tags.length; i += 1) {
        const next = i + 1 < tags.length ? tags[i + 1] : endAfterMatome;
        let chunk = sliceBetween(body, tags[i], next);
        if (i === tags.length - 1) {
          chunk = chunk.split(endAfterMatome)[0] || chunk;
        }
        chunk = compactSpaces(chunk);
        if (chunk) {
          outline.push(labels[i] + ": " + chunk.slice(0, 220));
        }
      }
      if (outline.length) {
        const intro = sliceBetween(body, "", "【実話】").trim();
        if (intro) {
          outline.unshift("導入: " + compactSpaces(intro).slice(0, 220));
        }
        return outline;
      }
    }
    const paras = body
      .split(/\n\n+/)
      .map(function (p) {
        return compactSpaces(p);
      })
      .filter(Boolean);
    const labels = ["導入", "実話", "反転・背景", "気づき", "締め"];
    const outline = [];
    for (let i = 0; i < paras.length && i < labels.length; i += 1) {
      outline.push(labels[i] + ": " + paras[i].slice(0, 220));
    }
    return outline;
  }

  function formatStructuredKindleSectionDraft(hook, noteText) {
    const body = stripNoteTitle(noteText);
    const intro = sliceBetween(body, "", "【実話】").trim();
    const jitsu = sliceBetween(body, "【実話】", "【なぜそうなったか】");
    const naze = sliceBetween(body, "【なぜそうなったか】", "【気づき】");
    const kidzuki = sliceBetween(body, "【気づき】", "【まとめ】");
    let matome = sliceBetween(body, "【まとめ】", "（章や本の中では");
    if (!matome) {
      matome = sliceBetween(body, "【まとめ】", "");
    }
    matome = matome.replace(/\n*（章や本の中では[\s\S]*$/, "").trim();
    const parts = [];
    parts.push("◎ フック（4コマ・状況）");
    parts.push(hook);
    parts.push("");
    if (intro) {
      parts.push("■ 導入");
      parts.push(intro);
      parts.push("");
    }
    parts.push("■ 現場で起きたこと（実話）");
    parts.push(jitsu || "（本文なし）");
    parts.push("");
    parts.push("■ そこから見えたズレ・背景（なぜそうなったか）");
    parts.push(naze || "（本文なし）");
    parts.push("");
    parts.push("■ 気づき（学び）");
    parts.push(kidzuki || "（本文なし）");
    parts.push("");
    parts.push("■ この節のまとめ");
    parts.push(matome || "（本文なし）");
    return parts.join("\n");
  }

  function formatFallbackKindleSectionDraft(hook, noteText) {
    const body = stripNoteTitle(noteText);
    const paras = body
      .split(/\n\n+/)
      .map(function (p) {
        return compactSpaces(p);
      })
      .filter(Boolean);
    const parts = [];
    parts.push("◎ フック（4コマ・状況）");
    parts.push(hook);
    parts.push("");
    const labels = ["■ 導入", "■ 現場の実話", "■ 反転・背景", "■ 気づき", "■ 締め"];
    for (let i = 0; i < paras.length && i < labels.length; i += 1) {
      parts.push(labels[i]);
      parts.push(paras[i]);
      parts.push("");
    }
    if (paras.length > labels.length) {
      parts.push("■ つづき");
      parts.push(paras.slice(labels.length).join("\n\n"));
    }
    return parts.join("\n").trim();
  }

  function formatKindleSectionDraftBody(material) {
    const noteText = material.noteFull || "";
    if (noteText.indexOf("【実話】") >= 0) {
      return formatStructuredKindleSectionDraft(material.hook, noteText);
    }
    return formatFallbackKindleSectionDraft(material.hook, noteText);
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
      outputStyle: model.outputStyle || "",
      coreMain: model.coreMain || "",
      corePhrase: model.corePhrase || "",
      coreConclusion: model.coreConclusion || "",
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
      noteFull: noteText,
      outputStyle: model.outputStyle || "",
      sourceSummary: {
        comic: compactSpaces(comicText).slice(0, 160),
        note: compactSpaces(noteText).slice(0, 160),
        x: compactSpaces(xText).slice(0, 160),
      },
    };
  }

  function buildKindleSectionPreview(inputOrEpisodeModel) {
    const material = buildKindleSectionMaterial(inputOrEpisodeModel);
    const draftBody = formatKindleSectionDraftBody(material);
    const styleHint =
      (toEpisodeModel(inputOrEpisodeModel).outputStyle || "") === "kindle"
        ? "（出力スタイル: Kindle向け。note本文は【実話】構造。下記は章に貼りやすい段落見出し付き）"
        : "（出力スタイルが Kindle向けのとき、noteが【実話】構造になり、下書きがよりつながります）";

    return [
      "【Kindle節素材プレビュー】（原稿下書き寄り）",
      styleHint,
      "",
      "節タイトル: " + material.sectionTitle,
      "",
      "────────",
      draftBody,
      "",
      "────────",
      "",
      "節末要点（行動に落とす一行）:",
      material.keyPoint,
      "",
      "※ 章組み用の短い見出しリスト（互換・目次向け）:",
      material.bodyOutline.map(function (item, index) {
        return (index + 1).toString() + ". " + item;
      }).join("\n"),
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

  function sectionTitleBase(section) {
    const t = compactSpaces(section && section.sectionTitle) || "";
    const i = t.indexOf("（");
    return i >= 0 ? compactSpaces(t.slice(0, i)) : t;
  }

  function mergeChapterThemeBases(sectionMaterials) {
    const bases = uniqueNonEmpty((sectionMaterials || []).map(sectionTitleBase));
    if (!bases.length) {
      return "現場改善";
    }
    if (bases.length === 1) {
      return bases[0];
    }
    const short = bases.map(function (b) {
      return b.length > 24 ? b.slice(0, 24) + "…" : b;
    });
    let merged = short.join("・");
    if (merged.length > 72) {
      merged = merged.slice(0, 70) + "…";
    }
    return merged;
  }

  function buildChapterTheme(sectionMaterials, options) {
    const optionTheme = compactSpaces(options && options.chapterTheme);
    if (optionTheme) {
      return optionTheme;
    }
    if (!sectionMaterials.length) {
      return "現場改善";
    }
    if (sectionMaterials.length === 1) {
      const firstTitle = compactSpaces(sectionMaterials[0].sectionTitle);
      if (!firstTitle) {
        return "現場改善";
      }
      const base = compactSpaces(firstTitle.split("（")[0]);
      return base || "現場改善";
    }
    return mergeChapterThemeBases(sectionMaterials);
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
    if (sectionMaterials.length >= 2) {
      return "AI武装親方｜" + theme + "（" + sectionMaterials.length + "本の話題）";
    }
    return "AI武装親方｜" + theme;
  }

  function buildChapterIntroDraft(sectionMaterials) {
    const n = sectionMaterials.length;
    if (!n) {
      return "章の導入を準備中。";
    }
    const bases = uniqueNonEmpty(sectionMaterials.map(sectionTitleBase));
    const head = bases[0]
      ? "「" + (bases[0].length > 36 ? bases[0].slice(0, 36) + "…" : bases[0]) + "」から始め、"
      : "";
    if (n === 1) {
      return (
        head +
        "この章は1本の現場の話を、起きたことから学びの一行まで読みやすい順に整えた。"
      );
    }
    return (
      "この章では" +
      n +
      "本の現場の話を、同じリズム（起きたこと→ズレ→次の一手）で並べた。" +
      head +
      "節が切り替わっても読み疲れしないよう、見出しと要点の置き方を揃えている。"
    );
  }

  function buildSectionBridges(sectionMaterials) {
    const bridges = [];
    const bases = sectionMaterials.map(sectionTitleBase);
    for (let i = 0; i < bases.length - 1; i += 1) {
      const next = compactSpaces(bases[i + 1]) || "次の話題";
      const shown = next.length > 32 ? next.slice(0, 32) + "…" : next;
      bridges.push(
        "ここまでの話を踏まえて、次は「" + shown + "」へ視点を移す。"
      );
    }
    return bridges;
  }

  function buildChapterClosing(sectionMaterials) {
    const n = sectionMaterials.length;
    if (!n) {
      return "章の締めを準備中。";
    }
    const points = uniqueNonEmpty(
      sectionMaterials.map(function (s) {
        return compactSpaces(s.keyPoint);
      })
    );
    const summary = points.length > 0 ? points.slice(0, 3).join(" ") : "現場のズレを言語化する。";
    return (
      "この章で拾った要点は、" +
      summary +
      " 次の章や別テーマへ進むときは、この章で強かった「ズレの型」をひとつだけ持ち越すと、下書きが書きやすい。"
    );
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

    const chapterIntroDraft = buildChapterIntroDraft(sectionMaterials);
    const sectionBridges = buildSectionBridges(sectionMaterials);
    const chapterClosing = buildChapterClosing(sectionMaterials);
    const outputStyleAnyKindle = sectionMaterials.some(function (section) {
      return compactSpaces(section.outputStyle || "") === "kindle";
    });

    return {
      chapterTitle: chapterTitle,
      chapterTheme: chapterTheme,
      sectionMaterials: sectionMaterials,
      chapterHook: chapterHook,
      chapterOutline: chapterOutline,
      chapterKeyTakeaways: chapterKeyTakeaways,
      chapterIntroDraft: chapterIntroDraft,
      sectionBridges: sectionBridges,
      chapterClosing: chapterClosing,
      outputStyleAnyKindle: outputStyleAnyKindle,
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

    const styleHint = material.outputStyleAnyKindle
      ? "（出力スタイル: Kindle向け。複数節を1章に束ねるときの導入・接続・章末つき）"
      : "（出力スタイルが Kindle向けのとき、節の【実話】構造とあわせて章の流れがはっきりします）";

    const sectionBlocks = material.sectionMaterials.map(function (section, index) {
      const kp = compactSpaces(section.keyPoint);
      const firstOutline = compactSpaces((section.bodyOutline || [])[0] || "");
      const lines = [
        "【第" + (index + 1).toString() + "節】 " + section.sectionTitle,
        "要点: " + kp,
      ];
      if (firstOutline) {
        lines.push("抜粋: " + firstOutline.slice(0, 140));
      }
      return lines.join("\n");
    });

    const blocksWithBridges = [];
    const bridges = material.sectionBridges || [];
    for (let i = 0; i < sectionBlocks.length; i += 1) {
      blocksWithBridges.push(sectionBlocks[i]);
      if (i < bridges.length) {
        blocksWithBridges.push("────────");
        blocksWithBridges.push("◇ " + bridges[i]);
        blocksWithBridges.push("");
      }
    }

    return [
      "【Kindle章素材プレビュー】（章ドラフト寄り）",
      styleHint,
      "",
      "章タイトル: " + material.chapterTitle,
      "章テーマ（束ねた見出し）: " + material.chapterTheme,
      "",
      "■ 章の導入",
      material.chapterIntroDraft,
      "",
      "■ 状況フック（参考・各節の抜粋）",
      material.chapterHook,
      "",
      "■ 節の並びと接続",
      blocksWithBridges.join("\n").trim() || "（節素材なし）",
      "",
      "■ 章末の短いまとめ",
      material.chapterClosing,
      "",
      "──── 章構成メモ（互換・目次向け） ────",
      "節タイトル一覧:",
      sectionTitles.join("\n") || "（節素材なし）",
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

  function isBookMaterial(source) {
    return !!(
      source &&
      typeof source === "object" &&
      typeof source.bookTitle === "string" &&
      Array.isArray(source.chapterMaterials)
    );
  }

  function normalizeDraftBook(bookOrInputs, options) {
    if (isBookMaterial(bookOrInputs)) {
      return bookOrInputs;
    }
    if (Array.isArray(bookOrInputs)) {
      return buildKindleBookMaterial(bookOrInputs, options || {});
    }
    if (bookOrInputs && Array.isArray(bookOrInputs.chapters)) {
      return buildKindleBookMaterial(bookOrInputs.chapters, bookOrInputs.options || options || {});
    }
    if (bookOrInputs && Array.isArray(bookOrInputs.inputs)) {
      return buildKindleBookMaterial(bookOrInputs.inputs, bookOrInputs.options || options || {});
    }
    if (!bookOrInputs) {
      return buildKindleBookMaterial([], options || {});
    }
    return buildKindleBookMaterial([bookOrInputs], options || {});
  }

  function buildDraftTitle(bookMaterial, options) {
    const optionTitle = compactSpaces(options && options.draftTitle);
    if (optionTitle) {
      return optionTitle;
    }
    const base = compactSpaces(bookMaterial && bookMaterial.bookTitle);
    if (!base) {
      return "AI武装親方｜本文骨子";
    }
    if (base.indexOf("本文骨子") >= 0) {
      return base;
    }
    return base + "｜本文骨子";
  }

  function buildKeyMessage(bookMaterial, options) {
    const optionMessage = compactSpaces(options && options.keyMessage);
    if (optionMessage) {
      return optionMessage;
    }
    const insights = (bookMaterial && bookMaterial.keyInsights) || [];
    const first = compactSpaces(insights[0] || "");
    const second = compactSpaces(insights[1] || "");
    if (first && second) {
      return first + " / " + second;
    }
    if (first) {
      return first;
    }
    return "現場で再利用できる学びを、章単位で積み上げる。";
  }

  function buildChapterOutlineFromMaterial(chapter, index) {
    const chapterTitle = compactSpaces(chapter && chapter.chapterTitle) || "第" + (index + 1).toString() + "章";
    const chapterPurpose =
      compactSpaces(chapter && chapter.chapterTheme) || "現場改善";
    const openingHook = compactSpaces(chapter && chapter.chapterHook) || "導入フック: 章骨子を準備中。";
    const sectionFlow = Array.isArray(chapter && chapter.chapterOutline)
      ? chapter.chapterOutline.filter(function (line) {
          return compactSpaces(line);
        })
      : [];
    const takeaway = ensureActionEnding(
      compactSpaces((chapter && chapter.chapterKeyTakeaways && chapter.chapterKeyTakeaways[0]) || "")
    );

    return {
      chapterTitle: chapterTitle,
      chapterPurpose: chapterPurpose + "を現場で再利用できる形に整理する。",
      openingHook: openingHook,
      sectionFlow: sectionFlow,
      takeaway: takeaway,
    };
  }

  function buildKindleDraftOutline(bookOrInputs, options) {
    const material = normalizeDraftBook(bookOrInputs, options || {});
    const chapterMaterials = Array.isArray(material.chapterMaterials) ? material.chapterMaterials : [];
    const draftTheme = compactSpaces((options && options.draftTheme) || material.bookTheme) || "現場改善";
    const draftTitle = buildDraftTitle(material, options || {});
    const introOutline = compactSpaces((options && options.introOutline) || material.introductionOutline) ||
      "はじめに: 本文骨子を準備中。";
    const chapterOutlines = chapterMaterials.map(function (chapter, index) {
      return buildChapterOutlineFromMaterial(chapter, index);
    });
    const closingOutline =
      compactSpaces((options && options.closingOutline) || material.endingOutline) ||
      "まとめ: 章ごとの学びを次の現場へ接続する。";
    const keyMessage = buildKeyMessage(material, options || {});

    return {
      draftTitle: draftTitle,
      draftTheme: draftTheme,
      introOutline: introOutline,
      chapterOutlines: chapterOutlines,
      closingOutline: closingOutline,
      keyMessage: keyMessage,
      sourceSummary: material.sourceSummary || [],
    };
  }

  function buildKindleDraftOutlinePreview(bookOrInputs, options) {
    const outline = buildKindleDraftOutline(bookOrInputs, options);
    const chapterLines = (outline.chapterOutlines || []).map(function (chapter, index) {
      const sectionLines = (chapter.sectionFlow || []).map(function (flow, flowIndex) {
        return "    " + (flowIndex + 1).toString() + ". " + flow;
      });
      return [
        (index + 1).toString() + ". " + chapter.chapterTitle,
        "  - 章の目的: " + chapter.chapterPurpose,
        "  - 導入フック: " + chapter.openingHook,
        "  - 節の流れ:",
        sectionLines.join("\n") || "    （節の流れなし）",
        "  - 章の締め: " + chapter.takeaway,
      ].join("\n");
    });

    return [
      "【Kindle本文骨子プレビュー】",
      "仮タイトル: " + outline.draftTitle,
      "テーマ: " + outline.draftTheme,
      "",
      "はじめにの骨子:",
      outline.introOutline,
      "",
      "各章の骨子一覧:",
      chapterLines.join("\n\n") || "（章骨子なし）",
      "",
      "まとめの骨子:",
      outline.closingOutline,
      "",
      "この本で一番伝えたいこと:",
      outline.keyMessage,
    ].join("\n");
  }

  function isDraftOutline(source) {
    return !!(
      source &&
      typeof source === "object" &&
      typeof source.draftTitle === "string" &&
      typeof source.introOutline === "string" &&
      Array.isArray(source.chapterOutlines)
    );
  }

  function ensureSentenceEnding(text, fallback) {
    const normalized = compactSpaces(text);
    if (!normalized) {
      return compactSpaces(fallback) || "";
    }
    if (/[。！？!?]$/.test(normalized)) {
      return normalized;
    }
    return normalized + "。";
  }

  function removeLeadingLabel(text, label) {
    const normalized = compactSpaces(text);
    if (!normalized) {
      return "";
    }
    const pattern = new RegExp("^" + label + "\\s*[:：]\\s*");
    return normalized.replace(pattern, "");
  }

  function normalizeDraftSource(draftOrBookOrInputs, options) {
    if (isDraftOutline(draftOrBookOrInputs)) {
      return draftOrBookOrInputs;
    }
    return buildKindleDraftOutline(draftOrBookOrInputs, options || {});
  }

  function summarizeSectionFlowLine(line) {
    const normalized = compactSpaces(line);
    if (!normalized) {
      return "";
    }
    const colonIndex = normalized.indexOf(":");
    if (colonIndex < 0) {
      return normalized;
    }
    return compactSpaces(normalized.slice(colonIndex + 1));
  }

  function buildIntroDraft(outline) {
    const intro = ensureSentenceEnding(
      compactSpaces(outline && outline.introOutline),
      "はじめに: 本文たたき台を準備中。"
    );
    return intro + " 各章で現場に再利用できる進め方を、短い流れで具体化する。";
  }

  function buildChapterBodyDraft(sectionFlow) {
    const flowList = Array.isArray(sectionFlow) ? sectionFlow : [];
    if (!flowList.length) {
      return "本文の流れは準備中。章の目的に沿って要点を順に具体化する。";
    }

    const sentences = flowList
      .map(function (line, index) {
        const summary = summarizeSectionFlowLine(line) || "要点を整理する";
        if (index === 0) {
          return ensureSentenceEnding("まず、" + summary, "まず、要点を整理する。");
        }
        if (index === flowList.length - 1) {
          return ensureSentenceEnding("最後に、" + summary, "最後に、要点を整理する。");
        }
        return ensureSentenceEnding("次に、" + summary, "次に、要点を整理する。");
      })
      .filter(Boolean);

    return sentences.join(" ");
  }

  function buildChapterDraftFromOutline(chapterOutline, index) {
    const title =
      compactSpaces(chapterOutline && chapterOutline.chapterTitle) || "第" + (index + 1).toString() + "章";
    const purposeText =
      compactSpaces(chapterOutline && chapterOutline.chapterPurpose) || "現場改善を再利用可能な形に整理する。";
    const hookText = removeLeadingLabel(chapterOutline && chapterOutline.openingHook, "導入フック");
    const openingHook = ensureSentenceEnding(hookText, "章の導入を準備中。");
    const chapterPurpose = ensureSentenceEnding(purposeText, "現場改善を再利用可能な形に整理する。");
    const takeaway = ensureActionEnding(compactSpaces(chapterOutline && chapterOutline.takeaway));
    const bodyDraft = buildChapterBodyDraft(chapterOutline && chapterOutline.sectionFlow);

    return {
      chapterTitle: title,
      chapterPurpose: chapterPurpose,
      openingParagraph: openingHook + " この章では" + chapterPurpose.replace(/[。！？!?]+$/, "") + "。",
      bodyDraft: bodyDraft,
      closingParagraph: takeaway + " この学びを次の現場へ接続する。",
      takeaway: takeaway,
    };
  }

  function buildClosingDraft(outline) {
    const closing = ensureSentenceEnding(
      compactSpaces(outline && outline.closingOutline),
      "まとめ: 章ごとのたたき台を統合し、次の現場で再利用する。"
    );
    return closing + " 本文化の際は、章ごとの流れを保ったまま具体例を補う。";
  }

  function buildKindleChapterDrafts(draftOrBookOrInputs, options) {
    const outline = normalizeDraftSource(draftOrBookOrInputs, options || {});
    const chapterOutlines = Array.isArray(outline && outline.chapterOutlines) ? outline.chapterOutlines : [];
    const introDraft = compactSpaces(options && options.introDraft) || buildIntroDraft(outline);
    const closingDraft = compactSpaces(options && options.closingDraft) || buildClosingDraft(outline);

    return {
      draftTitle: compactSpaces(outline && outline.draftTitle) || "AI武装親方｜章本文たたき台",
      draftTheme: compactSpaces(outline && outline.draftTheme) || "現場改善",
      introDraft: introDraft,
      chapterDrafts: chapterOutlines.map(function (chapterOutline, index) {
        return buildChapterDraftFromOutline(chapterOutline, index);
      }),
      closingDraft: closingDraft,
      keyMessage:
        compactSpaces((options && options.keyMessage) || (outline && outline.keyMessage)) ||
        "現場で再利用できる学びを、章ごとに積み上げる。",
      sourceSummary: (outline && outline.sourceSummary) || [],
    };
  }

  function buildKindleChapterDraftsPreview(draftOrBookOrInputs, options) {
    const drafts = buildKindleChapterDrafts(draftOrBookOrInputs, options);
    const chapterLines = (drafts.chapterDrafts || []).map(function (chapter, index) {
      return [
        (index + 1).toString() + ". " + chapter.chapterTitle,
        "  章の目的: " + chapter.chapterPurpose,
        "  導入段落:",
        "  " + chapter.openingParagraph,
        "  本文たたき台:",
        "  " + chapter.bodyDraft,
        "  章末段落:",
        "  " + chapter.closingParagraph,
        "  要点:",
        "  " + chapter.takeaway,
      ].join("\n");
    });

    return [
      "【Kindle章本文たたき台プレビュー】",
      "仮タイトル: " + drafts.draftTitle,
      "テーマ: " + drafts.draftTheme,
      "",
      "はじめにのたたき台:",
      drafts.introDraft,
      "",
      "各章の本文たたき台:",
      chapterLines.join("\n\n") || "（章本文たたき台なし）",
      "",
      "まとめのたたき台:",
      drafts.closingDraft,
      "",
      "この本で一番伝えたいこと:",
      drafts.keyMessage,
    ].join("\n");
  }

  function isChapterDrafts(source) {
    return !!(
      source &&
      typeof source === "object" &&
      typeof source.draftTitle === "string" &&
      typeof source.introDraft === "string" &&
      Array.isArray(source.chapterDrafts)
    );
  }

  function buildChapterDraftText(chapter, index) {
    const chapterTitle =
      compactSpaces(chapter && chapter.chapterTitle) || "第" + (index + 1).toString() + "章";
    const opening = ensureSentenceEnding(
      compactSpaces(chapter && chapter.openingParagraph),
      "導入段落を準備中。"
    );
    const body = ensureSentenceEnding(
      compactSpaces(chapter && chapter.bodyDraft),
      "本文たたき台を準備中。"
    );
    const closing = ensureSentenceEnding(
      compactSpaces(chapter && chapter.closingParagraph),
      "章末段落を準備中。"
    );

    return [
      "【" + chapterTitle + "】",
      opening,
      body,
      closing,
    ].join("\n");
  }

  function normalizeFullDraftSource(chapterDraftsOrDraftOrBookOrInputs, options) {
    if (isChapterDrafts(chapterDraftsOrDraftOrBookOrInputs)) {
      return chapterDraftsOrDraftOrBookOrInputs;
    }
    return buildKindleChapterDrafts(chapterDraftsOrDraftOrBookOrInputs, options || {});
  }

  function buildFullDraftText(material) {
    const chapters = Array.isArray(material && material.chapterDrafts) ? material.chapterDrafts : [];
    const chapterTexts = chapters.map(function (chapter, index) {
      return buildChapterDraftText(chapter, index);
    });

    return [
      compactSpaces(material && material.draftTitle) || "AI武装親方｜全体原稿たたき台",
      "",
      "【はじめに】",
      ensureSentenceEnding(compactSpaces(material && material.introDraft), "はじめにを準備中。"),
      "",
      chapterTexts.join("\n\n") || "【各章本文】\n章本文を準備中。",
      "",
      "【おわりに】",
      ensureSentenceEnding(compactSpaces(material && material.closingDraft), "おわりにを準備中。"),
    ].join("\n");
  }

  function buildKindleFullDraft(chapterDraftsOrDraftOrBookOrInputs, options) {
    const normalized = normalizeFullDraftSource(chapterDraftsOrDraftOrBookOrInputs, options || {});
    const chapterDrafts = Array.isArray(normalized && normalized.chapterDrafts) ? normalized.chapterDrafts : [];
    const fullDraft = {
      draftTitle: compactSpaces((options && options.draftTitle) || (normalized && normalized.draftTitle)) ||
        "AI武装親方｜全体原稿たたき台",
      draftTheme: compactSpaces((options && options.draftTheme) || (normalized && normalized.draftTheme)) ||
        "現場改善",
      introDraft: compactSpaces((options && options.introDraft) || (normalized && normalized.introDraft)) ||
        "はじめにを準備中。",
      chapterDrafts: chapterDrafts,
      closingDraft: compactSpaces((options && options.closingDraft) || (normalized && normalized.closingDraft)) ||
        "おわりにを準備中。",
      keyMessage:
        compactSpaces((options && options.keyMessage) || (normalized && normalized.keyMessage)) ||
        "現場で再利用できる学びを、章ごとに積み上げる。",
      sourceSummary: (normalized && normalized.sourceSummary) || [],
    };

    return {
      draftTitle: fullDraft.draftTitle,
      draftTheme: fullDraft.draftTheme,
      introDraft: fullDraft.introDraft,
      chapterDrafts: fullDraft.chapterDrafts,
      closingDraft: fullDraft.closingDraft,
      fullDraftText: buildFullDraftText(fullDraft),
      keyMessage: fullDraft.keyMessage,
      sourceSummary: fullDraft.sourceSummary,
    };
  }

  function buildKindleFullDraftPreview(chapterDraftsOrDraftOrBookOrInputs, options) {
    const draft = buildKindleFullDraft(chapterDraftsOrDraftOrBookOrInputs, options);
    const chapterBlocks = (draft.chapterDrafts || []).map(function (chapter, index) {
      return buildChapterDraftText(chapter, index);
    });

    return [
      "【Kindle全体原稿たたき台プレビュー】",
      "仮タイトル: " + draft.draftTitle,
      "テーマ: " + draft.draftTheme,
      "",
      "はじめに:",
      ensureSentenceEnding(draft.introDraft, "はじめにを準備中。"),
      "",
      "各章の本文:",
      chapterBlocks.join("\n\n") || "（章本文なし）",
      "",
      "おわりに:",
      ensureSentenceEnding(draft.closingDraft, "おわりにを準備中。"),
      "",
      "この本で一番伝えたいこと:",
      draft.keyMessage,
    ].join("\n");
  }

  function isFullDraft(source) {
    return !!(
      source &&
      typeof source === "object" &&
      typeof source.draftTitle === "string" &&
      typeof source.introDraft === "string" &&
      typeof source.closingDraft === "string" &&
      Array.isArray(source.chapterDrafts)
    );
  }

  function toManuscriptTitle(fullDraft) {
    const title = compactSpaces(fullDraft && fullDraft.draftTitle);
    if (!title) {
      return "AI武装親方｜完成原稿寄り";
    }
    if (title.indexOf("全体原稿たたき台") >= 0) {
      return title.replace("全体原稿たたき台", "完成原稿寄り");
    }
    return title + "｜完成原稿寄り";
  }

  function normalizeManuscriptSource(fullDraftOrInputs, options) {
    if (isFullDraft(fullDraftOrInputs)) {
      return fullDraftOrInputs;
    }
    return buildKindleFullDraft(fullDraftOrInputs, options || {});
  }

  function buildManuscriptChapter(chapterDraft, index) {
    const title = compactSpaces(chapterDraft && chapterDraft.chapterTitle) || "第" + (index + 1).toString() + "章";
    const opening = ensureSentenceEnding(
      compactSpaces(chapterDraft && chapterDraft.openingParagraph),
      "導入段落を準備中。"
    );
    let body = ensureSentenceEnding(
      compactSpaces(chapterDraft && chapterDraft.bodyDraft),
      "本文を準備中。"
    );
    const closing = ensureSentenceEnding(
      compactSpaces(chapterDraft && chapterDraft.closingParagraph),
      "章末段落を準備中。"
    );
    if (compactSpaces(body).length < 24) {
      body = body + " 実務で使う場面を短く想定し、次の一手につなげる。";
    }
    const takeaway = ensureActionEnding(compactSpaces(chapterDraft && chapterDraft.takeaway));
    const chapterText = normalizeManuscriptSpacing([opening, body, closing].join("\n\n"));

    return {
      chapterTitle: title,
      chapterText: chapterText,
      takeaway: takeaway,
    };
  }

  function normalizeManuscriptSpacing(text) {
    return (text || "")
      .toString()
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function buildManuscriptText(manuscript) {
    const chapterBlocks = (manuscript.chapters || []).map(function (chapter, index) {
      const chapterTitle = compactSpaces(chapter && chapter.chapterTitle) || "第" + (index + 1).toString() + "章";
      const chapterText = normalizeManuscriptSpacing(chapter && chapter.chapterText);
      return [
        "第" + (index + 1).toString() + "章 " + chapterTitle,
        "",
        chapterText || "本文を準備中。",
      ].join("\n");
    });

    return normalizeManuscriptSpacing([
      manuscript.manuscriptTitle,
      "",
      "はじめに",
      manuscript.introduction,
      "",
      chapterBlocks.join("\n\n") || "各章\n本文を準備中。",
      "",
      "おわりに",
      manuscript.conclusion,
    ].join("\n"));
  }

  function buildKindleManuscript(fullDraftOrInputs, options) {
    const normalized = normalizeManuscriptSource(fullDraftOrInputs, options || {});
    const chapterDrafts = Array.isArray(normalized && normalized.chapterDrafts) ? normalized.chapterDrafts : [];
    const chapters = chapterDrafts.map(function (chapterDraft, index) {
      return buildManuscriptChapter(chapterDraft, index);
    });
    const introduction = ensureSentenceEnding(
      compactSpaces((options && options.introduction) || (normalized && normalized.introDraft)),
      "はじめにを準備中。"
    );
    const conclusion = ensureSentenceEnding(
      compactSpaces((options && options.conclusion) || (normalized && normalized.closingDraft)),
      "おわりにを準備中。"
    );
    const manuscript = {
      manuscriptTitle: compactSpaces((options && options.manuscriptTitle) || toManuscriptTitle(normalized)),
      manuscriptTheme: compactSpaces((options && options.manuscriptTheme) || (normalized && normalized.draftTheme)) || "現場改善",
      introduction: introduction,
      chapters: chapters,
      conclusion: conclusion,
      keyMessage:
        compactSpaces((options && options.keyMessage) || (normalized && normalized.keyMessage)) ||
        "現場で再利用できる学びを、章ごとに積み上げる。",
      sourceSummary: (normalized && normalized.sourceSummary) || [],
    };

    return {
      manuscriptTitle: manuscript.manuscriptTitle,
      manuscriptTheme: manuscript.manuscriptTheme,
      introduction: manuscript.introduction,
      chapters: manuscript.chapters,
      conclusion: manuscript.conclusion,
      manuscriptText: buildManuscriptText(manuscript),
      keyMessage: manuscript.keyMessage,
      sourceSummary: manuscript.sourceSummary,
    };
  }

  function buildKindleManuscriptPreview(fullDraftOrInputs, options) {
    const manuscript = buildKindleManuscript(fullDraftOrInputs, options);
    const chapterBlocks = (manuscript.chapters || []).map(function (chapter, index) {
      return [
        (index + 1).toString() + ". " + chapter.chapterTitle,
        chapter.chapterText,
        "要点: " + chapter.takeaway,
      ].join("\n");
    });

    return [
      "【Kindle完成原稿寄りプレビュー】",
      "仮タイトル: " + manuscript.manuscriptTitle,
      "テーマ: " + manuscript.manuscriptTheme,
      "",
      "はじめに:",
      manuscript.introduction,
      "",
      "各章の本文:",
      chapterBlocks.join("\n\n") || "（章本文なし）",
      "",
      "おわりに:",
      manuscript.conclusion,
      "",
      "この本で一番伝えたいこと:",
      manuscript.keyMessage,
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
    buildKindleDraftOutline: buildKindleDraftOutline,
    buildKindleDraftOutlinePreview: buildKindleDraftOutlinePreview,
    buildKindleChapterDrafts: buildKindleChapterDrafts,
    buildKindleChapterDraftsPreview: buildKindleChapterDraftsPreview,
    buildKindleFullDraft: buildKindleFullDraft,
    buildKindleFullDraftPreview: buildKindleFullDraftPreview,
    buildKindleManuscript: buildKindleManuscript,
    buildKindleManuscriptPreview: buildKindleManuscriptPreview,
  };
})();
