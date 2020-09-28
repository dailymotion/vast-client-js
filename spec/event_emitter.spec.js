import { EventEmitter } from '../src/util/event_emitter';

describe('EventEmitter', function() {
  let emitter;
  let response = [];
  const handler = (...args) => {
    response.push(args);
  };
  const handler2 = () => 2;

  beforeEach(function() {
    response = [];
    emitter = new EventEmitter();
  });

  describe('function on', function() {
    beforeEach(function() {
      emitter.on('test-event', handler);
      emitter.on('test-event', handler);
      emitter.on('test-event', handler2);
    });

    it('adds multiple instances', function() {
      expect(emitter._handlers).toHaveLength(3);
    });

    it('adds the given handler to the handlers list', function() {
      const handlerObj = emitter._handlers[0];

      expect(handlerObj.event).toBe('test-event');
      expect(handlerObj.handler).toEqual(handler);
    });
  });

  describe('function once', function() {
    beforeEach(function() {
      emitter.once('test-event', handler);
      emitter.on('*', handler);
    });

    it('adds the given handler to the handlers list', function() {
      expect(emitter._handlers[0].event).toBe('test-event');
      expect(typeof emitter._handlers[0].handler).toBe('function');
    });

    describe('after event is emitted', function() {
      beforeEach(function() {
        emitter.emit('test-event', 'data');
      });

      it('removes handler from handlers array', function() {
        expect(emitter._handlers).toHaveLength(1);
        expect(emitter._handlers[0].event).toBe('*');
      });

      it('calls handler function', function() {
        expect(response[0][0]).toBe('data');
        expect(response[1][0]).toBe('test-event');
        expect(response[1][1]).toBe('data');
      });
    });
  });

  describe('function off', function() {
    beforeEach(function() {
      emitter.on('test-event', handler);
      emitter.on('test-event', handler);
      emitter.on('test-event', handler2);
      emitter.off('test-event', handler);
    });

    it('removes the given handler from the handlers list', function() {
      expect(emitter._handlers).toHaveLength(1);
      expect(emitter._handlers[0].event).toBe('test-event');
      expect(emitter._handlers[0].handler).toEqual(handler2);
    });
  });

  describe('function emit', function() {
    beforeEach(function() {
      emitter.on('test-event', handler);
      emitter.on('test-event', handler);
      emitter.on('foo', handler);
    });

    describe('handler is called', function() {
      it('calls correct handlers', function() {
        emitter.on('*', handler);
        const called = emitter.emit('test-event', 'data');
        expect(response).toEqual([['data'], ['data'], ['test-event', 'data']]);
        expect(called).toBeTruthy();
      });
    });

    describe('handler is not called', function() {
      it('calls correct handlers', function() {
        const called = emitter.emit('bar', 'data');
        expect(response).toEqual([]);
        expect(called).toBeFalsy();
      });
    });
  });

  describe('function removeAllListeners', function() {
    beforeEach(function() {
      emitter.on('foo', handler);
      emitter.on('bar', handler);
      emitter.on('bar', handler2);
    });

    describe('with event arg', function() {
      it('removes all instances of the event in handlers array', function() {
        emitter.removeAllListeners('bar');
        expect(emitter._handlers).toHaveLength(1);
        expect(emitter._handlers[0].event).toBe('foo');
        expect(emitter._handlers[0].handler).toEqual(handler);
      });
    });

    describe('with no event arg', function() {
      it('removes all instances of the event in handlers array', function() {
        emitter.removeAllListeners();
        expect(emitter._handlers).toHaveLength(0);
      });
    });
  });

  describe('function listenerCount', function() {
    beforeEach(function() {
      emitter.on('foo', handler);
      emitter.on('bar', handler);
      emitter.on('bar', handler2);
    });

    it('counts all the listeners', function() {
      expect(emitter.listenerCount('bar')).toBe(2);
    });
  });

  describe('function listeners', function() {
    beforeEach(function() {
      emitter.on('foo', handler);
      emitter.on('bar', handler);
      emitter.on('bar', handler2);
    });

    it('returns all the listeners from the named event', function() {
      const res = emitter.listeners('bar');
      expect(res).toHaveLength(2);
      expect(res[0]).toEqual(handler);
      expect(res[1]).toEqual(handler2);
    });
  });

  describe('function eventNames', function() {
    beforeEach(function() {
      emitter.on('foo', handler);
      emitter.on('bar', handler);
      emitter.on('bar', handler2);
    });

    it('returns all event names from registered handlers', function() {
      const res = emitter.eventNames();
      expect(res).toHaveLength(3);
      expect(res[0]).toBe('foo');
      expect(res[1]).toBe('bar');
      expect(res[2]).toBe('bar');
    });
  });
});
