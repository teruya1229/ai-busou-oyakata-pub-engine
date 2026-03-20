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
    if (normalizedIncident.indexOf("改善") >= 0) {
      return "短文入力でも、改善点を一つ具体化して次の現場で試す。";
    }
    if (normalizedIncident.indexOf("確認") >= 0 || normalizedIncident.indexOf("漏れ") >= 0) {
      return "確認漏れは、作業前の声かけ一つで減らせる。";
    }
    return "短い確認でも、先に共通認識を作るとズレが減る。";
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
    const incident = ensureIncidentText(input.incident);
    const learning = ensureLearningText(input.learning, incident);
    const theme = stripDuplicateTitlePrefix(safeText(input.theme, "").trim() || "現場の小さな改善");
    const characters = normalizeCharacters(input.characters);
    const coreMain = trimOptional(input.coreMain);
    const corePhrase = trimOptional(input.corePhrase);
    const coreConclusion = trimOptional(input.coreConclusion);
    const hasCoreLocks = !!(coreMain || corePhrase || coreConclusion);
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

  function noteOpeningQuestionLine(normalized) {
    const src = (normalized.theme + " " + normalized.incident).toLowerCase();
    if (src.indexOf("口コミ") >= 0 || src.indexOf("レビュー") >= 0) {
      return "満足のあとに口コミが増えないとしたら、それは本当に「満足していなかった」からだろうか。";
    }
    return "";
  }

  function buildNoteOpeningBlock(normalized, toneData) {
    const q = noteOpeningQuestionLine(normalized);
    if (normalized.coreMain) {
      if (q) {
        return q + "\n\n" + normalized.coreMain;
      }
      return normalized.coreMain;
    }
    if (q) {
      return q;
    }
    return toneData.noteLead;
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

  function buildNoteStoryAndPhrase(normalized, input) {
    const rawInc = trimOptional(input.incident);
    const incidentText = rawInc ? ensurePeriod(rawInc) : normalized.incident;
    let story = storyAsShortParagraphs(incidentText);
    if (normalized.corePhrase && story.indexOf(normalized.corePhrase) < 0) {
      story = story + "\n\n" + normalized.corePhrase;
    }
    return story;
  }

  function buildNoteTurnAndWhy(normalized) {
    const why = buildNoteWhy(normalized);
    const first = compactSpaces(why.split("。")[0] || "");
    if (!first) {
      return "ただ、現場の前提は人それぞれだった。";
    }
    return "でも、" + first + "。";
  }

  function buildNoteFinalBlock(normalized) {
    const src = (normalized.theme + " " + normalized.incident).toLowerCase();
    const reviewish = src.indexOf("口コミ") >= 0 || src.indexOf("レビュー") >= 0;
    const tail = reviewish
      ? "結果が見えるのは、ズレが見えたことの前進でもある。\n\n次の一枚、どう設計する？"
      : "次の一歩、一つだけ試す。\n\nそれで十分です。";
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
    introParts.push(toneData.noteLead);
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
    const rawLearn = trimOptional(input.learning);
    const learningLine = rawLearn ? ensurePeriod(rawLearn) : ensurePeriod(compactSpaces(normalized.learning));
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
    return {
      comic: buildComic(input),
      comicPrompt: buildComicPanelPrompts(input),
      comicUnifiedPrompt: buildUnifiedComicImagePrompt(input),
      note: buildNote(input),
      xPost: buildXPost(input),
    };
  }

  window.AIBusouEngine = {
    normalizeInput,
    buildComic,
    buildComicPanelPrompts,
    buildUnifiedComicImagePrompt,
    buildNote,
    buildXPost,
    buildAllOutputs,
  };
})();
