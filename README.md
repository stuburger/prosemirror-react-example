# prosemirror-react-example

Prosemirror is not the kind of framework you pick up an learn in a day. While learning Prosemirror you will invariably end up having many tabs open and bouncing between browser and IDE while trying to grok the many different concepts and build the necessary mental models to become productive.

## Where to start

The Prosemirror [library guide](https://prosemirror.net/docs/guide/) is the obvious first place to go to start learning Prosemirror. I suggest reading through it at least once, before going through this readme. I also suggest you bookmark the library guide as you will likely find yourself coming back to it again and again like I did (and still do). I found my understanding grow in very tiny increments but after a while it will all start coming together.

Another resource that is invaluable is the (prosemirror forums)[https://discuss.prosemirror.net]. Even reading them in no particular order can be useful too. Many of the threads act as windows into learning journeys of other developers. I would click into a thread that looked interesting, read it, try to understand as much as possible and then move onto another. Often the questions are as helpful as their answers. Furthermore, there are some extremely useful discussions in the forums started by the author of Prosemirror that help contextualize the Prosemirror concepts that (in my opinion) the rest of the documentation takes for granted. For example, I had an aha moment when I realized that Plugin state and how it is updated works very similar to redux reducers. Later on I found [this thread](https://discuss.prosemirror.net/t/discussion-the-limits-of-actions-and-reducers/551) which really helped round out my understanding of Prosemirror architecture and how redux and Prosemirror are built on similar concepts.

I hope this repo can serve as an additional learning resource to supplement existing docs. This readme assumes you've read the library guide at least once.

Mostly this is aimed at newcomers to Prosemirror - to help you pick up Prosemirror concepts by framing them in terms more familiar to you - especially if you already know React.

## Why React?

If you are first and foremost a React developer, and you are familiar with React concepts like [unidirectional data flow ](https://reactjs.org/docs/thinking-in-react.html) or you are aquatinted with libraries like Redux and React's `useReducer` hook then you already have some of the high level conceptual foundations to start understanding data flow in Prosemirror. Framing these concepts from a React perspective may also help you more quickly build the mental models required to make you productive with Prosemirror. Understanding data flow in Prosemirror is a big part of the battle won and if we can get it out of the way first then you can move onto more interesting (and challenging) topics like creating the Transactions that enable editing a Prosemirror document.

### Prosemirror state

First step to understanding state is to forget about all the other prosemirror modules for a second. We can even forget about the view component for a moment. We don't need an EditorView instance to understand the Prosemirror state is updated.

A state update demonstrated in 2 lines:

```js
// we have our state
let state = EditorState.create(...)

// we update our state
let transaction = state.tr.insertText(...)
state = state.apply(transaction)
```

### What is the `tr`?

You might have read that `state.tr` creates a Transaction. This is because that is literally what it is doing - it is defined as a getter on the EditorState instance and looks like this:

```js
class EditorState {
  ...
  get tr() { return new Transaction(this) }
}

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
  .insertText(...)
  .setSelection(...)
  .setMeta(...)

state = state.apply(transaction)
```

## Integrating with React component state

After seeing how Prosemirror state is updated in isolation it might be clearer to see how we could integrate Prosemirror into React!

```js
function Editor() {
  const [editorState, setEditorState] = useState(() => EditorState.create(...))

  function addMeow() {
    const tr = editorState.tr.insertText('meow')
    setEditorState(editorState.apply(tr))
  }

  return (
    <>
      <span>I you just say meow? {editorState.doc.textContent.includes('meow') ? 'Yes' : 'No'}</span>
      <button onClick={addMeow}>Say Meow!</button>
    </>
  )
}
```

Seeing how Prosemirror state can be integrated into our React application is not only helpful to understand for the sake of the integration, but also for the sake of illustrating how to actually update Prosemirror state. But at this point we we wouldn't be able to see any text content. Thats because we don't have an EditorView yet.

### Adding an EditorView

### Other React integrations

It may be worth digging into the code for libraries like [Tiptap](https://tiptap.dev/) and [Remirror](https://remirror.io/). These are not necessarily the easiest code bases to to pick apart.

## Resources

- https://discuss.prosemirror.net/t/discussion-the-limits-of-actions-and-reducers/551
