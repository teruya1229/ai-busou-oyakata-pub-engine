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
      narratorLead: "肩の力を抜きつつ、現場を丁寧に見るトーン。",
      lineEnd: "ですね。",
      oykataLine: "「まず状況をゆっくりそろえよう」",
      copilotRole: "high",
      copilotQuestion: "「それって、どこからズレたんでしょう？」",
      copilotReaction: "「なるほど、まずは一歩ずつですね」",
      noteLead: "今日は少しゆるめに、でも実務に効く話を共有します。",
      xLead: "今日の現場メモ",
    },
    少し真面目: {
      narratorLead: "落ち着いて事実を整理する標準トーン。",
      lineEnd: "です。",
      oykataLine: "「先に前提を言葉にして、手順を合わせよう」",
      copilotRole: "medium",
      copilotQuestion: "「確認の順番を決めると、ズレは減りますか？」",
      copilotReaction: "「手順を揃えるだけで結果が変わりますね」",
      noteLead: "事実ベースで、再現しやすい学びとして整理します。",
      xLead: "現場での気づき",
    },
    かなり真面目: {
      narratorLead: "再発防止を意識した実務寄りトーン。",
      lineEnd: "です。",
      oykataLine: "「要因を分解し、再発防止の手順まで決めます」",
      copilotRole: "low",
      copilotQuestion: "「再発防止として、最初に固定すべき手順は何ですか？」",
      copilotReaction: "「再発防止のため、事実と手順を整理しましょう」",
      noteLead: "感覚ではなく、要因と手順に分けて記録します。",
      xLead: "再発防止メモ",
    },
    コミカル: {
      narratorLead: "テンポ良く、読後に前向きになるトーン。",
      lineEnd: "だね。",
      oykataLine: "「笑って流さず、要点だけは拾っておこう」",
      copilotRole: "lead",
      copilotQuestion: "「親方、ズレ検知センサーがピコピコしてます！」",
      copilotReaction: "「親方、今日の学びメーターが上がってます！」",
      noteLead: "コミカルに見えて、中身は現場で使える話です。",
      xLead: "本日の親方ログ",
    },
  };

  const comicBaseTemplate = {
    panel1: "導入: 現場状況の導入",
    panel2: "発生: 問題やズレの発生",
    panel3: "気づき: 親方またはコパイロットの気づき",
    panel4: "締め: 小さな学びで終わる",
  };

  const comicPatterns = {
    誤解型: {
      name: "誤解型",
      keywords: ["誤解", "勘違い", "食い違い", "解釈", "伝達", "共有不足", "認識"],
      panel2: "伝えたつもりが伝わっておらず、作業の前提にズレが出る。",
      panel3: "ズレの起点を言葉で揃えると、流れが戻る。",
      panel4: "小さな確認で誤解は早めに回収できる。",
    },
    ヒヤリ型: {
      name: "ヒヤリ型",
      keywords: ["ヒヤリ", "危険", "接触", "落下", "ミス", "寸前", "焦り", "慌て"],
      panel2: "一瞬の油断でヒヤリとする場面が生まれ、空気が張りつめる。",
      panel3: "安全優先で動きを止め、手順を再確認する。",
      panel4: "急がず手順を守ることが、結果的に最短になる。",
    },
    気づき型: {
      name: "気づき型",
      keywords: ["気づき", "改善", "工夫", "効率", "段取り", "時短", "見直し"],
      panel2: "大きな問題ではないが、じわじわ効率を下げるズレが見える。",
      panel3: "小さな工夫を試すと、現場のリズムが整い始める。",
      panel4: "小さな改善の積み重ねが、明日の余裕をつくる。",
    },
  };

  const noteTemplateSections = ["タイトル", "導入", "現場で起きたこと", "なぜそれが起きたか", "学び", "まとめ"];

  const xPostTemplateSections = ["短文版", "やや長文版", "ハッシュタグ案"];

  window.AIBusouTemplates = {
    characterProfile,
    toneTemplates,
    comicBaseTemplate,
    comicPatterns,
    noteTemplateSections,
    xPostTemplateSections,
  };
})();
