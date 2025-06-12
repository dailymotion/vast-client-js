export class EventEmitter {
    _handlers: any[];
    /**
     * Adds the event name and handler function to the end of the handlers array.
     * No checks are made to see if the handler has already been added.
     * Multiple calls passing the same combination of event name and handler will result in the handler being added,
     * and called, multiple times.
     * @param {String} event
     * @param {Function} handler
     * @returns {EventEmitter}
     */
    on(event: string, handler: Function): EventEmitter;
    /**
     * Adds a one-time handler function for the named event.
     * The next time event is triggered, this handler is removed and then invoked.
     * @param {String} event
     * @param {Function} handler
     * @returns {EventEmitter}
     */
    once(event: string, handler: Function): EventEmitter;
    /**
     * Removes all instances for the specified handler from the handler array for the named event.
     * @param {String} event
     * @param {Function} handler
     * @returns {EventEmitter}
     */
    off(event: string, handler: Function): EventEmitter;
    /**
     * Synchronously calls each of the handlers registered for the named event,
     * in the order they were registered, passing the supplied arguments to each.
     * @param {String} event
     * @param  {...any} args list of arguments that will be used by the event handler
     * @returns {Boolean} true if the event had handlers, false otherwise.
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * Removes all listeners, or those of the specified named event.
     * @param {String} event
     * @returns {EventEmitter}
     */
    removeAllListeners(event: string): EventEmitter;
    /**
     * Returns the number of listeners listening to the named event.
     * @param {String} event
     * @returns {Number}
     */
    listenerCount(event: string): number;
    /**
     * Returns a copy of the array of listeners for the named event including those created by .once().
     * @param {String} event
     * @returns {Function[]}
     */
    listeners(event: string): Function[];
    /**
     * Returns an array listing the events for which the emitter has registered handlers.
     * @returns {String[]}
     */
    eventNames(): string[];
}
//# sourceMappingURL=event_emitter.d.ts.map