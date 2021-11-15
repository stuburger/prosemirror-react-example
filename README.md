# prosemirror-react-example

Prosemirror is not the kind of framework you pick up an learn in a day. While learning Prosemirror you will invariably end up having many tabs open and bouncing between browser and IDE while trying to grok the many different concepts and build the necessary mental models to become productive.

## Where to start

The Prosemirror [library guide](https://prosemirror.net/docs/guide/) is the obvious first place to go to start learning Prosemirror. I suggest reading through it at least once, before going through this readme. I also suggest you bookmark the library guide as you will likely find yourself coming back to it again and again like I did (and still do). I found my understanding grow in very tiny increments but after a while it will all start coming together.

Another resource that is invaluable is the [prosemirror forums](https://discuss.prosemirror.net). I found that reading them - in no particular order - can be extremely beneficial to speed up learning. Many of the threads act as windows into learning journeys of other developers. I would click into a thread that looked interesting, read it, try to understand as much as possible and then move onto another. Often the questions are as helpful as their answers. Furthermore, there are some extremely useful discussions in the forums started by the author of Prosemirror that help contextualize the Prosemirror concepts that (in my opinion) the rest of the documentation takes for granted. For example, I had an aha moment when I realized that Plugin state and how it is updated works very similar to Redux reducers. Later on I found [this thread](https://discuss.prosemirror.net/t/discussion-the-limits-of-actions-and-reducers/551) which really helped round out my understanding of Prosemirror architecture and how Redux and Prosemirror are built on similar concepts - similar, but not the same. That said, to point out caveats, gotchas and differences at this point in your learning journey would only serve to confuse. Those details will come to you as you learn more about Prosemirror.

This readme assumes you've read the library guide at least once. I hope it serves as an additional resource to anyone who stumbles upon it. Finally, this little guide is primarily written for newcomers to Prosemirror and aims to help you pick up Prosemirror concepts by framing them in terms more familiar to you.

## Why React?

If you are first and foremost a React developer, and you are familiar with React concepts like [unidirectional data flow ](https://reactjs.org/docs/thinking-in-react.html) or you are aquatinted with libraries like Redux and React's `useReducer` hook then you already have some of the high level conceptual foundations to start understanding data flow in Prosemirror. Framing these concepts from a React perspective may also help you more quickly build the mental models required to make you productive with Prosemirror. Understanding data flow in Prosemirror is a big part of the battle won and if we can get it out of the way first then you can move onto more interesting (and challenging) topics like creating the Transactions that enable editing a Prosemirror document.

## The many Prosemirror modules

So why cant I just run `npm -i prosemirror` and be done with it? This is what the prosemirror docs have to say:

> The core library is not an easy drop-in component—we are prioritizing modularity and customizability over simplicity, with the hope that, in the future, people will distribute drop-in editors based on ProseMirror. As such, this is more of a Lego set than a Matchbox car.

There are 4 core modules that you should care about when you start to learn Prosemirror. This example repo will cover, at least at the highest of levels, the first 3.

- `prosemirror-state` - Everything to do with state. Also Plugins.
- `prosemirror-model` - Allows us to define schemas that our state must conform to. Also provides building blocks such as Nodes, Marks, Slices and Fragments that make up our document state.
- `prosemirror-view` - Allows us to create EditorView instances that are like the rendering engine of Prosemirror. An EditorView declaratively renders whatever state is supplied to it. It also dispatches events that originate from user actions such as clicks and key presses.
- `prosemirror-transform` - While **not covered** here, this is the module that underpins the functionality that allows us to create [Transactions](https://prosemirror.net/docs/ref/#state.Transaction) that update state in a way that allows changes to be recorded and replayed. There is a lot of fun to be had here, but there is a lot of API to become acquainted with. In a second we'll see how a Transaction is created and used, but we wont go much deeper than that.

## `prosemirror-state`

First step to understanding state is to forget about all the other prosemirror modules for a second. We can even forget about the view component for a moment. We don't need an EditorView instance to understand how Prosemirror state is updated.

A state update demonstrated in 2 lines:

```js
// we have our state
let state = EditorState.create({ schema: /* we'll get to this later */ })

// we update our state
let transaction = state.tr.insertText('meow')
state = state.apply(transaction)
```

### What is `tr`?

You might have read that `state.tr` creates a Transaction. This is because that is literally what it is doing - it is defined as a [getter](https://github.com/ProseMirror/prosemirror-state/blob/61bb964783b20800f6abc18dad855bd3bbf8cdd7/src/state.js#L162) on the EditorState instance and looks like this:

```js
class EditorState {
  ...
  get tr() { return new Transaction(this) }
}
```

A Transaction instance contains methods like [`insertText()`](https://github.com/ProseMirror/prosemirror-state/blob/61bb964783b20800f6abc18dad855bd3bbf8cdd7/src/transaction.js#L24) which all return a reference to the transaction instance itself:

```js
class Transaction {
  ...
  insertText(text, from, to = from) {
    ...
    return this
  }
}
```

This means after we create a transaction we can update it using a fluent api.

```js
let state = EditorState.create(...)

const transaction = state.tr
  .insertText('meow')
  .setSelection(...)
  .setMeta(...)

state = state.apply(transaction)
```

## Integrating with React component state

After seeing how Prosemirror state is updated in isolation it might be clearer to see how we could integrate Prosemirror into React!

```js
function Editor() {
  const [editorState, setEditorState] = useState(() => EditorState.create(...))

  function sayMeow() {
    const tr = editorState.tr.insertText('meow')
    setEditorState(editorState.apply(tr))
  }

  return (
    <>
      <span>I you just say meow? {editorState.doc.textContent.includes('meow') ? 'Yes' : 'No'}</span>
      <button onClick={sayMeow}>Say Meow!</button>
    </>
  )
}
```

Seeing how Prosemirror state can be integrated into our React application is not only helpful to understand for the sake of the integration, but also for the sake of illustrating how to actually update Prosemirror state. But at this point we wouldn't be able to see any text content. Thats because we don't have an EditorView yet. Let's see how we might integrate an EditorView into our React setup.

## Adding an EditorView (`prosemirror-view`)

Prosemirror was created to remain agnostic of frontend framework and you'll find most examples working with vanilla JavaScript. As we're thinking and working in React land, we'll want to do things a implement things a little differently. But first lets see how a view would be updated with no React to work around. We simply need only add to more lines of code to our 2 line state update example:

```js
let state = EditorState.create(...)
// create a view - supplying dom node to append to and initial state
let view = new EditorView(elem, { state })

let transaction = state.tr.insertText('meow')
state = state.apply(transaction)

// pass our newly updated state to our view
view.updateState(state)
```

This example is extremely simplified but we're already starting to see the bigger picture here. Next lets see how this fits into React:

```js
function Editor() {
  const view = useRef()
  const container = useRef()
  const [editorState, setEditorState] = useState(() => EditorState.create(...))

  function apply(tr) {
    setEditorState(editorState.apply(tr))
  }

  useEffect(() => {
    view.current = new EditorView(container.current, {
      state: editorState,
      dispatchTransaction: (tr) => apply(tr),
    });

    return () => view.current.destroy();
  }, []);

  useEffect(() => {
    view.current.updateState(editorState);
  }, [editorState]);

  return <div ref={container} />
}
```

Now we have little more going on, so lets go through it bit by bit.

1. The first thing to notice is that we've created a little helper function, `apply()`, that can be called with a transaction and simply applies that transaction to the current editorState and updates our component's local state with the new editorState that results. Sweet. While this was not necessary for the example, we have just improved readability it'll be more convenient than calling `setEditorState(editorState.apply(tr))` if we want to update editorState in other places.
2. Notice the inclusion of the EditorView that is instantiated inside the first `useEffect` after the initial render and it is bound to the div contained in the `current` property of the `container` ref. When our component unmounts we call `destroy()` on the EditorView instance which removes it from the DOM. But the **really important** line of code to take note of here is the `dispatchTransaction` property supplied to the EditorView. If we had not done this, the default behavior would be for `dispatchTransaction` to simply run `view.updateState(view.state.apply(tr))`. This would cause the view state to be updated, but of course this would entirely bypass our React component state! Instead, we tell Prosemirror to use our version of `dispatchTransaction` which does nothing more than update our component's state.
3. The second `useEffect` contains only one line of code, but its where some important magic happens. As I said in the previous point, our version of `dispatchTransaction` only updates some React state. We know that updating state in React causes a render and the callback in our `useEffect` to be executed (or `componentDidUpdate` in a class component) which finally gives us a place to complete the integration with React and call `updateState()` on the EditorView instance.

So here you can see how we've "plugged" Prosemirror into our component's state lifecycle. Here is an altered version of the data flow diagram from the Prosemirror library guide:

![Data flow](/data-flow-react-pm.jpeg)

## Schemas (`prosemirror-model`)

The schemas that can be defined using the `prosemirror-model` package are fairly straight forward. A schema simply defines what the document structure stored in an the EditorState may look like. A normal rich text editor (think google docs) has a schema that is not very opinionated about what is allowed inside it. But the power of the schema is not that it enables a flexible, unopinionated style of rich text editing. Rather the power any schema provides in general sense and in Prosemirror in particular lies in their ability to **add** constraints. In the case of Prosemirror, the schema constrains the Prosemirror document to a very _specific_ structure. For example, imagine you could enforce a particular style guide for, say, academic writers. Without a schema in place, students would have to follow the conventions put in place by their university or their academic department. The problem with conventions is that they can easily be broken. A schema can be used to make sure a convention is actually adhered to.

### Schema example

Below is a very simple Prosemirror schema. It defines a document structure that may only contain paragraphs and those paragraphs may only contain text. In Prosemirror every schema is required to at least specify a text node.

```js
const schema = new Schema({
  nodes: {
    doc: {
      content: `paragraph+`,
    },
    paragraph: {
      content: "text*",
      toDOM() {
        return ["p", { class: "paragraph" }, 0];
      },
    },
    text: {},
  },
});
```

In our schema above `paragraph+` means that the `doc` node's `content` must consist of one or more paragraphs (`+` means 1 or more, `*` means 0 or more and `?` means 0 or 1). A paragraph's `content` must consist of `text*` i.e it can be empty or it can contain text. The `toDOM()` method on a node returns an array which may look a bit strange at first, but there isn't anything crazy going on here. It just tells Prosemirror that paragraphs are rendered as a `<p>` tags, those `<p>` tags should receive the "paragraph" css class and the 0 represents the opening where paragraph `content` should be rendered i.e where the text should go".

### Revisiting an old friend

Remember when we initialized a new EditorState in the very first example? We did that with one very crucial ingredient missing; a schema. The schema you create is used when you first create an EditorState. This makes sense because it's the EditorState that must conform to the schema, after all. The next code snippet demonstrates the relationship between schema and state.

```js
let schema = new Schema({ nodes: {...}, marks: {...} });
let state = EditorState.create({ schema });
```

## Plugins (part of `prosemirror-state`)

That's right Prosemirror plugins belong to the `prosemirror-state` module. This is because plugins extend the EditorState with new functionality. That sounds very broad, and it is. This makes plugins extremely powerful but perhaps a little confusing at first. Slightly less broadly speaking, plugins can add new functionally to the **view**, change the way **state is applied** or plugins can be used to store and **keep track of their own state**:

- **Add props to the EditorView:** Perhaps the most basic usecase for a plugin is to add behavior to the EditorView by specifying one or more EditorView props. Here is an example straight out of the docs:

```js
new Plugin({
  props: {
    handleKeyDown(view, event) {
      console.log("A key was pressed!");
      return false; // We did not handle this
    },
  },
});
```

- **Add state:** A plugin can define its own state and act as a reducer (think Redux reducers or React's useReducer hook) by intercepting transactions before they are applied to the EditorState and deriving new state from those transactions. A common use case for plugin state is simply to store a set of decorations to applied to the Prosemirror doc. But plugin state can be used to store ANY data you like. Because plugin state observes editor transactions it allows the plugin to update its state and remain in sync with the EditorState. Below is an example of a plugin that simply counts all the transactions that come through it.

```js
new Plugin({
  state: {
    init: () => 0,
    apply: (tr, prevCount) => prevCount + 1,
  },
});
```

> Take a look at the `meowPlugin` in this repo for another simple example of how plugin state can be used for decorations.

- **Filter transactions:** Every plugin can be supplied a [`filterTransaction`](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) prop when it is created. This is any function that you specify that would contain some custom logic to prevent a transaction from being applied to the editor state. For example, say a transaction is dispatched that would add some text that contained profanity. The following plugin would prevent any words in your profanity blacklist from being completed:

```js
new Plugin({
  filterTransaction(tr) {
    for (const badWord in profanityBlacklist) {
      if (tr.doc.textContent.includes(badWord)) return false;
    }
  },
});
```

## Conclusion (and what about `prosemirror-transform`?)

There is a lot more to understand about Prosemirror. This little guide only goes over the basics but covers at a very high level much of what you need to know about 3 of the core components of Prosemirror: `prosemirror-state`, `prosemirror-view` and `prosemirror-model`. The 4th component that we haven't touched on, `prosemirror-transform`, is the module that really what makes text editing possible in Prosemirror. `prosemirror-transform` deserves its own chapter, but goal of this little write up has been to get state management in prosemirror out of the way so you can focus your learning on the parts of prosemirror that are unique to text editing and have fewer parallels to what you might already know (or perhaps to what I already know!)

## Other React integration examples

It may be worth digging into the code for libraries like [Tiptap](https://tiptap.dev/) and [Remirror](https://remirror.io/). These are not necessarily the easiest code bases to to pick apart.
