import { Schema } from "prosemirror-model";

export const schema = new Schema({
  nodes: {
    doc: {
      content: `paragraph+`,
    },
    paragraph: {
      attrs: {
        highlight: { default: false },
      },
      content: "text*",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", { class: "paragraph" }, 0];
      },
    },
    text: {},
  },
});
