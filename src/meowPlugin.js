import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import eq from "lodash.isequal";

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
      init: () => ({ decos: DecorationSet.empty, ranges: [] }),
      apply: (tr) => {
        const ranges = [];

        tr.doc.forEach((node, pos) => {
          if (node.attrs.highlight) {
            ranges.push([pos, pos + node.nodeSize]);
          }
        });

        return {
          ranges,
          decos: DecorationSet.create(tr.doc, ranges.map(createProblemDeco)),
        };
      },
    },
    appendTransaction: (transactions, oldState, newState) => {
      const paras = [];

      newState.doc.forEach((node, pos) => {
        paras.push({ pos, node });
      });

      return paras.reduce((tr, { pos, node }) => {
        const highlight = node.textContent.includes("meow");
        return tr.setNodeMarkup(pos, undefined, { highlight });
      }, newState.tr);
    },
  });
}
