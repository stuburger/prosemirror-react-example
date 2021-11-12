import React from "react";
import { Schema } from "prosemirror-model";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";

import "./styles.css";

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

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.$container = React.createRef();

    this.state = {
      editorState: EditorState.create({
        schema,
        plugins: [...exampleSetup({ schema }), meowPlugin()],
      }),
    };
  }

  componentDidMount() {
    const { editorState } = this.state;
    this.view = new EditorView(this.$container.current, {
      state: editorState,
      dispatchTransaction: (tr) => this.apply(tr),
      handleClick: (node, pos) => console.log("view clicked", { node, pos }),
    });
  }

  componentDidUpdate(pp, ps) {
    const { editorState } = this.state;

    if (ps.editorState !== editorState) {
      this.view.updateState(editorState);
    }
  }

  componentWillUnmount() {
    this.view.destroy();
  }

  apply = (tr) => {
    const { editorState } = this.state;
    this.setState({ editorState: editorState.apply(tr) });
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
