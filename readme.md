# Thread.js

Simple, disposable threading for the browser.

#### Use cases & features
 - Completely sandboxed threads provide a safe to `eval()` user input.
 - Nonblocking - Run long tasks without jamming up the UI.
 - Bi-directional communication between threads and the main UI.
 - Create single task (disposable) or long-running threads.

#### Methods

 - `Constructor`: `new Thread(threadFunct)` - Create a new thread. It requires a function that will be run on it's own thread.
 - `thread.postmessage([message])` - Send a string, number, array, or object to the currently running thread.
 -  `thread.onmessage([message])` - receive a string, number, array, or object from the currently running thread.
 - `thread.done(doneFunt)` - Do something when the thread has finished execution. If the thread resolved with (a) value(s) it/they will be passed to the `doneFunct`.
 - `thread.catch(errorFunct)` - Catch any errors that were thrown in the thread. The error will be passed to the `errorFunct`.
 - `thread.abort()` - This destroys the thread immediately.
 - `thread.setParams(...params)` - This must be called before the thread is executed. Values passed to this method are initially passed into the thread function as well. The `threadFunct` must have the same number of parameters that are passed into this function.
 - `thread.run()` - Begin execution of the thread. Nothing happens until this is called. 
 
#### threadFunct
 
There are a couple methods available inside the `threadFunct` as well:

 - `this.postmessage(message)` - Sends a message to the main thread, which is handled by `thread.onmessage()`
 - `this.onmessage(message)` - Receives a message from the main thread, when `thread.postmessage()` is called.
 - `this.done(...params)` - Completes the execution of the thread. Optionally sends a value back to the main thread, which the main thread can handle via it's `thread.done()` method. Destroys the thread.


#### Examples

 - [Generate Pi](https://pamblam.github.io/Thread.js/examples)