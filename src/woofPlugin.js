import { Plugin, PluginKey } from "prosemirror-state";

export const woofPluginKey = new PluginKey("woof");

export function woofPlugin() {
  return new Plugin({
    key: woofPluginKey,
    appendTransaction: (transactions, oldState, newState) => {
      const woofs = [];

      newState.doc.descendants((node, pos) => {
        if (node.isText) {
          const index = node.textContent.indexOf("woof");
          if (index !== -1) {
            woofs.push([pos + index, pos + index + "woof".length]);
          }
        }
      });

      if (woofs.length) {
        return woofs.reduce((tr, [from, to]) => {
          return tr.replaceWith(from, to, newState.schema.text("bark"));
        }, newState.tr);
      }
    },
  });
}
