import { button, element } from "./dom.js";

export function showRecalculationConfirmation() {
  return new Promise((resolve) => {
    const dialog = element("dialog", { className: "confirm-dialog" });
    const close = (decision) => {
      dialog.close();
      dialog.remove();
      resolve(decision);
    };
    dialog.append(element("div", { className: "confirm-dialog__body" }, [
      element("h2", { text: "手入力した値の扱い" }),
      element("p", { text: "元のデータが変更されました。手入力した値を維持するか、自動計算に戻すかを選んでください。" }),
      element("div", { className: "button-row" }, [
        button("手入力した値を維持", () => close("KEEP_MANUAL"), "button button--secondary"),
        button("自動計算に戻す", () => close("RETURN_AUTO"), "button")
      ])
    ]));
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close("KEEP_MANUAL"); });
    document.body.append(dialog);
    dialog.showModal();
  });
}
