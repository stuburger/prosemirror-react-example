import React, { useRef, useReducer, useEffect } from "react";
import { Schema } from "prosemirror-model";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";

import "./styles.css";
import { meowPlugin } from "./meowPlugin";

const schema = new Schema({
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
    text: {
      toDOM: () => ["span", 0],
    },
  },
});

function reducer(state, action) {
  if (action.type === "transaction") {
    return { editorState: state.editorState.apply(action.payload.tr) };
  }

  return state;
}

function init() {
  return {
    editorState: EditorState.create({
      schema,
      plugins: [...exampleSetup({ schema }), meowPlugin()],
    }),
  };
}

export default function AppFn() {
  const $container = useRef();
  const view = useRef();
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const { editorState } = state;

  useEffect(() => {
    view.current = new EditorView($container.current, {
      state: editorState,
      dispatchTransaction: (tr) => {
        dispatch({ type: "transaction", payload: { tr } });
      },
      handleClick: (node, pos) => console.log("view clicked", { node, pos }),
    });

    return () => view.current.destroy();
  }, []);

  useEffect(() => {
    view.current.updateState(editorState);
  }, [editorState]);

  return (
    <div className="App">
      <h1>Hello Prosemirror</h1>
      <div
        ref={$container}
        style={{ backgroundColor: "aliceblue", width: "100%" }}
      />
    </div>
  );
}
