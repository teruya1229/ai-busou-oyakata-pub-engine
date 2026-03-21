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
    /** 統合画像プロンプト用：シリーズの情景骨格（buildUnifiedComicImagePrompt で参照） */
    unifiedImagePrompt: {
      seriesTheme: "現場職人がAIを相棒にして前へ進み始める話",
      protagonistVisual:
        "作業着姿。無表情だが優しい、真面目。全コマで同一の見た目・服装・体型。",
      partnerVisual: "小さなAIロボ。親しみやすくシンプルな見た目。全コマで同一デザイン。",
      businessTone: "親しみやすいビジネス4コマ",
      panelArchetype: [
        "1コマ目（疲れ）: 現場帰りの照屋親方が机の前で少し疲れている。仕事は頑張っているのに前に進めない感じ。コパイロットが静かに見ている。",
        "2コマ目（混乱）: 照屋親方が見積もり・連絡・集客・仕事で頭がいっぱい。机の上や頭の周りに情報が散らかっている感じ。コパイロットが整理できそうな雰囲気で近づく。",
        "3コマ目（整理）: 照屋親方とコパイロットが一緒に画面やメモを見ながら考えを整理している。照屋親方の表情が少しやわらぐ。机まわりも少し整ってくる。",
        "4コマ目（前進）: 照屋親方が前向きになり、コパイロットと並んで未来を見るような雰囲気。経験が発信や仕組みに変わっていく明るい終わり方。",
      ],
    },
  };

  const toneTemplates = {
    ゆるい: {
      narratorLead: "肩の力を抜きつつ、現場を丁寧に見るトーン。",
      lineEnd: "ですね。",
      oykataLine: "「まず状況をゆっくりそろえよう」",
      oykataShort: "「まず、そろえよう」",
      partnerShort: "「一歩ずつ」",
      copilotShort: "「で、いちばん引っかかったのは？」",
      copilotRole: "high",
      copilotQuestion: "「それって、どこが一番しんどかった？」",
      copilotReaction: "「なるほど、まずは一歩ずつですね」",
      noteLead: "現場の話は、短くても背景は長いです。",
      xLead: "今日の現場メモ",
    },
    少し真面目: {
      narratorLead: "落ち着いて事実を整理する標準トーン。",
      lineEnd: "です。",
      oykataLine: "「いま起きていることを、短く言語化しよう」",
      oykataShort: "「短く言語化」",
      partnerShort: "「次の一手を一つ」",
      copilotShort: "「確認の順、どこで分かれた？」",
      copilotRole: "medium",
      copilotQuestion: "「いま一番決めないと進まないのはどこ？」",
      copilotReaction: "「事実を一つにすると、次が見えますね」",
      noteLead: "同じ出来事でも、切り口はいくつもあります。",
      xLead: "現場での気づき",
    },
    かなり真面目: {
      narratorLead: "再発防止を意識した実務寄りトーン。",
      lineEnd: "です。",
      oykataLine: "「要因を分解し、再発防止の手順まで決めます」",
      oykataShort: "「要因を分解する」",
      partnerShort: "「手順まで落とす」",
      copilotShort: "「再発防止、最初の一手は？」",
      copilotRole: "low",
      copilotQuestion: "「再発防止として、最初に固定すべき手順は何ですか？」",
      copilotReaction: "「再発防止のため、事実と手順を整理しましょう」",
      noteLead: "再発を防ぐには、感覚ではなく手順まで落とす必要があります。",
      xLead: "再発防止メモ",
    },
    コミカル: {
      narratorLead: "テンポ良く、読後に前向きになるトーン。",
      lineEnd: "だね。",
      oykataLine: "「笑って流さず、要点だけは拾っておこう」",
      oykataShort: "「要点、拾う」",
      partnerShort: "「メーター上がった」",
      copilotShort: "「ピコピコしてます」",
      copilotRole: "lead",
      copilotQuestion: "「親方、今日の論点メーターがピコピコしてます！」",
      copilotReaction: "「親方、今日の学びメーターが上がってます！」",
      noteLead: "堅い話に見えて、最後は一歩だけ前に進む話です。",
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
      keywords: ["誤解", "勘違い", "食い違い", "解釈ずれ", "伝達ミス", "共有不足", "認識のずれ", "認識がそろわ"],
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

  const noteTemplateSections = ["タイトル", "導入", "現場で起きたこと", "なぜそうなったか", "気づき", "まとめ"];

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
