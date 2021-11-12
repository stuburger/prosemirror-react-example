import { Schema } from "prosemirror-model";
import { EditorState, Plugin } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, createParagraphNear } from "prosemirror-commands";

import React from "react";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import "./styles.css";
// import { buildKeymap } from 'prosemirror-example-setup/keymap';

const schema = new Schema({
  nodes: {
    doc: {
      content: `paragraph*`
    },
    paragraph: {
      attrs: {
        highlight: { default: false }
      },
      content: "text*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", { class: "paragraph" }, 0];
      }
    },
    text: {
      toDOM: () => ["span", 0]
    }
  }
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.$container = React.createRef();

    this.state = {
      editorState: EditorState.create({
        schema,
        plugins: [
          ...exampleSetup({ schema }),
          new Plugin({
            appendTransaction: (transactions, oldState, newState) => {
              if (newState.doc.textContent.includes("meow")) {
                console.log("meow!");
                return newState.tr.deleteRange(
                  newState.selection.$from.pos - 4,
                  newState.selection.$from.pos
                );
              }
            }
          })
        ]
      })
    };
  }

  componentDidMount() {
    const { editorState } = this.state;
    this.view = new EditorView(this.$container.current, {
      state: editorState,
      dispatchTransaction: (tr) => this.apply(tr),
      handleClick: (node, pos) => console.log("view clicked", { node, pos })
    });
  }

  componentDidUpdate(pp, ps) {
    const { editorState } = this.state;

    // console.log("componentDidUpdate");
    if (ps.editorState !== editorState) {
      // console.log("state updated, rerendering view...");
      this.view.updateState(editorState);
    }
  }

  componentWillUnmount() {
    this.view.destroy();
  }

  apply = (tr) => {
    const { editorState } = this.state;
    // console.log("hi there! apply()");
    this.setState({
      editorState: editorState.apply(tr)
    });
  };

  render() {
    return (
      <div className="App">
        <h1>Hello Prosemirror</h1>
        <div
          ref={this.$container}
          style={{ backgroundColor: "aliceblue", width: "100%" }}
        />
      </div>
    );
  }
}
