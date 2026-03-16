(function () {
  const templates = window.AIBusouTemplates;

  function safeText(value, fallback) {
    return (value || "").toString().trim() || fallback;
  }

  function normalizeInput(input) {
    const tone = templates.toneTemplates[input.tone] ? input.tone : "ゆるい";
    return {
      theme: safeText(input.theme, "現場の段取り改善"),
      incident: safeText(input.incident, "作業前の認識がそろわず、手戻りが出た。"),
      learning: safeText(input.learning, "短い確認でも、先に共通認識を作るとズレが減る。"),
      characters: safeText(input.characters, "照屋親方、コパイロット"),
      tone,
    };
  }

  function buildComic(input) {
    const normalized = normalizeInput(input);
    const toneData = templates.toneTemplates[normalized.tone];
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;

    return [
      `【タイトル】${leadTitle}`,
      "",
      `1コマ目（導入）`,
      `${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}が現場を見回す。`,
      `状況: ${normalized.incident}`,
      "",
      "2コマ目（問題発生）",
      "ちょっとした伝達のズレが表面化し、作業に迷いが出る。",
      `${templates.characterProfile.partner.name}: 「どこからズレましたか？」`,
      "",
      "3コマ目（気づき）",
      `${templates.characterProfile.protagonist.name}: 「事実を短く整理してから動こう${toneData.lineEnd}」`,
      `${templates.characterProfile.partner.name}: ${toneData.reaction}`,
      "",
      "4コマ目（学び）",
      `学び: ${normalized.learning}`,
      "小さな確認が、現場全体の安定につながる。",
    ].join("\n");
  }

  function buildNote(input) {
    const normalized = normalizeInput(input);
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    return [
      `# ${leadTitle}`,
      "",
      "## 導入",
      `${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}が、今日の現場で気づいたことを共有します。`,
      "",
      "## 現場で起きたこと",
      normalized.incident,
      "",
      "## なぜそれが起きたか",
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
    const leadTitle = templates.characterProfile.titlePrefix + normalized.theme;
    const shortText = `【${leadTitle}】${normalized.incident} -> 学び: ${normalized.learning}`;
    const longText = `現場のズレは、能力不足より「前提の未共有」で起きることが多い。${templates.characterProfile.protagonist.name}と${templates.characterProfile.partner.name}で整理した結論は「${normalized.learning}」でした。`;

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
