import React from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { schema } from "./schema";
import { woofPlugin } from "./woofPlugin";
import { meowPlugin } from "./meowPlugin";

import "./styles.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.$container = React.createRef();

    this.state = {
      editorState: EditorState.create({
        schema,
        plugins: [...exampleSetup({ schema }), meowPlugin(), woofPlugin()],
      }),
    };
  }

  componentDidMount() {
    const { editorState } = this.state;
    this.view = new EditorView(this.$container.current, {
      state: editorState,
      // dispatchTransaction defaults to simply applying the transaction to the current view state.
      // Instead we want to intercept the transaction here and update our component state.
      // This way we gain access to the editor state inside our react component.
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
