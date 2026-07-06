export function element(tagName, { className, text, attributes = {} } = {}, children = []) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== null && value !== undefined) node.setAttribute(name, String(value));
  }
  for (const child of children) if (child) node.append(child);
  return node;
}

export function button(text, onClick, className = "button") {
  const node = element("button", { className, text, attributes: { type: "button" } });
  node.addEventListener("click", onClick);
  return node;
}

export function link(text, hash, className = "text-link") {
  return element("a", { className, text, attributes: { href: hash } });
}
