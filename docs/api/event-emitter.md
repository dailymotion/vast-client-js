# EventEmitter

This is a custom lightweight EventEmitter, based on Nodejs [`EventEmitter`](https://nodejs.org/api/events.html#events_class_eventemitter).

## Public Methods 💚

### on(event, handler)

Adds the event name and handler function to the end of the handlers array. No checks are made to see if the handler has already been added. Multiple calls passing the same combination of event name and handler will result in the handler being added, and called, multiple times.

#### Parameters

- **`event: String`** - The name of the event
- **`handler: Function`** - The callback function

#### Returns

- **`EventEmitter`**

### once(event, handler)

Adds a one-time handler function for the named event. The next time event is triggered, this handler is removed and then invoked.

#### Parameters

- **`event: String`** - The name of the event
- **`handler: Function`** - The callback function

#### Returns

- **`EventEmitter`**

### off(event, handler)

Removes all instances for the specified handler from the handler array for the named event.

#### Parameters

- **`event: String`** - The name of the event
- **`handler: Function`** - The callback function

#### Returns

- **`EventEmitter`**

### emit(event[, ...args])

Synchronously calls each of the handlers registered for the named event, in the order they were registered, passing the supplied arguments to each.

#### Parameters

- **`event: String`** - The name of the event
- **`...args: any[]`** - arguments to pass to the event

#### Returns

- **`Boolean`** - returns true if the event had listeners, false otherwise.

### removeAllListeners(event)

Removes all listeners, or those of the specified named event.

#### Parameters

- **`event: String`** - The name of the event. Optional

#### Returns

- **`EventEmitter`**

### listenerCount(event)

Returns the number of listeners listening to the named event.

#### Parameters

- **`event: String`** - The name of the event

#### Returns

- **`Number`** - number of listeners registered to the named event

### listeners(event)

Returns a copy of the array of listeners for the named event including those created by .once().

#### Parameters

- **`event: String`** - The name of the event

#### Returns

- **`Function[]`** - array of listeners registered to the named event

### eventNames()

Returns an array listing the events for which the emitter has registered handlers.

#### Returns

- **`String[]`** - array of named events that are registered
