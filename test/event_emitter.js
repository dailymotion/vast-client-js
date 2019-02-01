import { EventEmitter } from '../src/util/event_emitter';

describe('EventEmitter', function() {
  beforeEach(function() {
    this.emitter = new EventEmitter();
  });

  describe('when a listener is added', function() {
    beforeEach(function() {
      this.handler = () => {};

      this.emitter.on('test-event', this.handler);
    });

    it('adds the given handler to the handlers list', function() {
      const handlerObj = this.emitter.handlers[0];

      handlerObj.event.should.eql('test-event');
      handlerObj.handler.should.eql(this.handler);
    });
  });
});
