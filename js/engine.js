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

  /**
   * 題材軸（コパイロットの「整理テンプレ」と独立。論点生成の分岐に使う）
   */
  function inferTopicAxis(bundleRaw) {
    const b = compactSpaces(bundleRaw || "").toLowerCase();
    if (b.indexOf("口コミ") >= 0 || b.indexOf("レビュー") >= 0) {
      return "review";
    }
    if (
      b.indexOf("共通認識") >= 0 ||
      b.indexOf("言葉を揃") >= 0 ||
      b.indexOf("言葉で揃") >= 0 ||
      b.indexOf("共有不足") >= 0 ||
      b.indexOf("食い違い") >= 0 ||
      b.indexOf("伝わってない") >= 0 ||
      b.indexOf("伝わっておら") >= 0 ||
      b.indexOf("前提がずれ") >= 0 ||
      b.indexOf("認識のずれ") >= 0 ||
      b.indexOf("認識がそろわ") >= 0 ||
      b.indexOf("短い確認でも") >= 0
    ) {
      return "alignment_comm";
    }
    if (b.indexOf("反省") >= 0 || b.indexOf("後悔") >= 0 || b.indexOf("感情") >= 0 || b.indexOf("気持ち") >= 0) {
      return "emotion";
    }
    if (
      b.indexOf("人間関係") >= 0 ||
      b.indexOf("礼儀") >= 0 ||
      b.indexOf("人として") >= 0 ||
      (b.indexOf("信頼") >= 0 && b.indexOf("お客") >= 0)
    ) {
      return "human_relation";
    }
    if (
      b.indexOf("弟子") >= 0 ||
      b.indexOf("協力会社") >= 0 ||
      b.indexOf("教育") >= 0 ||
      b.indexOf("指導") >= 0 ||
      b.indexOf("研修") >= 0 ||
      (b.indexOf("若手") >= 0 && (b.indexOf("職人") >= 0 || b.indexOf("現場") >= 0))
    ) {
      return "apprentice_education";
    }
    if (b.indexOf("直営業") >= 0 || b.indexOf("営業") >= 0 || b.indexOf("集客") >= 0 || b.indexOf("問い合わせ") >= 0) {
      return "sales";
    }
    if (b.indexOf("価格") >= 0 || b.indexOf("単価") >= 0 || b.indexOf("最安") >= 0 || b.indexOf("安値") >= 0 || b.indexOf("見積") >= 0) {
      return "price";
    }
    if (b.indexOf("客層") >= 0 || b.indexOf("相性") >= 0 || b.indexOf("向き不向き") >= 0) {
      return "customer_fit";
    }
    if (
      b.indexOf("契約") >= 0 ||
      (b.indexOf("売上") >= 0 && b.indexOf("しんどい") >= 0) ||
      b.indexOf("続ける") >= 0
    ) {
      return "contract";
    }
    if (
      b.indexOf("段取り") >= 0 ||
      b.indexOf("手戻り") >= 0 ||
      b.indexOf("朝礼") >= 0 ||
      b.indexOf("確認漏れ") >= 0 ||
      b.indexOf("手順") >= 0 ||
      b.indexOf("現場改善") >= 0 ||
      b.indexOf("ミス") >= 0
    ) {
      return "site_ops";
    }
    return "general";
  }

  function gapLabelForAxis(axis) {
    if (axis === "alignment_comm") {
      return "ズレのポイント";
    }
    if (axis === "site_ops") {
      return "現場の問題";
    }
    if (axis === "price" || axis === "customer_fit") {
      return "価格・客層の引っかかり";
    }
    if (axis === "human_relation") {
      return "人間関係の引っかかり";
    }
    if (axis === "apprentice_education") {
      return "関係・役割の引っかかり";
    }
    if (axis === "sales") {
      return "営業・商流の引っかかり";
    }
    if (axis === "emotion") {
      return "心に残ったこと";
    }
    if (axis === "review") {
      return "口コミまわりの引っかかり";
    }
    if (axis === "contract") {
      return "続け方の引っかかり";
    }
    return "引っかかった点";
  }

  function partnerProbeLine(axis, themeChip) {
    const ch = clipComicLine(themeChip, 26);
    if (axis === "alignment_comm") {
      return "「" + ch + "」、いちばんズレたのはここ？";
    }
    if (axis === "human_relation" || axis === "apprentice_education") {
      return "「" + ch + "」、ここが一番しんどかった？";
    }
    if (axis === "price" || axis === "customer_fit") {
      return "「" + ch + "」、いちばん効いたのはどこ？";
    }
    if (axis === "sales") {
      return "「" + ch + "」、次に決めるならどこ？";
    }
    if (axis === "emotion") {
      return "「" + ch + "」、いちばん残ったのはどこ？";
    }
    return "「" + ch + "」、いちばん引っかかったのはここ？";
  }

  function copilotSecondLineForTopic(axis, learning, toneData) {
    const lr = clipComicLine(learning, 40);
    if (lr) {
      return lr;
    }
    if (axis === "alignment_comm") {
      return clipComicLine(toneData.copilotShort || "確認の順、どこで分かれた？", 40);
    }
    return clipComicLine(toneData.copilotReaction || "一歩、試す？", 36);
  }

  function buildFallbackLearning(incident) {
    const normalizedIncident = compactSpaces(incident);
    const ax = inferTopicAxis(normalizedIncident);
    if (normalizedIncident.indexOf("口コミ") >= 0 || normalizedIncident.indexOf("レビュー") >= 0) {
      return "満足と口コミは別。導線が要る、という感覚を学びとして残す。";
    }
    if (normalizedIncident.indexOf("改善") >= 0) {
      return "短文入力でも、改善点を一つ具体化して次の現場で試す。";
    }
    if (normalizedIncident.indexOf("確認") >= 0 || normalizedIncident.indexOf("漏れ") >= 0) {
      return "確認漏れは、作業前の声かけ一つで減らせる。";
    }
    if (ax === "price" || ax === "customer_fit") {
      return "価格は、集客だけでなく客層の作り方も変える。次の一歩を一つにする。";
    }
    if (ax === "human_relation") {
      return "人としての線引きと、ルールを、まず短く言語化しておく。";
    }
    if (ax === "apprentice_education") {
      return "役割と境界を、関係が良いほど言葉にしておく。";
    }
    if (ax === "sales") {
      return "誰の顧客に、どう向けるか。商流の前提を一つ決める。";
    }
    if (ax === "alignment_comm") {
      return "伝え方と受け取り方のズレを、短い一文で切り分けておく。";
    }
    return "今回の学びを、次の一歩に一つだけ落とす。";
  }

  function deriveIncidentFromCore(theme, coreMain, coreConclusion) {
    const bundle = compactSpaces(theme + " " + coreMain + " " + coreConclusion);
    const lower = bundle.toLowerCase();
    const ax = inferTopicAxis(bundle);
    if (lower.indexOf("口コミ") >= 0 || lower.indexOf("レビュー") >= 0) {
      return "関係は良くなった。喜んでもらえた。それでも口コミの導線は動かなかった。";
    }
    const stem = coreMain || coreConclusion || theme;
    if (!stem) {
      return "出来事のメモが短く、現場の輪郭だけが残った。";
    }
    const clipped = stem.length > 96 ? stem.slice(0, 96) + "…" : stem;
    const th = compactSpaces(theme || "");
    if (th) {
      return ensurePeriod("この話の場面で、" + clipped + "——ここが、会話の中心に残った。");
    }
    if (ax === "alignment_comm") {
      return ensurePeriod(clipped + "——伝え方と受け取り方のズレが、その日の論点になった。");
    }
    return ensurePeriod(clipped + "——この経験が、その日の話の中心になった。");
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
      return "出来事のメモを一言足すと、具体が出やすい。";
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

  function resolveNoteLengthPreset(raw) {
    const s = compactSpaces(raw || "");
    if (s === "short" || s === "extended") {
      return s;
    }
    return "standard";
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
    const topicBundle = compactSpaces(theme + " " + incident + " " + coreMain + " " + coreConclusion + " " + learning + " " + corePhrase);
    const topicAxis = inferTopicAxis(topicBundle);
    const inputSparse =
      !compactSpaces(input.theme) ||
      !compactSpaces(input.characters) ||
      compactSpaces(input.incident).length < 10 ||
      compactSpaces(input.learning).length < 6;
    const learningFocus =
      topicAxis === "alignment_comm" || comicPattern === "誤解型"
        ? "短文でも、要点を一つに絞って学びとして残す。"
        : "入力が短くても、改善点を一つ具体化して次の現場につなげる。";
    const outputStyle = resolveOutputStyle(input && input.outputStyle);
    const notePreset = resolveNotePreset(input && input.notePreset);
    const noteLengthPreset = resolveNoteLengthPreset(input && input.noteLengthPreset);

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
      noteLengthPreset,
      topicAxis,
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

  function clipComicLine(s, maxLen) {
    const t = compactSpaces(s || "");
    if (!t) {
      return "";
    }
    return t.length <= maxLen ? t : t.slice(0, maxLen - 1) + "…";
  }

  function buildComicGapNarrative(normalized, incidentForComic, reviewMode) {
    const axisKey = reviewMode ? "review" : normalized.topicAxis || "general";
    const label = gapLabelForAxis(axisKey);
    if (reviewMode) {
      const cm = compactSpaces(normalized.coreMain || "");
      if (cm) {
        return label + ": " + clipComicLine(cm, 72);
      }
      return label + ": 満足と口コミの導線が、別の話になっている。";
    }
    const cm = compactSpaces(normalized.coreMain || "");
    if (cm) {
      return label + ": " + clipComicLine(cm, 76);
    }
    const inc = compactSpaces(incidentForComic.replace(/^状況:\s*/, ""));
    const first = inc.split(/[。！？!?]/)[0] || inc;
    return label + ": " + clipComicLine(first, 76);
  }

  function buildComicInsightNarrative(normalized) {
    const lr = compactSpaces(normalized.learning || "");
    if (lr) {
      return "気づき: " + clipComicLine(lr, 84);
    }
    return "気づき: " + clipComicLine(normalized.coreMain || normalized.theme, 72);
  }

  function buildComicForwardNarrative(normalized, learningForPanel4) {
    const cc = compactSpaces(normalized.coreConclusion || "");
    if (cc) {
      return "次に変える: " + clipComicLine(cc, 84);
    }
    return "次に変える: " + clipComicLine(learningForPanel4, 84);
  }

  function comicPanel3DialogueFromInput(normalized, protagonist, partner, toneData, style) {
    if (style === "kindle") {
      return comicPanel3Dialogue(toneData, protagonist, partner, style);
    }
    const axis = normalized.topicAxis || "general";
    const a = clipComicLine(normalized.coreMain || normalized.theme, 40);
    const b = clipComicLine(copilotSecondLineForTopic(axis, normalized.learning, toneData), 40);
    return [`${protagonist}: ${a}`, `${partner}: ${b}`];
  }

  function comicPanel2PartnerLineGrounded(normalized, toneData, partner, style) {
    if (normalized.corePhrase) {
      return `${partner}: 「${normalized.corePhrase}」`;
    }
    const axis = normalized.topicAxis || "general";
    const probe = partnerProbeLine(axis, normalized.theme);
    if (style === "kindle") {
      return `${partner}: ${probe}`;
    }
    return `${partner}: ${probe}`;
  }

  function buildComic(input) {
    const normalized = normalizeInput(input);
    const toneData = templates.toneTemplates[normalized.tone];
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const protagonist = templates.characterProfile.protagonist.name;
    const partner = templates.characterProfile.partner.name;
    const reviewMode = isReviewComicContext(normalized);
    const rawInc = trimOptional(input.incident);
    const incidentForComic = rawInc ? ensurePeriod(rawInc) : normalized.incident;
    const st = normalized.outputStyle;
    const learningForPanel4 = normalized.coreConclusion || normalized.learning;
    const gapLine = buildComicGapNarrative(normalized, incidentForComic, reviewMode);
    const insightLine = buildComicInsightNarrative(normalized);
    const forwardLine = buildComicForwardNarrative(normalized, learningForPanel4);
    const panel3Conversation = comicPanel3DialogueFromInput(normalized, protagonist, partner, toneData, st);
    const panel2PartnerLine = comicPanel2PartnerLineGrounded(normalized, toneData, partner, st);

    const panel1Lines = [COMIC_PANEL_LABELS.p1, `状況: ${incidentForComic}`];

    const panel3Lines = [COMIC_PANEL_LABELS.p3, insightLine, panel3Conversation[0], panel3Conversation[1]];

    return [
      `【タイトル】${leadTitle}`,
      "",
      panel1Lines.join("\n"),
      "",
      COMIC_PANEL_LABELS.p2,
      gapLine,
      panel2PartnerLine,
      "",
      panel3Lines.join("\n"),
      "",
      COMIC_PANEL_LABELS.p4,
      forwardLine,
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
      2: "やや寄り、引っかかりや緊張が分かる構図",
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
      const rawBundle = situation || learningLine || narrativeLines.join(" ");
      const summary = compactSpaces(
        rawBundle
          .replace(/^状況:\s*/, "")
          .replace(/^学び:\s*/, "")
          .replace(/^次に変える:\s*/, "")
          .replace(/^気づき:\s*/, "")
          .replace(/^ズレ:\s*/, "")
      );
      const sceneIntent = dialogueLines.join(" / ") || "表情と構図で短い対話の気配を示す。";
      return `${meta.number}コマ（${meta.name}）: ${summary || "今回の入力に沿った情景。"} — ねらい: ${sceneIntent}`;
    });

    const uip = templates.characterProfile.unifiedImagePrompt;
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const styleHint = unifiedStyleHintLine(normalized.outputStyle);
    const lookLine = uip
      ? `見た目固定: ${protagonist}＝${uip.protagonistVisual}／${partner}＝${uip.partnerVisual}。トーン: ${uip.seriesTheme}・${uip.businessTone}。`
      : "";

    return [
      "【4コマ統合画像プロンプト】",
      `【入力反映】${leadTitle}`,
      styleHint,
      "1枚のキャンバスに4コマ（2x2）・枠で区切る・Z字読み。白黒ゆる線・背景は最小。ポスター一枚絵にしない。",
      lookLine,
      `キャラ同一: ${protagonist}、${partner}（${normalized.characters}）。${styleGuide}`,
      "画像内に文字・吹き出し・ロゴを入れない（下は作画意図のみ）。",
      "【今回のコマ（入力固有・重複なく）】",
      panelSummaries.join("\n"),
    ]
      .concat(buildCoreLockUnifiedLines(normalized))
      .concat([
        "最終: 4コマの境界と読み順が一目で分かる構図にする。",
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
      "4コマの流れ: 出来事 → 引っかかり → 気づき → 次の一手。最終コマは改善・前進の印象で締める。",
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
      return "満足のあとに口コミが増えないとき、まず見るのは「導線」と「客層の行動」の噛み合わせだ。";
    }
    if (b === "satisfactionKuchikomi") {
      return "満足の瞬間と、口コミの動きは同じタイミングでは起きない。どこで噛み合わない？";
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
      return base + " 今日は、論点を一言で言い切る。";
    }
    if (preset === "soft") {
      return base + " 今日は、ちょっとだけ静かに。";
    }
    if (preset === "biz") {
      return base + " 現場の話は、次の一手に落とす。";
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
        s = "この場面で、" + s + "——ここが、その日の出来事の芯だった。";
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
    if (
      blobIndex(bundle, "価格") >= 0 ||
      blobIndex(bundle, "客層") >= 0 ||
      blobIndex(bundle, "安く") >= 0 ||
      blobIndex(bundle, "安売") >= 0 ||
      blobIndex(bundle, "最安") >= 0 ||
      blobIndex(bundle, "最安値") >= 0 ||
      blobIndex(bundle, "安値") >= 0
    ) {
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

  function pickNoteTurnForTopicAxis(axis, normalized, preset) {
    const p = preset || "";
    if (axis === "review") {
      return pickNoteTurnMidBranch("review", p);
    }
    if (axis === "price") {
      return pickNoteTurnMidBranch("price", p);
    }
    if (axis === "contract") {
      return pickNoteTurnMidBranch("contract", p);
    }
    if (axis === "site_ops") {
      if (p === "strong") {
        return "だが、段取りのズレは、能力不足より「順番の未共有」で起きることが多い。";
      }
      if (p === "soft") {
        return "けれど、小さな手戻りは、積み上がると流れを止める。";
      }
      if (p === "biz") {
        return "でも、段取りは短い言語化で共有できる。";
      }
      return "でも、順番のズレが積み上がると、現場のリズムが乱れる。";
    }
    if (axis === "alignment_comm") {
      if (p === "strong") {
        return "だが、伝え方と受け取り方のズレは、放置すると手戻りが増える。";
      }
      if (p === "soft") {
        return "けれど、言葉の当たり前は人それぞれで、ここが衝突点になりやすい。";
      }
      if (p === "biz") {
        return "でも、伝達は「誰が・いつ・何を」に落とすと、論点がぶれにくい。";
      }
      return "でも、伝えたつもりと受け取りは、同じにならないことがある。";
    }
    if (axis === "human_relation") {
      if (p === "strong") {
        return "だが、関係の良さだけでは、ルールの外に出る問題は防げない。";
      }
      if (p === "soft") {
        return "けれど、気持ちの良さと、やってよい線は別物だ。";
      }
      if (p === "biz") {
        return "でも、人としての線引きを先に置くほうが、長く続く。";
      }
      return "でも、人としての線引きが曖昧だと、後からしんどくなる。";
    }
    if (axis === "apprentice_education") {
      if (p === "strong") {
        return "だが、育成の延長で役割が曖昧だと、商流の外で火がつく。";
      }
      if (p === "soft") {
        return "けれど、善意でも境界がないと、信頼が逆に削れる。";
      }
      if (p === "biz") {
        return "でも、誰の顧客に誰が触れるかを先に決めると、事故が減る。";
      }
      return "でも、役割の境界は、関係が良いほど言葉にしておきたい。";
    }
    if (axis === "sales") {
      if (p === "strong") {
        return "だが、商流の外で動くと、信頼の前提が崩れやすい。";
      }
      if (p === "soft") {
        return "けれど、成果の前に、誰の顧客かが曖昧だと、あとから揉めやすい。";
      }
      if (p === "biz") {
        return "でも、獲得導線は、担当と顧客の定義をセットで見る。";
      }
      return "でも、営業の筋道は、関係の良さとは別に決めたい。";
    }
    if (axis === "emotion") {
      if (p === "strong") {
        return "だが、感情は事実と別に切り出すと、次の一手が軽くなる。";
      }
      if (p === "soft") {
        return "けれど、気持ちは否定せず、次の行動だけを一つにする。";
      }
      if (p === "biz") {
        return "でも、反省は一つに言語化すると、再発防止に繋がる。";
      }
      return "けれど、感情と判断は、一度分けて書くと次が決めやすい。";
    }
    if (axis === "customer_fit") {
      if (p === "strong") {
        return "だが、相性の良し悪しは、価格や期待の置き方とセットで見える。";
      }
      if (p === "soft") {
        return "けれど、合う合わないは、気持ちだけの話では片づかない。";
      }
      if (p === "biz") {
        return "でも、客層は図にすると、次の意思決定が早い。";
      }
      return "でも、向き不向きは、前提の置き方で変わる。";
    }
    if (axis === "general") {
      if (p === "strong") {
        return "だが、困っているのは「誰が・何を・どこまで」かが、まだ一枚に乗っていないときだ。";
      }
      if (p === "soft") {
        return "けれど、いまの場面で一番重いのは、役割の線が曖昧な点だ。";
      }
      if (p === "biz") {
        return "でも、論点を一つに言語化すると、説明の負担が下がる。";
      }
      return "でも、いまの場面で一番重いのは、役割の線が曖昧な点だ。";
    }
    return "";
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
        return "だが、段取りのズレは、能力不足より「順番の未共有」で起きることが多い。";
      }
      if (p === "soft") {
        return "けれど、小さな手戻りは、積み上がると流れを止める。";
      }
      if (p === "biz") {
        return "でも、段取りは短い言語化で共有できる。";
      }
      return "でも、順番のズレが積み上がると、現場のリズムが乱れる。";
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
      return "でも、論点を一つにすると、次が見えやすい。";
    }
    return "でも、一段だけ視点を変える。";
  }

  function buildNoteTurnAndWhyLegacy(normalized) {
    const why = buildNoteWhy(normalized);
    const first = compactSpaces(why.split("。")[0] || "");
    const p = normalized.notePreset || "";
    const ax = normalized.topicAxis || inferTopicAxis(noteContextBundle(normalized));
    if (!first) {
      if (ax === "human_relation") {
        return "それでも、関係の良さだけでは、ルールの外に出る問題は防げない。";
      }
      if (ax === "apprentice_education") {
        return "それでも、役割の境界は、関係が良いほど言葉にしておきたい。";
      }
      if (ax === "alignment_comm") {
        if (p === "strong") {
          return "それでも、同じ出来事でも、見え方は人によって違う。";
        }
        if (p === "soft") {
          return "ただ、同じ出来事でも、見え方は人によって違う。";
        }
        if (p === "biz") {
          return "ただ、伝達を「誰が・いつ・何を」に落とすと、論点がぶれにくい。";
        }
        return "ただ、同じ出来事でも、見え方は人によって違う。";
      }
      if (p === "strong") {
        return pickNoteTurnAlternateFallback(p);
      }
      if (p === "soft") {
        return pickNoteTurnAlternateFallback(p);
      }
      if (p === "biz") {
        return "ただ、論点を一つにすると、次の意思決定が早い。";
      }
      return pickNoteTurnAlternateFallback(p);
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

  function buildNoteTurnFromClassifiedBranch(normalized, preset) {
    const branch = classifyNoteMidBranch(noteContextBundle(normalized));
    const p = preset || "";
    if (branch === "default") {
      return "";
    }
    return pickNoteTurnMidBranch(branch, p);
  }

  function buildNoteTurnAndWhy(normalized) {
    const p = normalized.notePreset || "";
    const axis = normalized.topicAxis || inferTopicAxis(noteContextBundle(normalized));
    let turn = pickNoteTurnForTopicAxis(axis, normalized, p);
    if (!turn) {
      turn = buildNoteTurnFromClassifiedBranch(normalized, p);
    }
    if (!turn) {
      return buildNoteTurnAndWhyLegacy(normalized);
    }
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

  /**
   * 結論欄が空のときの締め。本文は「今回の話」に接続し、4コマ向けの「次の一枚」や汎用の「それで十分」は出さない。
   */
  function buildNoteClosingNoConclusionTied(normalized, reviewish, p, bundle) {
    const ax = normalized.topicAxis || inferTopicAxis(noteContextBundle(normalized));
    const rb = reviewish ? pickReviewClosingBranchNoConclusion(bundle) : "";
    const nb = !reviewish ? pickNonReviewClosingBranchNoConclusion(bundle) : "";
    if (reviewish) {
      if (rb === "relation") {
        return "次の現場では、満足の直後に置く声かけを一つだけ決める。";
      }
      if (rb === "guide") {
        return "次の現場では、満足の直後に置く導線を一つだけ言語化する。";
      }
      return "次の現場では、試す一文を一つ決める。";
    }
    if (nb === "contract") {
      return "次の一件では、続け方の判断を売上の数字だけに寄せない。";
    }
    if (nb === "price") {
      return "次の見積では、価格と客層の両方を一つだけ言葉にする。";
    }
    if (ax === "human_relation") {
      return "次の現場では、人としての線引きを一つだけ先に決める。";
    }
    if (ax === "apprentice_education") {
      return "次の現場では、誰の顧客に誰が触れるかを一つだけ約束する。";
    }
    if (ax === "sales") {
      return "次の機会では、商流の筋道を一つだけ先に決める。";
    }
    if (ax === "alignment_comm") {
      return "次の打ち合わせでは、伝える順と役割を一つだけ決める。";
    }
    if (ax === "site_ops") {
      return "次の現場では、順番の確認を一つだけ共有する。";
    }
    if (ax === "emotion") {
      return "次の同じ場面では、感情と判断を一行で分けてから動く。";
    }
    if (ax === "customer_fit") {
      return "次の案件では、向き不向きを価格と期待の置き方で一度だけ見直す。";
    }
    if (p === "biz") {
      return "次の現場では、短い手順を一つだけ現場に置く。";
    }
    if (p === "strong") {
      return "次の現場では、いまの場面で一番重かった点を一つだけ言い切る。";
    }
    if (p === "soft") {
      return "次の現場では、同じ場面で一つだけ試す。";
    }
    return "次の現場では、同じ場面で一つだけ試す。";
  }

  function buildNoteFinalTailNoConclusion(normalized, reviewish, p, bundle) {
    return buildNoteClosingNoConclusionTied(normalized, reviewish, p, bundle);
  }

  function buildNoteFinalBlock(normalized) {
    const bundle = noteFinalClosingBundle(normalized);
    const srcLegacy = ((normalized.theme || "") + " " + (normalized.incident || "")).toLowerCase();
    const reviewishLegacy = srcLegacy.indexOf("口コミ") >= 0 || srcLegacy.indexOf("レビュー") >= 0;
    const reviewishBranch = bundle.indexOf("口コミ") >= 0 || bundle.indexOf("レビュー") >= 0;
    const p = normalized.notePreset || "";
    if (normalized.coreConclusion) {
      const phrase = compactSpaces(normalized.corePhrase || "");
      const nextLine = phrase
        ? "次は、「" + phrase + "」を一つだけ入れて試す。"
        : "次は、この結論を一つだけ行動に落とす。";
      return normalized.coreConclusion + "\n\n" + nextLine;
    }
    return buildNoteFinalTailNoConclusion(normalized, reviewishBranch, p, bundle);
  }

  function buildNoteWhy(normalized) {
    const src = (normalized.theme + " " + normalized.incident).toLowerCase();
    const axis = normalized.topicAxis || inferTopicAxis(noteContextBundle(normalized));
    if (src.indexOf("口コミ") >= 0 || src.indexOf("レビュー") >= 0) {
      return "起きやすいのは、満足した瞬間は「お礼」で終わり、口コミが必要だという気持ちはまだ起きていないからです。だからこそ、タイミングと手間を減らす導線が効いてきます。";
    }
    if (normalized.comicPattern === "ヒヤリ型") {
      return "起きやすいのは、焦りや慣れです。一瞬の判断で手順を飛ばすと、空気が張りつめます。安全優先で止め、手順を再確認するほうが、結果的に早いです。";
    }
    if (axis === "price" || axis === "customer_fit") {
      return "起きやすいのは、価格は「安さ」だけでなく、集まる仕事の種類と空気の質も変えるからです。誰に向けてどう並べるかが、見えないままだと迷いが続きます。";
    }
    if (axis === "human_relation") {
      return "起きやすいのは、関係が良いほど、ルールや役割の線が曖昧になりやすいからです。気持ちの良さだけでは、越えてはいけない線が守れないことがあります。";
    }
    if (axis === "apprentice_education") {
      return "起きやすいのは、育成や協力の延長で、役割の境界が曖昧になるからです。善意でも、商流の外で動くと、信頼の前提が崩れやすいです。";
    }
    if (axis === "sales") {
      return "起きやすいのは、成果の前に、誰がどの顧客に向けるかという前提が揃っていないまま動くと、後から火がつくからです。";
    }
    if (axis === "emotion") {
      return "起きやすいのは、感情は事実と別に扱わないと、次の判断が重くなるからです。一度言葉にすると、次の一手が決めやすくなります。";
    }
    if (axis === "site_ops") {
      return "起きやすいのは、大きなミスではなくても、順番の違いが積み上がると、現場のリズムが乱れるからです。";
    }
    if (axis === "contract") {
      return "起きやすいのは、売上の伸びと、続け方の負担は別問題だからです。数字だけでは、次の判断が誤りやすいです。";
    }
    if (axis === "alignment_comm" || normalized.comicPattern === "誤解型") {
      return "起きやすいのは、言葉の当たり前が人それぞれだからです。伝えたつもりが伝わっておらず、同じ現場でも見え方が分かれると、手戻りは一気に膨らみます。";
    }
    return "起きやすいのは、一度の場面に「正しさ」が複数あると、あとから説明が重くなるからです。役割の線を一文にすると、次の一手が決めやすくなります。";
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
    return "いま一番大事な一文を決める";
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
    return shortenTitlePart(th, 32) || "その日の引っかかり";
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
    return shortenTitlePart(th, 34) || "続きが気になるポイント";
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

  function stripNoteLeadingHeading(noteText) {
    const raw = (noteText || "").toString();
    if (!raw) {
      return "";
    }
    const lines = raw.split("\n");
    let i = 0;
    if (i < lines.length && /^\s*#\s+/.test(lines[i])) {
      i += 1;
      while (i < lines.length && lines[i] === "") {
        i += 1;
      }
    }
    return lines.slice(i).join("\n");
  }

  /**
   * 投稿前の軽い確認メモ（採点ではない）。note本文・タイトル案ブロックを材料にルールベースで生成する。
   */
  function buildNotePrePublishCheck(normalized, noteBodyOnly, titleSuggestionsBlock) {
    const body = compactSpaces(noteBodyOnly || "");
    if (!body) {
      return "先に「構成を生成」すると、ここに確認メモが出ます。";
    }

    const theme = compactSpaces(normalized.theme || "");
    const coreMain = compactSpaces(normalized.coreMain || "");
    const titleBlock = (titleSuggestionsBlock || "").toString();

    const goodLines = [];
    const concernLines = [];
    let oneThing = "";

    const paragraphs = body.split(/\n\s*\n/).map(function (p) {
      return p.trim();
    }).filter(Boolean);
    const paraCount = paragraphs.length;

    // --- メモ臭さ ---
    if (paraCount >= 2) {
      goodLines.push("段落に分かれていて、読みやすい余白があります。");
    }
    const bodyTrim = body.trim();
    if (/^[・\-*＊]/.test(bodyTrim) || /\n[・\-*＊]/.test(body)) {
      concernLines.push("箇条書きが目立つと、記事よりメモに近く見えることがあります。必要なら冒頭を一文に整えてみてください。");
    }
    if (/メモ|補足[:：]|日報の写し|以下[、。]/.test(body)) {
      concernLines.push("「メモ」「補足」などの語があると、作業ログの印象が強くなることがあります（メモ臭さ）。");
    }
    if (paraCount === 1 && body.length > 380) {
      concernLines.push("一段落が長いと、読みやすさは人によって差が出ます。空行を足すだけでも変わることがあります。");
    }

    // --- 文章の硬さ ---
    if (/である[。]?$|である。|当該|について、|以下のとおり|いたします|させていただ|において/.test(body)) {
      concernLines.push("少し事務的な言い回しが混ざっているかもしれません（文章の硬さ）。");
    } else {
      goodLines.push("話し言葉に近いトーンで、堅すぎない読み心地です。");
    }

    // --- 主語のぶれ ---
    const subjectMarkers = ["私たち", "私達", "当社", "当方", "うち", "現場", "お客様", "お客さん", "お客", "依頼主", "職人", "若手", "班"];
    const hit = [];
    for (let i = 0; i < subjectMarkers.length; i += 1) {
      if (body.indexOf(subjectMarkers[i]) >= 0) {
        hit.push(subjectMarkers[i]);
      }
    }
    if (body.indexOf("私") >= 0 && body.indexOf("私たち") < 0 && body.indexOf("私達") < 0) {
      hit.push("私");
    }
    if (hit.length >= 3) {
      concernLines.push(
        "視点の語（「" + hit.slice(0, 3).join("」「") + "」など）が複数あります。主語のぶれとして読み手が拾うかもしれません。"
      );
    } else if (hit.length === 0 && body.length > 140) {
      concernLines.push("「誰の視点」かが少し淡いかもしれません。必要なら一文だけ主語を足すと伝わりやすいです。");
    }

    // --- タイトルとの整合（テーマ語が冒頭付近にあるか） ---
    function openingTouchesSeed(seed, opening) {
      const s = compactSpaces(seed || "");
      if (s.length < 2) {
        return false;
      }
      if (s.length <= 8 && opening.indexOf(s) >= 0) {
        return true;
      }
      for (let j = 0; j <= s.length - 2; j += 1) {
        const bi = s.slice(j, j + 2);
        if (bi.replace(/\s/g, "").length >= 2 && opening.indexOf(bi) >= 0) {
          return true;
        }
      }
      return false;
    }
    const openingWindow = body.slice(0, 220);
    const titleSeeds = [];
    if (theme) {
      titleSeeds.push(theme);
    }
    if (coreMain) {
      titleSeeds.push(coreMain);
    }
    const titleLines = titleBlock.split("\n");
    for (let t = 0; t < titleLines.length; t += 1) {
      const line = titleLines[t];
      const m = line.match(/:\s*(.+)$/);
      if (m && m[1]) {
        const cleaned = compactSpaces(m[1].replace(/^[^｜]+｜/, ""));
        if (cleaned.length > 3) {
          titleSeeds.push(cleaned);
        }
      }
    }
    let touchOpening = false;
    for (let u = 0; u < titleSeeds.length; u += 1) {
      if (openingTouchesSeed(titleSeeds[u], openingWindow)) {
        touchOpening = true;
        break;
      }
    }
    if (touchOpening) {
      goodLines.push("タイトルやテーマに近い語が、本文の冒頭付近にも出ています（顔の揃い）。");
    } else if (theme.length > 3 || coreMain.length > 3) {
      concernLines.push("タイトル案やテーマの語が、本文の冒頭付近に少ないかもしれません（タイトルとの整合）。違和感がなければそのままで大丈夫です。");
    }

    // --- note向き ---
    if (body.length >= 80 && body.length <= 3200) {
      goodLines.push("長さは、note の記事として一般的な範囲に収まっています。");
    } else if (body.length < 70) {
      concernLines.push("短めのため、読み手によっては物足りなさを感じるかもしれません（note向き）。");
    }

    function uniq(arr) {
      const seen = {};
      const out = [];
      for (let i = 0; i < arr.length; i += 1) {
        const k = arr[i];
        if (!seen[k]) {
          seen[k] = true;
          out.push(k);
        }
      }
      return out;
    }
    const goodU = uniq(goodLines);
    const concernU = uniq(concernLines);

    if (concernU.length) {
      oneThing = concernU[0];
    } else if (goodU.length) {
      oneThing = "タイトル案のどれかと、本文の冒頭が同じ方向を向いているか（矛盾がないか）だけ、もう一度見てください。";
    } else {
      oneThing = "全体を通して読み、違和感がなければそのまま投稿して大丈夫です。";
    }

    const goodBlock = goodU.length ? goodU.map(function (g) {
      return "・" + g;
    }).join("\n") : "・（特筆する点はありません。問題なければこのままで大丈夫です。）";
    const concernBlock = concernU.length
      ? concernU.map(function (c) {
          return "・" + c;
        }).join("\n")
      : "・（大きな気になる点は拾いにくい状態です。最終は感覚で大丈夫です。）";

    return [
      "【投稿前の確認メモ】",
      "貼る前のあと一歩用です。断定ではなく、目安として使ってください。",
      "",
      "■ 良い点",
      goodBlock,
      "",
      "■ 気になる点",
      concernBlock,
      "",
      "■ 投稿前に1つだけ見るなら",
      "・" + oneThing,
    ].join("\n");
  }

  function firstSentenceJapanese(text) {
    const t = compactSpaces(text);
    if (!t) {
      return "";
    }
    const m = t.match(/^[^。！？!?]+[。！？!?]?/);
    return m ? m[0] : t;
  }

  function storyFirstParagraphOnly(story) {
    const s = (story || "").toString();
    const idx = s.indexOf("\n\n");
    if (idx < 0) {
      return s.trim();
    }
    return s.slice(0, idx).trim();
  }

  function stripImakawaPrefix(s) {
    return compactSpaces((s || "").replace(/^今回は[、,]\s*/, ""));
  }

  function shouldSkipSeparateOpening(story, opening) {
    const st = stripImakawaPrefix(firstSentenceJapanese(storyFirstParagraphOnly(story)));
    const os = stripImakawaPrefix(firstSentenceJapanese(opening));
    if (!st || !os) {
      return false;
    }
    if (st === os) {
      return true;
    }
    const n = Math.min(16, st.length, os.length);
    if (n >= 14 && st.slice(0, n) === os.slice(0, n)) {
      return true;
    }
    if (st.length >= 12 && os.length >= 12 && (st.indexOf(os) >= 0 || os.indexOf(st) >= 0)) {
      return true;
    }
    return false;
  }

  /**
   * 1段目: 出来事。冒頭と実話が同じ言い換えにならないよう、重複時は story のみ。
   */
  function buildNoteIncidentBlockForArticle(normalized, toneData, story) {
    const opening = buildNoteOpeningForArticle(normalized, toneData, story);
    const st = compactSpaces(story);
    if (!st) {
      return compactSpaces(opening) || ensurePeriod(normalized.incident);
    }
    if (shouldSkipSeparateOpening(story, opening)) {
      return story;
    }
    const o = compactSpaces(opening);
    if (o && st.indexOf(o) < 0 && o.indexOf(st) < 0) {
      return o + "\n\n" + story;
    }
    return story;
  }

  function dedupeLearningVersusTurn(learn, turn, normalized) {
    const L = compactSpaces(learn);
    const T = compactSpaces(turn);
    if (!L || !T || !turnLineOverlapsLearning(T, L)) {
      return learn;
    }
    const cm = compactSpaces(normalized.coreMain || "");
    if (cm.length > 8) {
      return ensurePeriod("この日の学びとして残したのは、「" + cm + "」という感覚だった。");
    }
    const one = L.split(/[。\n]/)[0];
    return ensurePeriod(one || L);
  }

  function buildNoteOpeningForArticle(normalized, toneData, story) {
    const theme = compactSpaces(normalized.theme || "");
    const core = compactSpaces(normalized.coreMain || "");
    const headBlock = compactSpaces((story || "").split(/\n\n+/)[0] || story || "");
    const leadFirst = compactSpaces(firstSentenceJapanese(headBlock) || headBlock);
    if (leadFirst.length > 10) {
      if (theme && leadFirst.indexOf(theme) === 0) {
        const rest = leadFirst.slice(theme.length).replace(/^[｜、。\s]+/, "");
        return rest ? "今回は、" + rest : "今回は、" + leadFirst;
      }
      return "今回は、" + leadFirst;
    }
    if (core) {
      if (theme && core.toLowerCase() !== theme.toLowerCase()) {
        return "今回は、「" + theme + "」の話で、" + (firstSentenceJapanese(core) || core);
      }
      return "今回は、" + (firstSentenceJapanese(core) || core);
    }
    const q = noteOpeningQuestionLine(normalized);
    if (q) {
      return q;
    }
    return noteLeadWithPreset(toneData, normalized.notePreset);
  }

  function shortenNoteFinalBlockForLength(normalized) {
    if (normalized.coreConclusion) {
      const phrase = compactSpaces(normalized.corePhrase || "");
      const nextLine = phrase ? "次は「" + phrase + "」を一つ。" : "次はこの結論を一つに落とす。";
      return normalized.coreConclusion + "\n\n" + nextLine;
    }
    const bundle = noteFinalClosingBundle(normalized);
    const reviewishBranch = bundle.indexOf("口コミ") >= 0 || bundle.indexOf("レビュー") >= 0;
    const p = normalized.notePreset || "";
    return buildNoteFinalTailNoConclusion(normalized, reviewishBranch, p, bundle);
  }

  function extendNoteStoryOrLearning(story, learningLine, normalized) {
    const axis = normalized.topicAxis || inferTopicAxis(noteContextBundle(normalized));
    let extra = "";
    if (axis === "review") {
      extra = "満足の瞬間を終わりにしないと、口コミは動きにくい。";
    } else if (axis === "sales" || axis === "apprentice_education") {
      extra = "商流の外で動くと、あとからの説明が重くなる。";
    } else if (axis === "site_ops") {
      extra = "順番の未共有が、小さな手戻りを増やす。";
    } else if (axis === "human_relation") {
      extra = "関係の良さだけでは、役割の外に出る問題は防げない。";
    } else if (axis === "emotion") {
      extra = "感情と判断を分けて書くと、次の一手が軽くなる。";
    } else {
      extra = "細部が積み上がると、現場の空気が変わる。";
    }
    if (story.indexOf("\n\n") < 0) {
      return {
        story: story + "\n\n" + extra,
        learningLine,
      };
    }
    const tail = "次の現場でも、同じ手順で試す。";
    return {
      story,
      learningLine: learningLine ? learningLine + "\n\n" + tail : tail,
    };
  }

  function buildNoteShortSpaced(normalized, input, toneData, leadTitle, learningLine) {
    const len = normalized.noteLengthPreset || "standard";
    let story = buildNoteStoryAndPhrase(normalized, input);
    let incidentBlock = buildNoteIncidentBlockForArticle(normalized, toneData, story);
    let turn = buildNoteTurnAndWhy(normalized);
    let learn = dedupeLearningVersusTurn(learningLine, turn, normalized);
    let finalBlock = buildNoteFinalBlock(normalized);

    if (len === "short") {
      incidentBlock = storyFirstParagraphOnly(incidentBlock);
      turn = firstSentenceJapanese(turn) || turn;
      learn = firstSentenceJapanese(learn) || learn;
      finalBlock = shortenNoteFinalBlockForLength(normalized);
    } else if (len === "extended") {
      const ex = extendNoteStoryOrLearning(story, learn, normalized);
      story = ex.story;
      learn = ex.learningLine;
      incidentBlock = buildNoteIncidentBlockForArticle(normalized, toneData, story);
    }

    const parts = [
      `# ${leadTitle}`,
      "",
      incidentBlock,
      "",
      turn,
      "",
      learn,
      "",
      finalBlock,
    ];
    return parts.join("\n");
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
    let longBody = `今回の出来事から拾った結論は「${normalized.learning}」。${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}のメモとして残すなら、次の一歩を一つにすると運びやすい。`;
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
    const noteHeaded = buildNote(input);
    const noteBodyOnly = stripNoteLeadingHeading(noteHeaded);
    const noteTitleSuggestions = buildNoteTitleCandidateBlock(normalized);
    return {
      comic: buildComic(input),
      comicPrompt: buildComicPanelPrompts(input),
      comicUnifiedPrompt: buildUnifiedComicImagePrompt(input),
      note: noteHeaded,
      noteBodyOnly: noteBodyOnly,
      noteTitleSuggestions: noteTitleSuggestions,
      notePrePublishCheck: buildNotePrePublishCheck(normalized, noteBodyOnly, noteTitleSuggestions),
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
    stripNoteLeadingHeading,
    buildNotePrePublishCheck,
    buildXPost,
    buildAllOutputs,
  };
})();
