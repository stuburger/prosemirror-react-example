import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const meowPluginKey = new PluginKey("meow");

export function meowPlugin() {
  function createProblemDeco([from, to]) {
    return Decoration.node(from, to, { class: "problem" });
  }

  return new Plugin({
    key: meowPluginKey,
    props: {
      decorations(state) {
        return meowPluginKey.getState(state).decos;
      },
    },
    state: {
      init: () => ({ decos: DecorationSet.empty }),
      apply: (tr) => {
        const ranges = [];

        tr.doc.forEach((paragraph, pos) => {
          if (paragraph.textContent.includes("meow")) {
            ranges.push([pos, pos + paragraph.nodeSize]);
          }
        });

        return {
          decos: DecorationSet.create(tr.doc, ranges.map(createProblemDeco)),
        };
      },
    },
  });
}
