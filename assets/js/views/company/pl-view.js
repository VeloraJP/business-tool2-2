import { renderCompanyFieldView } from "./field-view.js";
export const renderPlView = (model, actions) => renderCompanyFieldView(model, actions, { title: "損益情報の入力", collection: "pl", description: "売上や費用など、1年間の損益情報を入力します。自動計算される項目は通常入力不要です。" });
