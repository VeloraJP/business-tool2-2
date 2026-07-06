import { renderCompanyFieldView } from "./field-view.js";
export const renderBsView = (model, actions) => renderCompanyFieldView(model, actions, { title: "資産・負債情報の入力", collection: "bs", description: "資産・負債・純資産など、現在の財務状態を入力します。金額の不一致がある場合は確認メッセージを表示します。" });
