import { button, element } from "./dom.js";

export function renderJsonDataControls({ onExport, onImport }) {
  const input = element("input", { className: "visually-hidden", attributes: { type: "file", accept: "application/json,.json", id: "json-import", "aria-label": "バックアップを読み込む" } });
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    await onImport(file);
    input.value = "";
  });
  return element("section", { className: "data-tools", attributes: { "aria-labelledby": "data-tools-title" } }, [
    element("h2", { text: "バックアップデータ", attributes: { id: "data-tools-title" } }),
    element("p", { text: "この端末の会社データをファイルへ保存・復元できます。最大5MBです。" }),
    element("div", { className: "button-row" }, [
      button("バックアップを書き出す", onExport, "button button--secondary"),
      element("label", { className: "button button--secondary", text: "バックアップを読み込む", attributes: { for: "json-import" } }),
      input
    ])
  ]);
}
