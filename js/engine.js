(function () {
  const templates = window.AIBusouTemplates;

  const COMIC_PANEL_LABELS = {
    p1: "1コマ目（状況）",
    p2: "2コマ目（違和感）",
    p3: "3コマ目（気づき）",
    p4: "4コマ目（前進）",
  };

  function safeText(value, fallback) {
    return (value || "").toString().trim() || fallback;
  }

  function compactSpaces(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function ensurePeriod(text) {
    if (!text) {
      return "";
    }
    return /[。！？!?]$/.test(text) ? text : text + "。";
  }

  function buildFallbackLearning(incident) {
    const normalizedIncident = compactSpaces(incident);
    if (normalizedIncident.indexOf("口コミ") >= 0 || normalizedIncident.indexOf("レビュー") >= 0) {
      return "満足と口コミは別。導線が要る、という感覚を学びとして残す。";
    }
    if (normalizedIncident.indexOf("改善") >= 0) {
      return "短文入力でも、改善点を一つ具体化して次の現場で試す。";
    }
    if (normalizedIncident.indexOf("確認") >= 0 || normalizedIncident.indexOf("漏れ") >= 0) {
      return "確認漏れは、作業前の声かけ一つで減らせる。";
    }
    return "短い確認でも、先に共通認識を作るとズレが減る。";
  }

  function deriveIncidentFromCore(theme, coreMain, coreConclusion) {
    const bundle = compactSpaces(theme + " " + coreMain + " " + coreConclusion);
    const lower = bundle.toLowerCase();
    if (lower.indexOf("口コミ") >= 0 || lower.indexOf("レビュー") >= 0) {
      return "関係は良くなった。喜んでもらえた。それでも口コミの導線は動かなかった。";
    }
    const stem = coreMain || coreConclusion || theme;
    if (!stem) {
      return "作業前の認識がそろわず、手戻りが出た。";
    }
    const clipped = stem.length > 96 ? stem.slice(0, 96) + "…" : stem;
    return ensurePeriod(clipped + "——という文脈で、現場の断片が残った。");
  }

  function ensureLearningText(text, incident) {
    const trimmed = compactSpaces(text);
    if (!trimmed) {
      return buildFallbackLearning(incident);
    }
    if (trimmed.length < 6) {
      return `${trimmed}を開始前チェックに落とし込み、次の現場でも再現する。`;
    }
    if (trimmed.length < 10) {
      return ensurePeriod(trimmed) + " 次の現場でも同じ手順で再現する。";
    }
    return ensurePeriod(trimmed);
  }

  function ensureIncidentText(text) {
    const trimmed = compactSpaces(text);
    if (!trimmed) {
      return "作業前の認識がそろわず、手戻りが出た。";
    }
    if (trimmed.length < 16) {
      return ensurePeriod(trimmed) + " その結果、作業の流れに迷いが生まれた。";
    }
    return ensurePeriod(trimmed);
  }

  function normalizeCharacters(text) {
    const raw = compactSpaces(text);
    if (!raw) {
      return "照屋親方、コパイロット";
    }
    const hasOykata = raw.indexOf("照屋親方") >= 0;
    const hasCopilot = raw.indexOf("コパイロット") >= 0;
    if (hasOykata && hasCopilot) {
      return raw;
    }
    return raw + "、照屋親方、コパイロット";
  }

  function selectComicPattern(incident, learning) {
    const source = (incident + " " + learning).toLowerCase();
    const patterns = templates.comicPatterns;
    const names = Object.keys(patterns);

    if (source.indexOf("確認漏れ") >= 0 || source.indexOf("漏れ") >= 0) {
      return "誤解型";
    }

    // Priority rules for known weak cases:
    // - TC-06: reflective context should stay awareness even if "ミス" appears.
    if (
      source.indexOf("読み合わせ") >= 0 ||
      source.indexOf("過去ログ") >= 0 ||
      source.indexOf("予兆") >= 0
    ) {
      return "気づき型";
    }
    // - TC-05/07: safety or congestion context should prefer close-call flow.
    if (
      source.indexOf("詰まり") >= 0 ||
      source.indexOf("重なり") >= 0 ||
      source.indexOf("搬入") >= 0 ||
      source.indexOf("足場") >= 0 ||
      source.indexOf("焦って") >= 0
    ) {
      return "ヒヤリ型";
    }

    for (let i = 0; i < names.length; i += 1) {
      const name = names[i];
      const keywords = patterns[name].keywords;
      for (let j = 0; j < keywords.length; j += 1) {
        if (source.indexOf(keywords[j].toLowerCase()) >= 0) {
          return name;
        }
      }
    }

    return "気づき型";
  }

  function trimOptional(value) {
    return compactSpaces(value || "");
  }

  function resolveOutputStyle(raw) {
    const s = compactSpaces(raw || "");
    if (s === "note" || s === "comic" || s === "kindle") {
      return s;
    }
    return "";
  }

  function resolveNotePreset(raw) {
    const s = compactSpaces(raw || "");
    if (s === "strong" || s === "soft" || s === "biz") {
      return s;
    }
    return "";
  }

  function stripDuplicateTitlePrefix(themeRaw) {
    let theme = (themeRaw || "").trim() || "現場の小さな改善";
    const prefix = templates.characterProfile.titlePrefix;
    while (theme.indexOf(prefix) === 0) {
      theme = theme.slice(prefix.length).trim();
    }
    return theme || "現場の小さな改善";
  }

  function normalizeInput(input) {
    const tone = templates.toneTemplates[input.tone] ? input.tone : "ゆるい";
    const theme = stripDuplicateTitlePrefix(safeText(input.theme, "").trim() || "現場の小さな改善");
    const coreMain = trimOptional(input.coreMain);
    const corePhrase = trimOptional(input.corePhrase);
    const coreConclusion = trimOptional(input.coreConclusion);
    const hasCoreLocks = !!(coreMain || corePhrase || coreConclusion);

    let incident = ensureIncidentText(input.incident);
    if (!trimOptional(input.incident) && (coreMain || coreConclusion)) {
      incident = deriveIncidentFromCore(theme, coreMain, coreConclusion);
    }

    let learning;
    if (trimOptional(input.learning)) {
      learning = ensureLearningText(input.learning, incident);
    } else {
      learning = ensureLearningText("", incident);
    }

    const characters = normalizeCharacters(input.characters);
    const patternSource = compactSpaces(incident + " " + coreMain + " " + corePhrase + " " + coreConclusion);
    const comicPattern = selectComicPattern(patternSource, learning);
    const inputSparse =
      !compactSpaces(input.theme) ||
      !compactSpaces(input.characters) ||
      compactSpaces(input.incident).length < 10 ||
      compactSpaces(input.learning).length < 6;
    const learningFocus =
      comicPattern === "誤解型"
        ? "短文・空欄入力でも、確認の要点を一つに絞って学びとして残す。"
        : "入力が短くても、改善点を一つ具体化して次の現場につなげる。";
    const outputStyle = resolveOutputStyle(input && input.outputStyle);
    const notePreset = resolveNotePreset(input && input.notePreset);

    return {
      theme,
      incident,
      learning,
      characters,
      tone,
      comicPattern,
      inputSparse,
      learningFocus,
      coreMain,
      corePhrase,
      coreConclusion,
      hasCoreLocks,
      outputStyle,
      notePreset,
    };
  }

  function isReviewComicContext(normalized) {
    const src = (normalized.theme + " " + normalized.incident).toLowerCase();
    return src.indexOf("口コミ") >= 0 || src.indexOf("レビュー") >= 0;
  }

  function shortComicSceneLines(pattern, reviewMode) {
    if (reviewMode) {
      return {
        p2: "仲は良い。でも口コミは来ない。",
        p3: "満足と、行動は別。気づく。",
        p4: "満足直後に、導線を置く。一歩前へ。",
      };
    }
    const m = {
      誤解型: {
        p2: "伝わってない。前提がズレる。",
        p3: "言葉で起点を揃える。",
        p4: "小さな確認で、次の一歩へ。",
      },
      ヒヤリ型: {
        p2: "一瞬の油断で、空気が張る。",
        p3: "止めて、手順を見直す。",
        p4: "急がないほうが、結果的に早い。",
      },
      気づき型: {
        p2: "小さなズレが、じわじわ効く。",
        p3: "小さな工夫で、リズムが戻る。",
        p4: "改善を積む。明日の余裕が増える。",
      },
    };
    const row = m[pattern.name];
    if (row) {
      return row;
    }
    return {
      p2: pattern.panel2,
      p3: pattern.panel3,
      p4: pattern.panel4,
    };
  }

  function microComicSceneLines(pattern, reviewMode) {
    if (reviewMode) {
      return {
        p2: "仲は良い。口コミは来ない。",
        p3: "満足と行動は別。",
        p4: "導線を置く。",
      };
    }
    const m = {
      誤解型: {
        p2: "前提がズレる。",
        p3: "言葉で揃える。",
        p4: "確認で次へ。",
      },
      ヒヤリ型: {
        p2: "油断で空気が張る。",
        p3: "止めて見直す。",
        p4: "急がないほうが早い。",
      },
      気づき型: {
        p2: "小さなズレが効く。",
        p3: "工夫でリズムが戻る。",
        p4: "改善を積む。",
      },
    };
    const row = m[pattern.name];
    if (row) {
      return row;
    }
    return {
      p2: pattern.panel2,
      p3: pattern.panel3,
      p4: pattern.panel4,
    };
  }

  function selectComicScenesForStyle(pattern, reviewMode, style) {
    if (style === "kindle") {
      if (reviewMode) {
        return {
          p2: "仲は良い。でも口コミやアンケートにはつながらない。",
          p3: "満足と、行動は別だと気づく。",
          p4: "満足直後に短い導線を置く。次の一歩に進む。",
        };
      }
      return {
        p2: pattern.panel2,
        p3: pattern.panel3,
        p4: pattern.panel4,
      };
    }
    if (style === "note") {
      return microComicSceneLines(pattern, reviewMode);
    }
    return shortComicSceneLines(pattern, reviewMode);
  }

  function comicPanel3Dialogue(toneData, protagonist, partner, style) {
    if (style === "kindle") {
      const oyk = compactSpaces(toneData.oykataLine + toneData.lineEnd);
      const ptr = compactSpaces(toneData.copilotReaction);
      const copLong = compactSpaces(toneData.copilotQuestion);
      if (toneData.copilotRole === "lead") {
        return [`${partner}: ${copLong}`, `${protagonist}: ${oyk}`];
      }
      if (toneData.copilotRole === "low") {
        return [`${protagonist}: ${oyk}`, `${partner}: ${ptr}`];
      }
      return [`${protagonist}: ${oyk}`, `${partner}: ${ptr}`];
    }
    const oyk = compactSpaces(toneData.oykataShort || toneData.oykataLine);
    const ptr = compactSpaces(toneData.partnerShort || toneData.copilotReaction);
    const copShort = compactSpaces(toneData.copilotShort || toneData.copilotQuestion);
    if (toneData.copilotRole === "lead") {
      return [`${partner}: ${copShort}`, `${protagonist}: ${oyk}`];
    }
    if (toneData.copilotRole === "low") {
      return [`${protagonist}: ${oyk}`, `${partner}: ${ptr}`];
    }
    return [`${protagonist}: ${oyk}`, `${partner}: ${ptr}`];
  }

  function comicPanel2PartnerLine(normalized, toneData, partner, style) {
    if (normalized.corePhrase) {
      return `${partner}: 「${normalized.corePhrase}」`;
    }
    if (style === "kindle") {
      return `${partner}: ${toneData.copilotQuestion}`;
    }
    return `${partner}: ${toneData.copilotShort || toneData.copilotQuestion}`;
  }

  function getComicPanelMetaForExtraction() {
    return [
      { number: 1, start: COMIC_PANEL_LABELS.p1, next: COMIC_PANEL_LABELS.p2, name: "状況" },
      { number: 2, start: COMIC_PANEL_LABELS.p2, next: COMIC_PANEL_LABELS.p3, name: "違和感" },
      { number: 3, start: COMIC_PANEL_LABELS.p3, next: COMIC_PANEL_LABELS.p4, name: "気づき" },
      { number: 4, start: COMIC_PANEL_LABELS.p4, next: "", name: "前進" },
    ];
  }

  function buildComic(input) {
    const normalized = normalizeInput(input);
    const toneData = templates.toneTemplates[normalized.tone];
    const pattern = templates.comicPatterns[normalized.comicPattern];
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const protagonist = templates.characterProfile.protagonist.name;
    const partner = templates.characterProfile.partner.name;
    const reviewMode = isReviewComicContext(normalized);
    const rawInc = trimOptional(input.incident);
    const incidentForComic = rawInc ? ensurePeriod(rawInc) : normalized.incident;
    const st = normalized.outputStyle;
    const scenes = selectComicScenesForStyle(pattern, reviewMode, st);
    const panel3Conversation = comicPanel3Dialogue(toneData, protagonist, partner, st);
    const panel2PartnerLine = comicPanel2PartnerLine(normalized, toneData, partner, st);
    const learningForPanel4 = normalized.coreConclusion || normalized.learning;

    const panel1Lines = [COMIC_PANEL_LABELS.p1];
    if (normalized.coreMain && !reviewMode) {
      panel1Lines.push(normalized.coreMain);
    }
    panel1Lines.push(`状況: ${incidentForComic}`);

    const panel3Lines = [COMIC_PANEL_LABELS.p3];
    if (reviewMode && normalized.coreMain) {
      panel3Lines.push(normalized.coreMain);
    }
    panel3Lines.push(scenes.p3);
    panel3Lines.push(panel3Conversation[0]);
    panel3Lines.push(panel3Conversation[1]);

    return [
      `【タイトル】${leadTitle}`,
      "",
      panel1Lines.join("\n"),
      "",
      COMIC_PANEL_LABELS.p2,
      scenes.p2,
      panel2PartnerLine,
      "",
      panel3Lines.join("\n"),
      "",
      COMIC_PANEL_LABELS.p4,
      `学び: ${learningForPanel4}`,
      scenes.p4,
    ].join("\n");
  }

  function extractComicPanelBlock(comicText, panelStartLabel, nextPanelStartLabel) {
    const lines = (comicText || "").split("\n");
    const startIndex = lines.findIndex(function (line) {
      return line.indexOf(panelStartLabel) === 0;
    });
    if (startIndex < 0) {
      return [];
    }
    let endIndex = lines.length;
    if (nextPanelStartLabel) {
      const nextIndex = lines.findIndex(function (line, index) {
        return index > startIndex && line.indexOf(nextPanelStartLabel) === 0;
      });
      if (nextIndex > startIndex) {
        endIndex = nextIndex;
      }
    }
    return lines
      .slice(startIndex + 1, endIndex)
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);
  }

  function pickFirstLineStartWith(lines, prefix) {
    const found = (lines || []).find(function (line) {
      return line.indexOf(prefix) === 0;
    });
    return found || "";
  }

  function buildPanelPrompt(panelNumber, panelName, lines, normalized, styleGuide) {
    const protagonist = templates.characterProfile.protagonist.name;
    const partner = templates.characterProfile.partner.name;
    const characters = normalized.characters || `${protagonist}、${partner}`;
    const situation = pickFirstLineStartWith(lines, "状況:");
    const narrativeLines = (lines || []).filter(function (line) {
      return line.indexOf("状況:") !== 0 && line.indexOf(`${protagonist}:`) !== 0 && line.indexOf(`${partner}:`) !== 0;
    });
    const dialogueLines = (lines || []).filter(function (line) {
      return line.indexOf(`${protagonist}:`) === 0 || line.indexOf(`${partner}:`) === 0;
    });

    const expressionByPanel = {
      1: "状況を受け止める表情、落ち着いた雰囲気",
      2: "違和感が少し出る表情",
      3: "気づきが生まれる真剣な表情",
      4: "納得して前を向く表情",
    };
    const compositionByPanel = {
      1: "中景、状況が伝わるカット",
      2: "やや寄り、ズレや違和感が分かる構図",
      3: "会話が読み取りやすい対話構図",
      4: "引き気味、前進で締める安定構図",
    };

    return [
      `コマ${panelNumber}:`,
      `- シーン説明: ${panelName}。${situation || narrativeLines.join(" ") || "現場の流れを説明するシーン。"}`,
      `- キャラ: ${characters}`,
      `- 表情: ${expressionByPanel[panelNumber]}`,
      "- 背景: 白ベース、最小限の現場要素（工具・資材・簡易線）",
      `- 構図: ${compositionByPanel[panelNumber]}`,
      `- セリフ: ${dialogueLines.join(" / ") || "ナレーション中心、短文で要点を示す。"}`,
      `- 絵柄共通指定: ${styleGuide}`,
    ].join("\n");
  }

  function buildComicPanelPrompts(input) {
    const normalized = normalizeInput(input);
    const comicText = buildComic(input);
    const styleGuide = templates.characterProfile.comicStyle.join("、");
    const panelMeta = getComicPanelMetaForExtraction();

    const panelBlocks = panelMeta.map(function (meta) {
      const lines = extractComicPanelBlock(comicText, meta.start, meta.next);
      return buildPanelPrompt(meta.number, meta.name, lines, normalized, styleGuide);
    });

    const lines = ["【4コマ描画プロンプト】"];
    if (normalized.outputStyle) {
      lines.push(`出力スタイル: ${normalized.outputStyle}`);
    }
    lines.push("（既存の4コマ漫画構成を元に生成）", "", panelBlocks.join("\n\n"));
    return lines.join("\n");
  }

  function unifiedStyleHintLine(style) {
    if (style === "note") {
      return "【出力スタイル】note向け: 本文優先。絵は短文の補助（情景は最小限でもよい）。";
    }
    if (style === "comic") {
      return "【出力スタイル】4コマ向け: 情景と短いセリフの気配を優先。伝わる一行を最優先。";
    }
    if (style === "kindle") {
      return "【出力スタイル】Kindle向け: 説明と流れを追える構図を優先（台詞は絵に書かない）。";
    }
    return "";
  }

  function buildUnifiedComicImagePrompt(input) {
    const normalized = normalizeInput(input);
    const comicText = buildComic(input);
    const styleGuide = templates.characterProfile.comicStyle.join("、");
    const protagonist = templates.characterProfile.protagonist.name;
    const partner = templates.characterProfile.partner.name;
    const panelMeta = getComicPanelMetaForExtraction();

    const panelSummaries = panelMeta.map(function (meta) {
      const lines = extractComicPanelBlock(comicText, meta.start, meta.next);
      const situation = pickFirstLineStartWith(lines, "状況:");
      const learningLine = pickFirstLineStartWith(lines, "学び:");
      const dialogueLines = (lines || []).filter(function (line) {
        return line.indexOf(`${protagonist}:`) === 0 || line.indexOf(`${partner}:`) === 0;
      });
      const narrativeLines = (lines || []).filter(function (line) {
        return line.indexOf("状況:") !== 0 && line.indexOf("学び:") !== 0 && line.indexOf(`${protagonist}:`) !== 0 && line.indexOf(`${partner}:`) !== 0;
      });
      const summary = compactSpaces((situation || learningLine || narrativeLines.join(" ") || "要点を簡潔に描写する。").replace(/^状況:\s*/, "").replace(/^学び:\s*/, ""));
      const sceneIntent = dialogueLines.join(" / ") || "表情と構図で短い対話の気配を示す。";
      return `- ${meta.number}コマ目（${meta.name}）: ${summary} / 情景のねらい（絵に文字は出さない）: ${sceneIntent}`;
    });

    const uip = templates.characterProfile.unifiedImagePrompt;
    const archetypeLines =
      uip && uip.panelArchetype && uip.panelArchetype.length
        ? uip.panelArchetype.join("\n")
        : "";
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const styleHint = unifiedStyleHintLine(normalized.outputStyle);

    return [
      "【4コマ統合画像プロンプト】",
      `【入力反映】${leadTitle}`,
      styleHint,
      "これは1枚のポスター・1枚イラスト・全面一枚絵ではない。4コマ漫画（4-panel comic strip）を1枚のキャンバスにまとめた図として描く。",
      "レイアウト必須: 2行×2列（2x2）の等分パネル。各コマは白い枠線または薄い仕切り線で境界をはっきり分け、パネル同士が溶け合わないようにする。",
      "読み順の固定: 左上が1コマ目、右上が2コマ目、左下が3コマ目、右下が4コマ目（日本語の横書きZ字読み）。",
      "ストーリー性: 各コマは起承転結の流れ（状況→違和感→気づき→前進）を担い、4コマ全体で一つの短い出来事として完結する。",
      uip ? `【シリーズテーマ】${uip.seriesTheme}` : "",
      uip ? `【トーン】${uip.businessTone}` : "",
      `キャラクター一貫性: 同じ主人公「${protagonist}」と同じ相棒ロボ「${partner}」を全コマで同じ外見・服装・体型として描く。`,
      uip ? `【主人公の見た目】${uip.protagonistVisual}（名前: ${protagonist}）` : "",
      uip ? `【相棒の見た目】${uip.partnerVisual}（名前: ${partner}）` : "",
      `登場人物: ${normalized.characters}`,
      `絵柄共通指定: ${styleGuide}`,
      "画風: 白黒漫画、ゆるい線、シンプル背景、必要時のみ最小限の現場要素。",
      "画像内に文字・数字・吹き出し・セリフ・キャプション・ロゴを入れない。下の「情景のねらい」は作画の意図のみで、絵に文字として描かない。",
      uip && archetypeLines
        ? "【4コマの流れ（参考骨格：疲れ→混乱→整理→前進）】小道具・背景は入力の出来事に合わせてよいが、感情の流れはこの骨格に沿うこと。"
        : "",
      uip && archetypeLines ? archetypeLines : "",
      "【入力に基づく情景の補足（絵に文字は出さない）】",
      panelSummaries.join("\n"),
    ]
      .concat(buildCoreLockUnifiedLines(normalized))
      .concat([
        "最終指示: 4コマが1枚の漫画レイアウトとして明確に分かれ、読み順が崩れにくい構図にする。1枚イラスト化・ポスター化しない。",
      ])
      .filter(function (line) {
        return line !== "";
      })
      .join("\n");
  }

  function buildCoreLockUnifiedLines(normalized) {
    if (!normalized.hasCoreLocks) {
      return [];
    }
    return [
      "【芯固定（作画は文字にせず、情景・表情・構図で示す）】",
      normalized.coreMain ? `コアメッセージ: ${normalized.coreMain}` : "",
      normalized.corePhrase ? `必須フレーズ（台詞として描かず、情景で示す）: ${normalized.corePhrase}` : "",
      normalized.coreConclusion ? `絶対にズラさない結論（4コマ目で前進・改善へ）: ${normalized.coreConclusion}` : "",
      "現場のリアルな流れ: 状況 → 違和感 → 気づき → 改善。最終コマは必ず改善・前進の印象で締める。",
    ].filter(function (line) {
      return line !== "";
    });
  }

  function reviewOpeningBundle(normalized) {
    return compactSpaces(
      (normalized.theme || "") +
        " " +
        (normalized.incident || "") +
        " " +
        (normalized.coreMain || "") +
        " " +
        (normalized.coreConclusion || "")
    ).toLowerCase();
  }

  function classifyReviewOpeningBranch(bundle) {
    if (bundle.indexOf("満足") >= 0 && bundle.indexOf("口コミ") >= 0) {
      return "satisfactionKuchikomi";
    }
    if (
      bundle.indexOf("仲良く") >= 0 ||
      bundle.indexOf("お客様") >= 0 ||
      bundle.indexOf("お客さん") >= 0 ||
      bundle.indexOf("お客") >= 0
    ) {
      return "relationCustomer";
    }
    if (bundle.indexOf("レビュー") >= 0 || bundle.indexOf("評価") >= 0) {
      return "review";
    }
    return "default";
  }

  function openingTooSimilarToCore(question, coreMain) {
    const q = compactSpaces(question).toLowerCase();
    const c = compactSpaces(coreMain).toLowerCase();
    if (!q || !c) {
      return false;
    }
    if (q === c) {
      return true;
    }
    const n = Math.min(14, c.length);
    if (n >= 6 && q.indexOf(c.slice(0, n)) >= 0) {
      return true;
    }
    const m = Math.min(14, q.length);
    if (m >= 6 && c.indexOf(q.slice(0, m)) >= 0) {
      return true;
    }
    return false;
  }

  function pickReviewOpeningByBranch(preset, branch) {
    const p = preset || "";
    const b = branch || "default";
    if (p === "strong") {
      if (b === "satisfactionKuchikomi") {
        return "満足が足りないから口コミが増えない、と決めつける前に、タイミングと手間を減らす導線を見る。";
      }
      if (b === "relationCustomer") {
        return "仲が良いことと、口コミ投稿は別物だ。どこを分けて設計する？";
      }
      if (b === "review") {
        return "レビューと満足は、同じカードに並べない。混ぜると誤診が増える。";
      }
      return "満足のあとに口コミが増えないのなら、満足が足りないとは限らない。行動の設計がないだけだ。";
    }
    if (p === "soft") {
      if (b === "satisfactionKuchikomi") {
        return "満足したあと、口コミはなぜ動きにくいか。気持ちの話だけで終わらないか。";
      }
      if (b === "relationCustomer") {
        return "仲良くなったのに、口コミが来ない。そこはどう感じる？";
      }
      if (b === "review") {
        return "満足してくれたのに、レビューにはつながらない。なぜなんだろう。";
      }
      return "満足のあとに口コミが増えないのは、なぜなんだろう。";
    }
    if (p === "biz") {
      if (b === "satisfactionKuchikomi") {
        return "満足と口コミは別KPI。導線と客層の行動を、どこで見るか。";
      }
      if (b === "relationCustomer") {
        return "関係性の質と、口コミ投稿の導線は、設計上のレイヤーが違う。";
      }
      if (b === "review") {
        return "レビュー導線は、満足の直後の設計とセットで見る。";
      }
      return "満足のあとに口コミが増えないとき、まず見るのは「導線」と「客層の行動」のズレだ。";
    }
    if (b === "satisfactionKuchikomi") {
      return "満足の瞬間と、口コミの動きは同じタイミングでは起きない。どこでズレる？";
    }
    if (b === "relationCustomer") {
      return "関係が良くなっても、口コミに繋がるとは限らない。何が別問題だ？";
    }
    if (b === "review") {
      return "レビューに繋がらない満足は、満足が足りないからだろうか。それとも別の話だろうか。";
    }
    return "満足のあとに口コミが増えないとしたら、それは本当に「満足していなかった」からだろうか。";
  }

  function noteOpeningQuestionLine(normalized) {
    const bundle = reviewOpeningBundle(normalized);
    if (bundle.indexOf("口コミ") < 0 && bundle.indexOf("レビュー") < 0 && bundle.indexOf("評価") < 0) {
      return "";
    }
    const branch = classifyReviewOpeningBranch(bundle);
    let q = pickReviewOpeningByBranch(normalized.notePreset, branch);
    if (normalized.coreMain && openingTooSimilarToCore(q, normalized.coreMain)) {
      q = pickReviewOpeningByBranch(normalized.notePreset, "default");
      if (normalized.coreMain && openingTooSimilarToCore(q, normalized.coreMain)) {
        q =
          "満足と行動は別、と言われることがある。口コミやレビューは、そのどこに挟まるだろうか。";
      }
    }
    return q;
  }

  function noteLeadWithPreset(toneData, preset) {
    const base = toneData.noteLead;
    if (!preset) {
      return base;
    }
    if (preset === "strong") {
      return base + " 今日は、前提を言い切る。";
    }
    if (preset === "soft") {
      return base + " 今日は、ちょっとだけ静かに。";
    }
    if (preset === "biz") {
      return base + " 現場の話は、導線と仕組みに変換できる。";
    }
    return base;
  }

  function buildNoteOpeningBlock(normalized, toneData) {
    const q = noteOpeningQuestionLine(normalized);
    const lead = noteLeadWithPreset(toneData, normalized.notePreset);
    if (normalized.coreMain) {
      if (q) {
        return q + "\n\n" + normalized.coreMain;
      }
      return normalized.coreMain;
    }
    if (q) {
      return q;
    }
    return lead;
  }

  function storyAsShortParagraphs(incident) {
    const t = compactSpaces(incident);
    if (!t || t.length < 36) {
      return t;
    }
    const half = Math.floor(t.length / 2);
    let cut = -1;
    for (let i = half; i < t.length; i++) {
      const ch = t.charAt(i);
      if (ch === "。" || ch === "！" || ch === "？" || ch === "!" || ch === "?") {
        cut = i + 1;
        break;
      }
    }
    if (cut > 0 && cut < t.length - 4) {
      return t.slice(0, cut).trim() + "\n\n" + t.slice(cut).trim();
    }
    return t;
  }

  function splitMemoFragments(text) {
    const t = compactSpaces(text);
    if (!t) {
      return [];
    }
    const parts = t.split(/[\n。、]+/).map(function (s) {
      return compactSpaces(s);
    }).filter(Boolean);
    return parts.length ? parts : [t];
  }

  function polishRoughIncidentClause(s) {
    let x = compactSpaces(s);
    if (!x) {
      return "";
    }
    if (/^質問多かった$/.test(x)) {
      return "質問は多かった";
    }
    if (/^かなり仲良くなった$/.test(x)) {
      return "かなり仲良くなれた";
    }
    if (/^でも口コミは来なかった$/.test(x)) {
      return "口コミにはつながらなかった";
    }
    if (/^質問/.test(x) && x.indexOf("は") < 0 && x.indexOf("が") < 0 && x.indexOf("も") < 0) {
      x = x.replace(/^質問/, "質問は");
    }
    return x;
  }

  function recomposeIncidentMemo(raw, normalized) {
    const t = trimOptional(raw);
    if (!t) {
      return ensurePeriod(normalized.incident);
    }
    const fr = splitMemoFragments(t);
    if (!fr.length) {
      return ensurePeriod(t);
    }
    if (fr.length === 1) {
      let s = polishRoughIncidentClause(fr[0]);
      if (compactSpaces(s).length < 22 && normalized.coreMain) {
        s = "「" + normalized.theme + "」の場面で、" + s + "——という断片だけが残った。";
      }
      return ensurePeriod(s);
    }
    const head = fr
      .slice(0, -1)
      .map(polishRoughIncidentClause)
      .filter(Boolean)
      .join("、");
    const rawTail = fr[fr.length - 1];
    let tail = polishRoughIncidentClause(rawTail);
    if (tail && !/^でも|^しかし|^それでも|^ところが/.test(compactSpaces(rawTail))) {
      tail = "それでも、" + tail;
    }
    return ensurePeriod(head + "。" + tail);
  }

  function recomposeLearningMemo(raw, normalized) {
    const t = trimOptional(raw);
    if (!t) {
      return "";
    }
    const fr = splitMemoFragments(t);
    if (!fr.length) {
      return ensurePeriod(t);
    }
    const bundle = (normalized.theme + " " + normalized.coreMain + " " + t).toLowerCase();
    const reviewish = bundle.indexOf("口コミ") >= 0 || bundle.indexOf("レビュー") >= 0;

    if (fr.length === 1) {
      let s = compactSpaces(fr[0]);
      if (reviewish && /満足|口コミ|導線|レビュー/.test(s)) {
        if (/満足/.test(s) && /口コミ/.test(s)) {
          s = "満足したことと、口コミを書くことは別物だとメモした";
        } else if (s.length < 16 && normalized.coreMain) {
          s = "「" + normalized.coreMain + "」を軸に、" + s + "という気づきに落ち着いた";
        }
      } else if (s.length < 12 && normalized.coreMain) {
        s = "「" + normalized.coreMain + "」に沿うと、" + s + "という感覚が残った";
      }
      return ensurePeriod(s);
    }

    let a = compactSpaces(fr[0]);
    let b = compactSpaces(fr[1]);
    if (reviewish) {
      if (/満足/.test(a) && /口コミ/.test(a)) {
        a = "満足したことと、口コミを書くことは別物だ";
      }
      if (/導線/.test(b)) {
        b = "足りないのは、満足直後の導線の設計だった";
      }
    }
    let rest = "";
    if (fr.length > 2) {
      rest = "。" + fr.slice(2).join("。");
    }
    return ensurePeriod(a + "。" + b + rest);
  }

  function buildNoteLearningLine(normalized, input) {
    const rawLearn = trimOptional(input.learning);
    if (rawLearn) {
      return recomposeLearningMemo(rawLearn, normalized);
    }
    return ensurePeriod(normalized.learning);
  }

  function buildNoteStoryAndPhrase(normalized, input) {
    const rawInc = trimOptional(input.incident);
    let story;
    if (rawInc) {
      story = recomposeIncidentMemo(rawInc, normalized);
      story = storyAsShortParagraphs(story);
    } else {
      story = storyAsShortParagraphs(ensurePeriod(normalized.incident));
    }
    if (normalized.corePhrase && story.indexOf(normalized.corePhrase) < 0) {
      story = story + "\n\n" + normalized.corePhrase;
    }
    return story;
  }

  function noteContextBundle(normalized) {
    return compactSpaces(
      (normalized.theme || "") +
        " " +
        (normalized.incident || "") +
        " " +
        (normalized.coreMain || "") +
        " " +
        (normalized.learning || "")
    ).toLowerCase();
  }

  function noteFinalClosingBundle(normalized) {
    return noteContextBundle(normalized);
  }

  function classifyNoteMidBranch(bundle) {
    if (blobIndex(bundle, "口コミ") >= 0 || blobIndex(bundle, "レビュー") >= 0) {
      return "review";
    }
    if (blobIndex(bundle, "価格") >= 0 || blobIndex(bundle, "客層") >= 0 || blobIndex(bundle, "安く") >= 0 || blobIndex(bundle, "安売") >= 0) {
      return "price";
    }
    if (
      blobIndex(bundle, "契約") >= 0 ||
      blobIndex(bundle, "相性") >= 0 ||
      (blobIndex(bundle, "売上") >= 0 && blobIndex(bundle, "しんどい") >= 0) ||
      blobIndex(bundle, "続ける") >= 0
    ) {
      return "contract";
    }
    if (
      blobIndex(bundle, "段取り") >= 0 ||
      blobIndex(bundle, "手戻り") >= 0 ||
      blobIndex(bundle, "朝礼") >= 0 ||
      blobIndex(bundle, "確認漏れ") >= 0 ||
      blobIndex(bundle, "手順") >= 0 ||
      blobIndex(bundle, "現場改善") >= 0
    ) {
      return "ops";
    }
    return "default";
  }

  function blobIndex(blob, needle) {
    return (blob || "").indexOf(needle);
  }

  function pickNoteTurnMidBranch(branch, preset) {
    const p = preset || "";
    if (branch === "review") {
      if (p === "strong") {
        return "だが、満足の瞬間を「終わり」にしないと、口コミは動きにくい。";
      }
      if (p === "soft") {
        return "けれど、気持ちの良さだけでは、口コミが書かれない理由がある。";
      }
      if (p === "biz") {
        return "でも、口コミは関係の延長ではなく、導線の設計の問題だ。";
      }
      return "でも、口コミが必要だという気持ちは、満足の直後にはまだ起きない。";
    }
    if (branch === "price") {
      if (p === "strong") {
        return "だが、安さは集客だけでなく、客層の作り方も変える。";
      }
      if (p === "soft") {
        return "けれど、依頼は増えても、空気の違いだけは見落としがちだ。";
      }
      if (p === "biz") {
        return "でも、価格は客層も変える。図にすると決めやすい。";
      }
      return "でも、価格は客層も変える。図にすると決めやすい。";
    }
    if (branch === "contract") {
      if (p === "strong") {
        return "だが、売上は伸びても、続け方の負担は別問題だ。";
      }
      if (p === "soft") {
        return "けれど、良い数字は、そのまま続け心地の良さではない。";
      }
      if (p === "biz") {
        return "でも、契約の相性は、売上の曲線と別レイヤーで見る必要がある。";
      }
      return "でも、続け方のしんどさは、売上だけでは説明しきれない。";
    }
    if (branch === "ops") {
      if (p === "strong") {
        return "だが、現場のズレは、能力不足より前提の未共有で起きることが多い。";
      }
      if (p === "soft") {
        return "けれど、小さな手戻りは、積み上がると流れを止める。";
      }
      if (p === "biz") {
        return "でも、段取りは短い言語化で共有できる。";
      }
      return "でも、前提のずれが積み上がると、現場のリズムが乱れる。";
    }
    return "";
  }

  function turnLineOverlapsLearning(turnLine, learningRaw) {
    const L = compactSpaces(learningRaw).toLowerCase();
    const t = compactSpaces(turnLine).toLowerCase();
    if (!L || L.length < 10) {
      return false;
    }
    if (t.indexOf(L.slice(0, 14)) >= 0) {
      return true;
    }
    if (L.indexOf(t.slice(0, 12)) >= 0 && t.length >= 10) {
      return true;
    }
    return false;
  }

  function pickNoteTurnAlternateFallback(preset) {
    const p = preset || "";
    if (p === "strong") {
      return "だが、ここで言い切ると、次の一手は一段と軽くなる。";
    }
    if (p === "soft") {
      return "けれど、気づきは一行で足りることもある。";
    }
    if (p === "biz") {
      return "でも、現場の話は、導線と仕組みに変換できる。";
    }
    return "でも、一段だけ視点を変える。";
  }

  function buildNoteTurnAndWhyLegacy(normalized) {
    const why = buildNoteWhy(normalized);
    const first = compactSpaces(why.split("。")[0] || "");
    const p = normalized.notePreset || "";
    if (!first) {
      if (p === "strong") {
        return "それでも、現場の前提は人それぞれだった。";
      }
      if (p === "soft") {
        return "ただ、現場の前提は人それぞれだった。";
      }
      if (p === "biz") {
        return "ただ、現場の前提は人それぞれだった。手順と期待のズレが効いてくる。";
      }
      return "ただ、現場の前提は人それぞれだった。";
    }
    let connector = "でも、";
    if (p === "strong") {
      connector = "だが、";
    } else if (p === "soft") {
      connector = "けれど、";
    } else if (p === "biz") {
      connector = "でも、";
    }
    return connector + first + "。";
  }

  function buildNoteTurnAndWhy(normalized) {
    const bundle = noteContextBundle(normalized);
    const branch = classifyNoteMidBranch(bundle);
    const p = normalized.notePreset || "";
    if (branch === "default") {
      return buildNoteTurnAndWhyLegacy(normalized);
    }
    let turn = pickNoteTurnMidBranch(branch, p);
    if (normalized.learning && turnLineOverlapsLearning(turn, normalized.learning)) {
      turn = pickNoteTurnAlternateFallback(p);
    }
    if (normalized.learning && turnLineOverlapsLearning(turn, normalized.learning)) {
      return buildNoteTurnAndWhyLegacy(normalized);
    }
    return turn;
  }

  function pickReviewClosingBranchNoConclusion(bundle) {
    if (bundle.indexOf("仲良く") >= 0 || bundle.indexOf("お客様") >= 0 || bundle.indexOf("お客さん") >= 0 || bundle.indexOf("お客") >= 0) {
      return "relation";
    }
    if (bundle.indexOf("導線") >= 0 || bundle.indexOf("満足") >= 0) {
      return "guide";
    }
    return "default";
  }

  function pickNonReviewClosingBranchNoConclusion(bundle) {
    if (
      bundle.indexOf("契約") >= 0 ||
      bundle.indexOf("売上") >= 0 ||
      bundle.indexOf("しんどい") >= 0 ||
      bundle.indexOf("続ける") >= 0
    ) {
      return "contract";
    }
    if (bundle.indexOf("価格") >= 0 || bundle.indexOf("客層") >= 0 || bundle.indexOf("安く") >= 0 || bundle.indexOf("安売") >= 0) {
      return "price";
    }
    return "default";
  }

  function buildNoteFinalTailLegacy(reviewish, p) {
    let tail;
    if (reviewish) {
      if (p === "strong") {
        tail =
          "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、どう設計する？ — ここで言い切る。";
      } else if (p === "soft") {
        tail = "結果が見えるのは、ズレが見えたことの前進かもしれない。\n\n次の一枚、どう設計する？";
      } else if (p === "biz") {
        tail =
          "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、導線と導入の設計をどうする？";
      } else {
        tail = "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、どう設計する？";
      }
    } else if (p === "strong") {
      tail = "次の一歩は、一つに絞る。\n\nそれで十分です。";
    } else if (p === "soft") {
      tail = "次の一歩、一つだけ試してみる。\n\nそれで十分です。";
    } else if (p === "biz") {
      tail = "次の一歩は、短い手順の言語化を現場に置く。\n\nそれで十分です。";
    } else {
      tail = "次の一歩、一つだけ試す。\n\nそれで十分です。";
    }
    return tail;
  }

  function buildNoteFinalTailNoConclusion(reviewish, p, bundle) {
    const rb = reviewish ? pickReviewClosingBranchNoConclusion(bundle) : "";
    const nb = !reviewish ? pickNonReviewClosingBranchNoConclusion(bundle) : "";
    if (reviewish) {
      if (p === "strong") {
        if (rb === "relation") {
          return "関係が良くても、口コミは導線の勝負だ。次の一手は、最短の一歩を決める。\n\n次の一枚、どう設計する？ — ここで言い切る。";
        }
        if (rb === "guide") {
          return "満足の直後に置く導線を、一つに言語化する。結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、どう設計する？ — ここで言い切る。";
        }
        return "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、どう設計する？ — ここで言い切る。";
      }
      if (p === "soft") {
        if (rb === "relation") {
          return "仲良くなっても、口コミは別の導線がいる。次の一枚、どう設計する？";
        }
        if (rb === "guide") {
          return "満足のあとに動かないのは、気持ちだけの問題とは限らない。導線を一つに落とす。\n\n次の一枚、どう設計する？";
        }
        return "結果が見えるのは、ズレが見えたことの前進かもしれない。\n\n次の一枚、どう設計する？";
      }
      if (p === "biz") {
        if (rb === "relation") {
          return "関係性の良さと、口コミ導線はレイヤーが違う。次の一枚、導線と導入の設計をどうする？";
        }
        if (rb === "guide") {
          return "満足と行動は別KPI。導線を一つ決めてから、導入の設計に落とす。\n\n次の一枚、導線と導入の設計をどうする？";
        }
        return "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、導線と導入の設計をどうする？";
      }
      if (rb === "relation") {
        return "関係が良くなっても、口コミは別の導線を持つ。次の一手は、満足の直後に置く一歩を決める。\n\n次の一枚、どう設計する？";
      }
      if (rb === "guide") {
        return "満足のあとに動かないのは、気持ちが足りないからだとは限らない。導線を一つに落とす。\n\n次の一枚、どう設計する？";
      }
      return "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、どう設計する？";
    }
    if (p === "strong") {
      if (nb === "contract") {
        return "売上の見え方だけで、続け方の判断はしない。次の一歩は、一つに絞る。\n\nそれで十分です。";
      }
      if (nb === "price") {
        return "価格は、集客だけでなく客層の作り方も変える。次の一歩は、一つに絞る。\n\nそれで十分です。";
      }
      return "次の一歩は、一つに絞る。\n\nそれで十分です。";
    }
    if (p === "soft") {
      if (nb === "contract") {
        return "続け方のしんどさは、売上だけでは説明しきれない。次の一歩、一つだけ試してみる。\n\nそれで十分です。";
      }
      if (nb === "price") {
        return "安さの設計は、来る仕事の質にも効く。次の一歩、一つだけ試してみる。\n\nそれで十分です。";
      }
      return "次の一歩、一つだけ試してみる。\n\nそれで十分です。";
    }
    if (p === "biz") {
      if (nb === "contract") {
        return "契約の相性は、売上の伸びとは別レイヤーで見る。次の一歩は、短い手順の言語化を現場に置く。\n\nそれで十分です。";
      }
      if (nb === "price") {
        return "価格と客層は、セットで設計する。次の一歩は、短い手順の言語化を現場に置く。\n\nそれで十分です。";
      }
      return "次の一歩は、短い手順の言語化を現場に置く。\n\nそれで十分です。";
    }
    if (nb === "contract") {
      return "売上の見え方だけで、続け方の判断はしない。次の一歩は、一つに絞る。\n\nそれで十分です。";
    }
    if (nb === "price") {
      return "価格は、集客だけでなく客層の作り方も変える。次の一歩は、一つに絞る。\n\nそれで十分です。";
    }
    return "次の一歩、一つだけ試す。\n\nそれで十分です。";
  }

  function buildNoteFinalBlock(normalized) {
    const bundle = noteFinalClosingBundle(normalized);
    const srcLegacy = ((normalized.theme || "") + " " + (normalized.incident || "")).toLowerCase();
    const reviewishLegacy = srcLegacy.indexOf("口コミ") >= 0 || srcLegacy.indexOf("レビュー") >= 0;
    const reviewishBranch = bundle.indexOf("口コミ") >= 0 || bundle.indexOf("レビュー") >= 0;
    const p = normalized.notePreset || "";
    const tail = normalized.coreConclusion
      ? buildNoteFinalTailLegacy(reviewishLegacy, p)
      : buildNoteFinalTailNoConclusion(reviewishBranch, p, bundle);
    if (normalized.coreConclusion) {
      return normalized.coreConclusion + "\n\n" + tail;
    }
    return tail;
  }

  function buildNoteWhy(normalized) {
    const src = (normalized.theme + " " + normalized.incident).toLowerCase();
    if (src.indexOf("口コミ") >= 0 || src.indexOf("レビュー") >= 0) {
      return "起きやすいのは、満足した瞬間は「お礼」で終わり、口コミが必要だという気持ちはまだ起きていないからです。だからこそ、タイミングと手間を減らす導線が効いてきます。";
    }
    const name = normalized.comicPattern;
    if (name === "誤解型") {
      return "起きやすいのは、言葉の当たり前が人それぞれだからです。伝えたつもりが伝わっておらず、作業の前提にズレが出ます。同じ現場でも見え方が分かれると、手戻りは一気に膨らみます。";
    }
    if (name === "ヒヤリ型") {
      return "起きやすいのは、焦りや慣れです。一瞬の判断で手順を飛ばすと、空気が張りつめます。安全優先で止め、手順を再確認するほうが、結果的に早いです。";
    }
    return "起きやすいのは、小さなズレがじわじわ効率を下げることです。大きな問題ではなくても、前提のずれが積み上がると、現場のリズムが乱れます。";
  }

  function shortenTitlePart(s, maxLen) {
    const t = compactSpaces(s);
    if (!t) {
      return "";
    }
    if (t.length <= maxLen) {
      return t;
    }
    return t.slice(0, maxLen - 1) + "…";
  }

  function classifyTitleTopic(bundle) {
    const b = classifyNoteMidBranch(bundle);
    if (b === "ops") {
      return "default";
    }
    return b;
  }

  function defaultAssertiveByTopic(topic) {
    if (topic === "review") {
      return "口コミは導線の勝負だ";
    }
    if (topic === "price") {
      return "安さは客層も選ぶ";
    }
    if (topic === "contract") {
      return "売上だけでは続けない";
    }
    return "前提を一言で言語化する";
  }

  function pickDiscomfortTitleLine(topic, th) {
    const t = (th || "").toLowerCase();
    if (topic === "review") {
      if (t.indexOf("仲良く") >= 0 || t.indexOf("お客") >= 0) {
        return "嬉しいのに、口コミが来ない落差";
      }
      return "満足のあとに口コミが動かない";
    }
    if (topic === "price") {
      return "安くすると、空気が変わる";
    }
    if (topic === "contract") {
      return "売上があるのに、続けるほどしんどい";
    }
    return shortenTitlePart(th, 32) || "現場の前提は人それぞれ";
  }

  function pickDiscomfortTitleLineAlt(topic, th) {
    if (topic === "review") {
      return "口コミだけが、仲の良さの証明ではない";
    }
    if (topic === "price") {
      return "依頼は増えるのに、空気が違う";
    }
    if (topic === "contract") {
      return "数字の良さと、続け心地のズレ";
    }
    return "小さなズレがじわっと効く";
  }

  function pickEssenceTitleLine(topic, cm, th) {
    if (topic === "review") {
      return "導線が口コミを決める";
    }
    if (topic === "price") {
      return "価格は客層設計でもある";
    }
    if (topic === "contract") {
      return "相性の悪い契約は密度を壊す";
    }
    return shortenTitlePart(cm || th, 34) || "一行で言語化すると戻る";
  }

  function buildNoteTitleCandidateBlock(normalized) {
    const prefix = templates.characterProfile.titlePrefix;
    const bundle = noteContextBundle(normalized);
    const topic = classifyTitleTopic(bundle);
    const th = compactSpaces(normalized.theme || "");
    const cm = compactSpaces(normalized.coreMain || "");
    const cc = compactSpaces(normalized.coreConclusion || "");

    let assertive;
    if (cm) {
      assertive = prefix + shortenTitlePart(cm, 34);
    } else if (th) {
      assertive = prefix + shortenTitlePart(th, 34);
    } else {
      assertive = prefix + defaultAssertiveByTopic(topic);
    }

    let discomfort = prefix + pickDiscomfortTitleLine(topic, th);
    let essence;
    if (cc) {
      essence = prefix + shortenTitlePart(cc, 34);
    } else {
      essence = prefix + pickEssenceTitleLine(topic, cm, th);
    }

    const ca = compactSpaces(assertive);
    const cd = compactSpaces(discomfort);
    const ce = compactSpaces(essence);
    if (cd === ca) {
      discomfort = prefix + pickDiscomfortTitleLineAlt(topic, th);
    }
    if (ce === ca || ce === compactSpaces(discomfort)) {
      essence = prefix + pickEssenceTitleLine(topic, "", th);
      if (compactSpaces(essence) === ca || compactSpaces(essence) === compactSpaces(discomfort)) {
        essence = prefix + defaultAssertiveByTopic(topic) + "（本質）";
      }
    }
    return ["【タイトル案】", "・言い切り: " + assertive, "・実話・違和感: " + discomfort, "・気づき・本質: " + essence].join("\n");
  }

  function buildNoteShortSpaced(normalized, input, toneData, leadTitle, learningLine) {
    const parts = [
      `# ${leadTitle}`,
      "",
      buildNoteOpeningBlock(normalized, toneData),
      "",
      buildNoteStoryAndPhrase(normalized, input),
      "",
      buildNoteTurnAndWhy(normalized),
      "",
      learningLine,
      "",
      buildNoteFinalBlock(normalized),
    ];
    let body = parts.join("\n");
    if (normalized.inputSparse) {
      body += "\n\n" + "入力が短くても、決めるのは一つで十分。";
    }
    return body;
  }

  function buildNoteKindleStructured(normalized, input, toneData, leadTitle, learningLine) {
    const q = noteOpeningQuestionLine(normalized);
    const introParts = [];
    if (q) {
      introParts.push(q);
    }
    if (normalized.coreMain) {
      introParts.push(normalized.coreMain);
    }
    introParts.push(noteLeadWithPreset(toneData, normalized.notePreset));
    const intro = introParts.join("\n\n");

    const story = buildNoteStoryAndPhrase(normalized, input);
    const whyFull = buildNoteWhy(normalized);
    const finalBlock = buildNoteFinalBlock(normalized);
    let body = [
      `# ${leadTitle}`,
      "",
      intro,
      "",
      "【実話】",
      story,
      "",
      "【なぜそうなったか】",
      whyFull,
      "",
      "【気づき】",
      learningLine,
      "",
      "【まとめ】",
      finalBlock,
      "",
      "（章や本の中では、起きた事実→背景の整理→学び→次の一歩の順で読めるように使える。）",
    ].join("\n");
    if (normalized.inputSparse) {
      body += "\n\n" + "入力が短くても、決めるのは一つで十分。";
    }
    return body;
  }

  function buildNoteComicCompact(normalized, input, leadTitle, learningLine) {
    const story = buildNoteStoryAndPhrase(normalized, input);
    const parts = [`# ${leadTitle}`, ""];
    if (normalized.coreMain) {
      parts.push(normalized.coreMain, "");
    }
    parts.push(story, "", learningLine, "", buildNoteFinalBlock(normalized));
    let body = parts.join("\n");
    if (normalized.inputSparse) {
      body += "\n\n" + "入力が短くても、決めるのは一つで十分。";
    }
    return body;
  }

  function buildNote(input) {
    const normalized = normalizeInput(input);
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const toneData = templates.toneTemplates[normalized.tone];
    const learningLine = buildNoteLearningLine(normalized, input);
    const st = normalized.outputStyle;
    if (st === "kindle") {
      return buildNoteKindleStructured(normalized, input, toneData, leadTitle, learningLine);
    }
    if (st === "comic") {
      return buildNoteComicCompact(normalized, input, leadTitle, learningLine);
    }
    return buildNoteShortSpaced(normalized, input, toneData, leadTitle, learningLine);
  }

  function buildXPost(input) {
    const normalized = normalizeInput(input);
    const toneData = templates.toneTemplates[normalized.tone];
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const shortText = `【${toneData.xLead}】${leadTitle}\n${normalized.incident}\n学び: ${normalized.learning}`;
    const focusLine = normalized.inputSparse ? `要点: ${normalized.learningFocus}` : "";
    const source = `${normalized.theme} ${normalized.incident} ${normalized.learning}`;
    let longBody = `現場のズレは、能力不足より「前提の未共有」で起きることが多い。${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}で整理した結論は「${normalized.learning}」。`;
    if (source.indexOf("工具配置") >= 0 || source.indexOf("段取り見直し") >= 0) {
      longBody = `工具配置を少し見直しただけで、現場の流れはしっかり変わる。今日の結論は「${normalized.learning}」。小さな改善を続けると、明日の余裕につながる。`;
    } else if (
      source.indexOf("読み合わせ") >= 0 ||
      source.indexOf("日報") >= 0 ||
      source.indexOf("過去ログ") >= 0
    ) {
      longBody = `昨日の記録を朝に読み返すだけで、同じつまずきを先回りしやすくなる。今日の学びは「${normalized.learning}」。振り返りを次の実務にそのままつなげたい。`;
    } else if (
      source.indexOf("搬入") >= 0 ||
      source.indexOf("導線") >= 0 ||
      source.indexOf("詰まり") >= 0
    ) {
      longBody = `搬入導線は、少し重なるだけでも現場のテンポを崩しやすい。今回の学びは「${normalized.learning}」。先に一枚図で共有しておくと、全体が落ち着いて進む。`;
    } else if (
      source.indexOf("高所") >= 0 ||
      source.indexOf("足場") >= 0 ||
      source.indexOf("焦って") >= 0
    ) {
      longBody = `高所作業では、急ぎたい場面ほど確認を先に置くのが効く。今日の結論は「${normalized.learning}」。一呼吸置くことで、結果的に安全と速度の両方を守れる。`;
    }
    const longText = `${leadTitle}\n${longBody}${focusLine ? ` ${focusLine}` : ""}`.trim();

    return [
      "短文版",
      shortText,
      "",
      "やや長文版",
      longText,
      "",
      "ハッシュタグ案",
      "#AI武装親方 #現場改善 #4コマ #学び #建設DX",
    ].join("\n");
  }

  function buildAllOutputs(input) {
    const normalized = normalizeInput(input);
    return {
      comic: buildComic(input),
      comicPrompt: buildComicPanelPrompts(input),
      comicUnifiedPrompt: buildUnifiedComicImagePrompt(input),
      note: buildNote(input),
      noteTitleSuggestions: buildNoteTitleCandidateBlock(normalized),
      xPost: buildXPost(input),
    };
  }

  window.AIBusouEngine = {
    normalizeInput,
    buildComic,
    buildComicPanelPrompts,
    buildUnifiedComicImagePrompt,
    buildNote,
    buildNoteTitleCandidateBlock,
    buildXPost,
    buildAllOutputs,
  };
})();
