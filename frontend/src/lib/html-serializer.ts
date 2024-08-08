import escapeHtml from "escape-html";
import { Descendant, Text } from "slate";
import { CustomElement, CustomText, MarkType } from "@/lib/custom-editor";
import { jsx } from "slate-hyperscript";

const serialize = (node: Descendant): string => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<em>${string}</em>`;
    }
    if (node.underline) {
      string = `<u>${string}</u>`;
    }
    return string;
  }

  const element = node as CustomElement;
  const children = element.children.map((n) => serialize(n)).join("");

  switch (element.type) {
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading-one":
      return `<h1>${children}</h1>`;
    case "heading-two":
      return `<h2>${children}</h2>`;
    case "heading-three":
      return `<h3>${children}</h3>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "ordered-list":
      return `<ol>${children}</ol>`;
    case "unordered-list":
      return `<ul>${children}</ul>`;
    default:
      return children;
  }
};

const serializeNodes = (nodes: Descendant[]): string => {
  return nodes.map((node) => serialize(node)).join("");
};

const deserialize = (
  el: Node,
  markAttributes: Partial<Record<MarkType, boolean>> = {}
): CustomElement | CustomText | Descendant[] | null => {
  if (el.nodeType === Node.TEXT_NODE) {
    return jsx("text", markAttributes, el.textContent);
  } else if (el.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = el as HTMLElement;
  const nodeAttributes = { ...markAttributes };

  switch (element.nodeName) {
    case "STRONG":
      nodeAttributes.bold = true;
      break;
    case "EM":
      nodeAttributes.italic = true;
      break;
    case "U":
      nodeAttributes.underline = true;
      break;
  }

  const children = Array.from(element.childNodes)
    .map((node) => deserialize(node, nodeAttributes))
    .flat();

  if (children.length === 0) {
    children.push(jsx("text", nodeAttributes, ""));
  }

  switch (element.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);
    case "P":
      return jsx("element", { type: "paragraph" }, children);
    case "H1":
      return jsx("element", { type: "heading-one" }, children);
    case "H2":
      return jsx("element", { type: "heading-two" }, children);
    case "H3":
      return jsx("element", { type: "heading-three" }, children);
    case "LI":
      return jsx("element", { type: "list-item" }, children);
    case "OL":
      return jsx("element", { type: "ordered-list" }, children);
    case "UL":
      return jsx("element", { type: "unordered-list" }, children);
    default:
      return children as Descendant[];
  }
};

export { serializeNodes, deserialize };
