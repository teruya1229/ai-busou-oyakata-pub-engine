(function () {
  const form = document.getElementById("input-form");
  const outputs = {
    comic: document.getElementById("comic-output"),
    note: document.getElementById("note-output"),
    xPost: document.getElementById("x-output"),
    kindle: document.getElementById("kindle-output"),
  };

  const exampleData = {
    theme: "段取り確認とAI活用",
    incident: "朝礼後、作業の順番解釈が班ごとにずれて手戻りが出た。",
    learning: "着手前に1分だけでも手順を言語化するとズレが減る。",
    characters: "照屋親方、コパイロット、若手職人",
    tone: "少し真面目",
  };

  function getInputFromForm() {
    const data = new FormData(form);
    return {
      theme: data.get("theme"),
      incident: data.get("incident"),
      learning: data.get("learning"),
      characters: data.get("characters"),
      tone: data.get("tone"),
    };
  }

  function setFormValues(values) {
    Object.keys(values).forEach(function (key) {
      const element = form.elements.namedItem(key);
      if (element) {
        element.value = values[key];
      }
    });
  }

  function renderOutputs(result) {
    outputs.comic.textContent = result.comic;
    outputs.note.textContent = result.note;
    outputs.xPost.textContent = result.xPost;
  }

  function renderKindlePreview(input) {
    if (!outputs.kindle || !window.AIBusouKindleEngine) {
      return;
    }
    outputs.kindle.textContent = window.AIBusouKindleEngine.buildKindleSectionPreview(input);
  }

  function clearOutputs() {
    const placeholder = "ここに生成結果が表示されます。";
    outputs.comic.textContent = placeholder;
    outputs.note.textContent = placeholder;
    outputs.xPost.textContent = placeholder;
    if (outputs.kindle) {
      outputs.kindle.textContent = placeholder;
    }
  }

  function copyTextById(targetId) {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    const text = target.textContent || "";
    if (!text.trim()) {
      return;
    }
    navigator.clipboard.writeText(text).catch(function () {
      window.alert("コピーに失敗しました。");
    });
  }

  document.getElementById("generate-btn").addEventListener("click", function () {
    const input = getInputFromForm();
    const result = window.AIBusouEngine.buildAllOutputs(input);
    renderOutputs(result);
    renderKindlePreview(input);
  });

  document.getElementById("example-btn").addEventListener("click", function () {
    setFormValues(exampleData);
  });

  document.getElementById("reset-btn").addEventListener("click", function () {
    form.reset();
    clearOutputs();
  });

  document.querySelectorAll(".copy-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const targetId = button.getAttribute("data-copy-target");
      copyTextById(targetId);
    });
  });

  clearOutputs();
})();
