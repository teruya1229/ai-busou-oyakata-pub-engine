(function () {
  const templates = window.AIBusouTemplates;

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

  function normalizeInput(input) {
    const tone = templates.toneTemplates[input.tone] ? input.tone : "ゆるい";
    const incident = ensureIncidentText(input.incident);
    const learning = ensureLearningText(input.learning, incident);
    const theme = safeText(input.theme, "").trim() || "現場の小さな改善";
    const characters = normalizeCharacters(input.characters);
    const comicPattern = selectComicPattern(incident, learning);
    const inputSparse =
      !compactSpaces(input.theme) ||
      !compactSpaces(input.characters) ||
      compactSpaces(input.incident).length < 10 ||
      compactSpaces(input.learning).length < 6;
    const learningFocus =
      comicPattern === "誤解型"
        ? "短文・空欄入力でも、確認の要点を一つに絞って学びとして残す。"
        : "入力が短くても、改善点を一つ具体化して次の現場につなげる。";

    return {
      theme,
      incident,
      learning,
      characters,
      tone,
      comicPattern,
      inputSparse,
      learningFocus,
    };
  }

  function buildComic(input) {
    const normalized = normalizeInput(input);
    const toneData = templates.toneTemplates[normalized.tone];
    const pattern = templates.comicPatterns[normalized.comicPattern];
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const protagonist = templates.characterProfile.protagonist.name;
    const partner = templates.characterProfile.partner.name;
    const copilotRole = toneData.copilotRole;

    let panel3Conversation = [
      `${protagonist}: ${toneData.oykataLine}${toneData.lineEnd}`,
      `${partner}: ${toneData.copilotReaction}`,
    ];
    if (copilotRole === "low") {
      panel3Conversation = [
        `${protagonist}: ${toneData.oykataLine}${toneData.lineEnd}`,
        `${partner}: 「要点を記録し、次回の確認項目に反映します」`,
      ];
    } else if (copilotRole === "lead") {
      panel3Conversation = [
        `${partner}: ${toneData.copilotQuestion}`,
        `${protagonist}: ${toneData.oykataLine}${toneData.lineEnd}`,
      ];
    }

    return [
      `【タイトル】${leadTitle}`,
      `【型】${pattern.name}`,
      "",
      `1コマ目（導入）`,
      `${toneData.narratorLead}`,
      `${protagonist}と${partner}が現場を見回す。`,
      `状況: ${normalized.incident}`,
      "",
      "2コマ目（問題発生）",
      pattern.panel2,
      `${partner}: ${toneData.copilotQuestion}`,
      "",
      "3コマ目（気づき）",
      pattern.panel3,
      panel3Conversation[0],
      panel3Conversation[1],
      "",
      "4コマ目（学び）",
      `学び: ${normalized.learning}`,
      pattern.panel4,
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
      1: "導入の観察表情、落ち着いた雰囲気",
      2: "戸惑いと緊張が少し出る表情",
      3: "気づきが生まれる真剣な表情",
      4: "納得して前向きな表情",
    };
    const compositionByPanel = {
      1: "中景、2人を中心にした導入カット",
      2: "やや寄り、問題点が分かる構図",
      3: "会話が読み取りやすい対話構図",
      4: "引き気味、学びで締める安定構図",
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
    const panelMeta = [
      { number: 1, start: "1コマ目（導入）", next: "2コマ目（問題発生）", name: "導入" },
      { number: 2, start: "2コマ目（問題発生）", next: "3コマ目（気づき）", name: "問題発生" },
      { number: 3, start: "3コマ目（気づき）", next: "4コマ目（学び）", name: "気づき" },
      { number: 4, start: "4コマ目（学び）", next: "", name: "学び" },
    ];

    const panelBlocks = panelMeta.map(function (meta) {
      const lines = extractComicPanelBlock(comicText, meta.start, meta.next);
      return buildPanelPrompt(meta.number, meta.name, lines, normalized, styleGuide);
    });

    return ["【4コマ描画プロンプト】", "（既存の4コマ漫画構成を元に生成）", "", panelBlocks.join("\n\n")].join("\n");
  }

  function buildUnifiedComicImagePrompt(input) {
    const normalized = normalizeInput(input);
    const comicText = buildComic(input);
    const styleGuide = templates.characterProfile.comicStyle.join("、");
    const protagonist = templates.characterProfile.protagonist.name;
    const partner = templates.characterProfile.partner.name;
    const panelMeta = [
      { number: 1, start: "1コマ目（導入）", next: "2コマ目（問題発生）", name: "導入" },
      { number: 2, start: "2コマ目（問題発生）", next: "3コマ目（気づき）", name: "問題発生" },
      { number: 3, start: "3コマ目（気づき）", next: "4コマ目（学び）", name: "気づき" },
      { number: 4, start: "4コマ目（学び）", next: "", name: "学び" },
    ];

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

    return [
      "【4コマ統合画像プロンプト】",
      "これは1枚のポスター・1枚イラスト・全面一枚絵ではない。4コマ漫画（4-panel comic strip）を1枚のキャンバスにまとめた図として描く。",
      "レイアウト必須: 2行×2列（2x2）の等分パネル。各コマは白い枠線または薄い仕切り線で境界をはっきり分け、パネル同士が溶け合わないようにする。",
      "読み順の固定: 左上が1コマ目、右上が2コマ目、左下が3コマ目、右下が4コマ目（日本語の横書きZ字読み）。",
      "ストーリー性: 各コマは起承転結の流れ（導入→問題→気づき→学び）を担い、4コマ全体で一つの短い出来事として完結する。",
      `キャラクター一貫性: 同じ主人公「${protagonist}」と同じ相棒ロボ「${partner}」を全コマで同じ外見・服装・体型として描く。`,
      `登場人物: ${normalized.characters}`,
      `絵柄共通指定: ${styleGuide}`,
      "画風: 白黒漫画、ゆるい線、シンプル背景、必要時のみ最小限の現場要素。",
      "画像内に文字・数字・吹き出し・セリフ・キャプション・ロゴを入れない。下の「情景のねらい」は作画の意図のみで、絵に文字として描かない。",
      "コマ内容のねらい（絵に文字は出さない）:",
      panelSummaries.join("\n"),
      "最終指示: 4コマが1枚の漫画レイアウトとして明確に分かれ、読み順が崩れにくい構図にする。1枚イラスト化・ポスター化しない。",
    ].join("\n");
  }

  function buildNote(input) {
    const normalized = normalizeInput(input);
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const toneData = templates.toneTemplates[normalized.tone];
    const pattern = templates.comicPatterns[normalized.comicPattern];
    const lines = [
      `# ${leadTitle}`,
      "",
      "## 導入",
      `${toneData.noteLead}`,
      `${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}が、今日の現場で気づいたことを共有します。`,
      "",
      "## 現場で起きたこと",
      normalized.incident,
      "",
      "## なぜそれが起きたか",
      `${pattern.name}として現れた背景には、前提や確認粒度のばらつきがありました。`,
      "作業の前提や順番が頭の中だけで共有され、言葉として揃っていなかったためです。",
      "",
      "## 学び",
      normalized.learning,
      "",
      "## まとめ",
      "大きな改善は、短い確認の積み重ねから始まります。AIと経験を併せて、次の一手を丁寧に選ぶことが大切です。",
      "",
      `登場人物: ${normalized.characters}`,
      `トーン: ${normalized.tone}`,
    ];
    if (normalized.inputSparse) {
      lines.splice(lines.indexOf("## まとめ"), 0, `補足: ${normalized.learningFocus}`, "");
    }
    return lines.join("\n");
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
