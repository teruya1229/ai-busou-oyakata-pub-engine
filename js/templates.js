(function () {
  const characterProfile = {
    seriesName: "AI武装親方",
    titlePrefix: "AI武装親方｜",
    protagonist: {
      name: "照屋親方",
      traits: [
        "40代職人",
        "冷静",
        "観察者タイプ",
        "基本怒らない",
        "少しユーモアがある",
        "AIと経験を武器に現場で働く",
      ],
    },
    partner: {
      name: "コパイロット",
      traits: ["小さなAIロボ", "素直", "好奇心が強い", "質問役", "読者の疑問を代弁する"],
    },
    comicStyle: [
      "4コマ固定",
      "白黒",
      "ゆるい",
      "背景は基本白",
      "必要時のみ最小限の現場要素",
      "最後は必ず小さな学びで終わる",
    ],
  };

  const toneTemplates = {
    ゆるい: {
      lineEnd: "ですね。",
      reaction: "「なるほど、まずは一歩ずつですね」",
    },
    少し真面目: {
      lineEnd: "です。",
      reaction: "「手順を揃えるだけで結果が変わりますね」",
    },
    かなり真面目: {
      lineEnd: "です。",
      reaction: "「再発防止のため、事実と手順を整理しましょう」",
    },
    コミカル: {
      lineEnd: "だね。",
      reaction: "「親方、今日の学びメーターが上がってます！」",
    },
  };

  const comicBaseTemplate = {
    panel1: "導入: 現場状況の導入",
    panel2: "発生: 問題やズレの発生",
    panel3: "気づき: 親方またはコパイロットの気づき",
    panel4: "締め: 小さな学びで終わる",
  };

  const noteTemplateSections = ["タイトル", "導入", "現場で起きたこと", "なぜそれが起きたか", "学び", "まとめ"];

  const xPostTemplateSections = ["短文版", "やや長文版", "ハッシュタグ案"];

  window.AIBusouTemplates = {
    characterProfile,
    toneTemplates,
    comicBaseTemplate,
    noteTemplateSections,
    xPostTemplateSections,
  };
})();
