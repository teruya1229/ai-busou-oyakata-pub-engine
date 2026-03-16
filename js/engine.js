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

  function ensureLearningText(text) {
    const trimmed = compactSpaces(text);
    if (!trimmed) {
      return "短い確認でも、先に共通認識を作るとズレが減る。";
    }
    if (trimmed.length < 10) {
      return ensurePeriod(trimmed) + " この学びを次の現場でも再現する。";
    }
    return ensurePeriod(trimmed);
  }

  function ensureIncidentText(text) {
    const trimmed = compactSpaces(text);
    if (!trimmed) {
      return "作業前の認識がそろわず、手戻りが出た。";
    }
    if (trimmed.length < 16) {
      return ensurePeriod(trimmed) + " その結果、段取りに迷いが生まれた。";
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
    const learning = ensureLearningText(input.learning);
    const theme = safeText(input.theme, "").trim() || "現場の小さな改善";
    const characters = normalizeCharacters(input.characters);
    const comicPattern = selectComicPattern(incident, learning);

    return {
      theme,
      incident,
      learning,
      characters,
      tone,
      comicPattern,
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

  function buildNote(input) {
    const normalized = normalizeInput(input);
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const toneData = templates.toneTemplates[normalized.tone];
    const pattern = templates.comicPatterns[normalized.comicPattern];
    return [
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
    ].join("\n");
  }

  function buildXPost(input) {
    const normalized = normalizeInput(input);
    const toneData = templates.toneTemplates[normalized.tone];
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const shortText = `【${toneData.xLead}】${leadTitle}\n${normalized.incident}\n学び: ${normalized.learning}`;
    const longText = `${leadTitle}\n現場のズレは、能力不足より「前提の未共有」で起きることが多い。${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}で整理した結論は「${normalized.learning}」。トーンは「${normalized.tone}」で共有。`;

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
      comic: buildComic(normalized),
      note: buildNote(normalized),
      xPost: buildXPost(normalized),
    };
  }

  window.AIBusouEngine = {
    normalizeInput,
    buildComic,
    buildNote,
    buildXPost,
    buildAllOutputs,
  };
})();
