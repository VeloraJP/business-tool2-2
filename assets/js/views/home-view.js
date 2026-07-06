import { element, link } from "../components/dom.js";
import { CATEGORIES } from "../config/categories.js";
import { ROUTES } from "../config/routes.js";
import { renderCategoryIcon } from "../components/category-icon.js";

export function renderHomeView() {
  return element("div", { className: "view view--home" }, [
    element("section", { className: "home-intro", attributes: { "aria-labelledby": "home-title" } }, [
      element("p", { className: "eyebrow", text: "経営の気になることから始める" }),
      element("h1", { text: "何を知りたいですか？", attributes: { id: "home-title" } }),
      element("p", { text: "テーマを選ぶと、必要な情報だけご案内します。会社データは後から入力できます。" })
    ]),
    element("section", { className: "category-index", attributes: { "aria-labelledby": "category-index-title" } }, [
      element("div", { className: "section-heading" }, [
        element("h2", { text: "知りたいことを選ぶ", attributes: { id: "category-index-title" } }),
        element("p", { text: "各テーマでは、まず概算を試す方法と、会社データを使って詳しく確認する方法を選べます。" })
      ]),
      element("div", { className: "category-card-grid" }, CATEGORIES.map((category, index) =>
        element("a", { className: "category-card", attributes: { href: category.hash } }, [
          element("span", { className: "category-card__visual", attributes: { "aria-hidden": "true" } }, [
            renderCategoryIcon(category.id),
            element("span", { className: "category-card__number", text: String(index + 1).padStart(2, "0") })
          ]),
          element("span", { className: "category-card__content" }, [
            element("strong", { text: category.title }),
            element("small", { text: category.description })
          ]),
          element("span", { className: "category-card__arrow", text: "→", attributes: { "aria-hidden": "true" } })
        ])
      ))
    ]),
    element("aside", { className: "company-entry", attributes: { "aria-labelledby": "company-entry-title" } }, [
      element("div", {}, [
        element("p", { className: "eyebrow", text: "繰り返し入力を減らす" }),
        element("h2", { text: "会社データ", attributes: { id: "company-entry-title" } }),
        element("p", { text: "財務情報や事業の前提を保存すると、詳しい分析で再利用できます。データはこの端末内だけに保存されます。" })
      ]),
      link("会社データを確認する", ROUTES.COMPANY, "button button--secondary")
    ])
  ]);
}
