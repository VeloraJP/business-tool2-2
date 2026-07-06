const SVG_NS = "http://www.w3.org/2000/svg";

const ICON_PARTS = Object.freeze({
  status: [["rect", { x: 5, y: 3, width: 14, height: 18, rx: 2 }], ["path", { d: "M9 7h2M13 7h2M9 11h2M13 11h2M9 15h6M11 21v-3h2v3" }]],
  "operating-profit": [["path", { d: "M4 18 9 12l4 3 7-9" }], ["path", { d: "M15 6h5v5" }]],
  target: [["circle", { cx: 12, cy: 12, r: 8 }], ["circle", { cx: 12, cy: 12, r: 3 }], ["path", { d: "m15 9 5-5M17 4h3v3" }]],
  pricing: [["path", { d: "M4 5v6l8 8 7-7-8-8H5a1 1 0 0 0-1 1Z" }], ["circle", { cx: 8.5, cy: 8.5, r: 1 }]],
  hiring: [["circle", { cx: 9, cy: 8, r: 3 }], ["path", { d: "M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M18 7v6M15 10h6" }]],
  financing: [["rect", { x: 3, y: 6, width: 18, height: 14, rx: 2 }], ["path", { d: "M3 10h18M16 14h3" }], ["path", { d: "M7 6V4h10v2" }]],
  investment: [["path", { d: "M6 8a7 7 0 1 1-1 8" }], ["path", { d: "M6 3v5H1" }], ["path", { d: "M12 8v8M9.5 10.5H14a2 2 0 0 1 0 4H9.5" }]],
  comparison: [["path", { d: "M4 7h14M15 4l3 3-3 3M20 17H6M9 14l-3 3 3 3" }]]
});

export function renderCategoryIcon(categoryId) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "category-card__icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const [tagName, attributes] of ICON_PARTS[categoryId] ?? []) {
    const part = document.createElementNS(SVG_NS, tagName);
    for (const [name, value] of Object.entries(attributes)) part.setAttribute(name, String(value));
    svg.append(part);
  }
  return svg;
}

