import { EventEmitter } from '../src/util/event_emitter';

describe('EventEmitter', function() {
  beforeEach(function() {
    this.emitter = new EventEmitter();
  });

  describe('function on', function() {
    beforeEach(function() {
      this.handler = () => 1;
      this.handler2 = () => 2;

      this.emitter.on('test-event', this.handler);
      this.emitter.on('test-event', this.handler);
      this.emitter.on('test-event', this.handler2);
    });

    it('adds multiple instances', function() {
      this.emitter._handlers.length.should.eql(3);
    });

    it('adds the given handler to the handlers list', function() {
      const handlerObj = this.emitter._handlers[0];

      handlerObj.event.should.eql('test-event');
      handlerObj.handler.should.eql(this.handler);
    });
  });

  describe('function once', function() {
    beforeEach(function() {
      this.response = [];
      this.handler = (...args) => {
        this.response.push(args);
      };

      this.emitter.once('test-event', this.handler);
      this.emitter.on('*', this.handler);
    });

    it('adds the given handler to the handlers list', function() {
      const handlerObj = this.emitter._handlers[0];

      handlerObj.event.should.eql('test-event');
      handlerObj.handler.should.eql(
        this.emitter._onceWrap('test-event', this.handler)
      );
    });

    describe('after event is emitted', function() {
      beforeEach(function() {
        this.emitter.emit('test-event', 'data');
      });

      it('removes handler from handlers array', function() {
        this.emitter._handlers.length.should.eql(1);
        this.emitter._handlers[0].event.should.eql('*');
      });

      it('calls handler function', function() {
        this.response[0][0].should.eql('data');
        this.response[1][0].should.eql('test-event');
        this.response[1][1].should.eql('data');
      });
    });
  });

  describe('function off', function() {
    beforeEach(function() {
      this.handler = () => 1;
      this.handler2 = () => 2;

      this.emitter.on('test-event', this.handler);
      this.emitter.on('test-event', this.handler);
      this.emitter.on('test-event', this.handler2);
      this.emitter.off('test-event', this.handler);
    });

    it('removes the given handler from the handlers list', function() {
      this.emitter._handlers.length.should.eql(1);
      this.emitter._handlers[0].event.should.eql('test-event');
      this.emitter._handlers[0].handler.should.eql(this.handler2);
    });
  });

  describe('function emit', function() {
    beforeEach(function() {
      this.results = [];
      this.handler = (...args) => {
        this.results.push(...args);
      };

      this.emitter.on('test-event', this.handler);
      this.emitter.on('test-event', this.handler);
      this.emitter.on('foo', this.handler);
    });

    describe('handler is called', function() {
      beforeEach(function() {
        this.emitter.on('*', this.handler);
        this.called = this.emitter.emit('test-event', 'data');
      });

      it('calls correct handlers', function() {
        this.results.should.eql(['data', 'data', 'test-event', 'data']);
        this.called.should.eql(true);
      });
    });

    describe('handler is not called', function() {
      beforeEach(function() {
        this.called = this.emitter.emit('bar', 'data');
      });

      it('calls correct handlers', function() {
        this.results.should.eql([]);
        this.called.should.eql(false);
      });
    });
  });

  describe('function removeAllListeners', function() {
    beforeEach(function() {
      this.handler = () => 1;
      this.handler2 = () => 2;

      this.emitter.on('foo', this.handler);
      this.emitter.on('bar', this.handler);
      this.emitter.on('bar', this.handler2);
    });

    describe('with event arg', function() {
      beforeEach(function() {
        this.emitter.removeAllListeners('bar');
      });

      it('removes all instances of the event in handlers array', function() {
        this.emitter._handlers.length.should.eql(1);
        this.emitter._handlers[0].event.should.eql('foo');
        this.emitter._handlers[0].handler.should.eql(this.handler);
      });
    });

    describe('with no event arg', function() {
      beforeEach(function() {
        this.emitter.removeAllListeners();
      });

      it('removes all instances of the event in handlers array', function() {
        this.emitter._handlers.length.should.eql(0);
      });
    });
  });

  describe('function listenerCount', function() {
    beforeEach(function() {
      this.handler = () => 1;
      this.handler2 = () => 2;

      this.emitter.on('foo', this.handler);
      this.emitter.on('bar', this.handler);
      this.emitter.on('bar', this.handler2);
      this.res = this.emitter.listenerCount('bar');
    });

    it('counts all the listeners', function() {
      this.res.should.eql(2);
    });
  });

  describe('function listeners', function() {
    beforeEach(function() {
      this.handler = () => 1;
      this.handler2 = () => 2;

      this.emitter.on('foo', this.handler);
      this.emitter.on('bar', this.handler);
      this.emitter.on('bar', this.handler2);
      this.res = this.emitter.listeners('bar');
    });

    it('returns all the listeners from the named event', function() {
      this.res.length.should.eql(2);
      this.res[0].should.eql(this.handler);
      this.res[1].should.eql(this.handler2);
    });
  });

  describe('function eventNames', function() {
    beforeEach(function() {
      this.handler = () => 1;
      this.handler2 = () => 2;

      this.emitter.on('foo', this.handler);
      this.emitter.on('bar', this.handler);
      this.emitter.on('bar', this.handler2);
      this.res = this.emitter.eventNames();
    });

    it('returns all event names from registered handlers', function() {
      this.res.length.should.eql(3);
      this.res[0].should.eql('foo');
      this.res[1].should.eql('bar');
      this.res[2].should.eql('bar');
    });
  });
});
