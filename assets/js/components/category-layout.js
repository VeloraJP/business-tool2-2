import { element, link } from "./dom.js";
import { ROUTES } from "../config/routes.js";

export function renderCategoryLayout(definition, children = []) {
  return element("div", { className: "view category-view", attributes: { "data-category-id": definition.id } }, [
    element("div", { className: "view-heading category-heading" }, [
      element("div", {}, [
        element("p", { className: "eyebrow", text: "選んだテーマ" }),
        element("h1", { text: definition.title }),
        element("p", { text: definition.description })
      ]),
      element("div", { className: "category-heading__links" }, [
        link("知りたいこと一覧へ", ROUTES.HOME),
        link("会社データ", ROUTES.COMPANY, "text-link text-link--quiet")
      ])
    ]),
    ...children
  ]);
}
