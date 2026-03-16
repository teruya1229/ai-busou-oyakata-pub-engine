const testCases = [
  {
    id: "TC-01",
    titleTheme: "朝礼の伝達ズレ",
    incident: "朝礼で伝えた順番が班ごとに違って解釈され、段取りが食い違った。",
    lesson: "着手前に手順を一文でそろえる。",
    characters: "照屋親方、コパイロット、若手職人",
    tone: "少し真面目",
    expectedPattern: "misunderstanding",
    expectedLearningFocus: "伝達内容の解釈差を短い確認で回収する",
  },
  {
    id: "TC-02",
    titleTheme: "荷上げ時のヒヤリ",
    incident: "資材移動中に声かけが遅れ、接触寸前のヒヤリがあった。",
    lesson: "危険時は作業を止め、合図を統一する。",
    characters: "照屋親方、コパイロット、安全担当",
    tone: "かなり真面目",
    expectedPattern: "closeCall",
    expectedLearningFocus: "安全最優先で停止と再確認を徹底する",
  },
  {
    id: "TC-03",
    titleTheme: "段取り見直しで時短",
    incident: "工具配置を少し変えただけで移動が減り、作業が流れやすくなった。",
    lesson: "小さな改善を現場標準にする。",
    characters: "照屋親方、コパイロット",
    tone: "ゆるい",
    expectedPattern: "awareness",
    expectedLearningFocus: "小改善の積み重ねで余裕を作る",
  },
  {
    id: "TC-04",
    titleTheme: "",
    incident: "確認漏れ",
    lesson: "声かけ",
    characters: "",
    tone: "コミカル",
    expectedPattern: "misunderstanding",
    expectedLearningFocus: "短文・空欄入力でも学びを成立させる",
  },
  {
    id: "TC-05",
    titleTheme: "搬入導線の見直し",
    incident: "搬入ルートが他班と重なり、進行が詰まりかけた。",
    lesson: "ルート図を先に共有して干渉を避ける。",
    characters: "照屋親方、コパイロット、搬入担当",
    tone: "少し真面目",
    expectedPattern: "closeCall",
    expectedLearningFocus: "詰まりや事故の芽を事前調整で減らす",
  },
  {
    id: "TC-06",
    titleTheme: "日報の読み合わせ",
    incident: "昨日の記録を読み合わせたら、同じミスの予兆に早く気づけた。",
    lesson: "過去ログは朝の5分で効く。",
    characters: "照屋親方、コパイロット",
    tone: "ゆるい",
    expectedPattern: "awareness",
    expectedLearningFocus: "振り返りを次の実務に接続する",
  },
  {
    id: "TC-07",
    titleTheme: "高所作業の手順再確認",
    incident: "焦って先行しそうになり、足場確認が後手になった。",
    lesson: "急ぐほど先に安全確認。",
    characters: "照屋親方、コパイロット、新人",
    tone: "かなり真面目",
    expectedPattern: "closeCall",
    expectedLearningFocus: "焦りによる手順逸脱を止める",
  },
  {
    id: "TC-08",
    titleTheme: "",
    incident: "改善",
    lesson: "",
    characters: "",
    tone: "ゆるい",
    expectedPattern: "awareness",
    expectedLearningFocus: "入力不足時の補完品質を確認する",
  },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { testCases };
}

if (typeof window !== "undefined") {
  window.AIBusouEvaluationCases = testCases;
}
