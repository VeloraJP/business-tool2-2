import { renderCompanyFieldView } from "./field-view.js";
export const renderManagementView = (model, actions) => renderCompanyFieldView(model, actions, { title: "経営情報入力", collection: "managementInfo", description: "従業員数や営業日数など、現在値を入力します。" });
