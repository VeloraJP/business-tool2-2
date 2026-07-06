import { element } from "./dom.js";
import { missingBenefit, presentationLabel, sanitizeUserText } from "./presentation-labels.js";

function itemLabel(item) {
  return presentationLabel(item.field ?? item.path ?? item.resultName, "入力内容");
}

const WARNING_ACTIONS = Object.freeze({
  BALANCE_SHEET_MISMATCH: "資産合計と負債・純資産合計を確認してください。",
  SALES_CUSTOMER_DETAIL_MISMATCH: "売上高、客単価、客数を確認してください。",
  SALES_QUANTITY_DETAIL_MISMATCH: "売上高、商品・サービス単価、販売数量を確認してください。",
  LABOR_DETAIL_MISMATCH: "人件費合計と内訳を確認してください。",
  PERIOD_MISMATCH: "比較する対象期間を確認してください。"
});

function actionableMessage(item, kind) {
  const label = itemLabel(item);
  const fallback = kind === "error" ? "入力内容を修正してください。" : "入力内容の組み合わせを確認してください。";
  const message = sanitizeUserText(item.message, fallback);
  if (/(入力|選択|指定|確認|設定|修正)してください。?$/.test(message)) return `${label}：${message}`;
  if (kind === "warning") return `${label}：${message} ${WARNING_ACTIONS[item.code] ?? `${label}に関係する入力値を確認してください。`}`;
  return `${label}：${message} ${label}を確認して入力してください。`;
}

function messageGroup(kind, title, items) {
  if (!items?.length) return null;
  const list = element("ul", { className: "message-list" });
  const visibleItems = items.slice(0, kind === "missing" ? 3 : 5);
  for (const item of visibleItems) {
    list.append(element("li", {
      text: kind === "missing"
        ? missingBenefit(item)
        : actionableMessage(item, kind)
    }));
  }
  return element("section", {
    className: `message-panel message-panel--${kind}`,
    attributes: { "data-message-kind": kind, "aria-label": title }
  }, [element("h2", { text: title }), list]);
}

export function renderResultMessages(messages) {
  const wrapper = element("div", { className: "message-stack", attributes: { "aria-live": "polite" } });
  if (messages.success) {
    const success = String(messages.success)
      .replace(/^会社データを保存しました。?$/, "会社データを保存しました")
      .replaceAll("JSONデータ", "バックアップデータ");
    wrapper.append(element("p", { className: "save-status", text: success }));
  }
  for (const group of [
    messageGroup("error", "入力を修正してください", messages.errors),
    messageGroup("warning", "入力内容をご確認ください", messages.warnings),
    messageGroup("missing", "入力すると確認できること", messages.missingFields)
  ]) {
    if (group) wrapper.append(group);
  }
  return wrapper;
}
