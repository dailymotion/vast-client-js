import { Timing } from '../../src/util/timing.js';

let timing;
let perfMock = {
  value: 1,
  reset() {
    this.value = 1;
  }
};

beforeAll(() => {
  spyOn(performance, 'now').and.callFake(() => {
    return perfMock.value++;
  });
});

describe('Timing', () => {
  describe('constructor', () => {
    beforeAll(() => {
      timing = new Timing();
    });

    test('should set startTime to 0', () => {
      expect(timing.startTime).toBe(0);
    });

    test('should set endTime to 0', () => {
      expect(timing.endTime).toBe(0);
    });

    test('should set the intervals to empty', () => {
      expect(timing.intervals).toEqual([]);
    });

    test('should set isRunning to false', () => {
      expect(timing.isRunning).toBe(false);
    });
  });

  describe('start', () => {
    beforeAll(() => {
      timing = new Timing();
      timing.start();
    });

    afterAll(() => {
      perfMock.reset();
    });

    test('should set the start time to the current time', () => {
      expect(timing.startTime).toBe(1);
    });

    test('should set isRunning to true', () => {
      expect(timing.isRunning).toBe(true);
    });

    test('a consecutive start should override start time', () => {
      timing.start();

      expect(timing.startTime).toBe(2);
    });
  });

  describe('stop', () => {
    beforeAll(() => {
      timing = new Timing();
    });

    afterAll(() => {
      perfMock.reset();
    });

    test('should not do anything if timer is not running', () => {
      timing.stop();

      expect(timing.endTime).toBe(0);
      expect(timing.isRunning).toBe(false);
    });

    describe('if the timer is running', () => {
      beforeAll(() => {
        timing.isRunning = true;
        timing.stop();
      });

      test('should set the end time to the current time', () => {
        expect(timing.endTime).toBe(1);
      });

      test('should set isRunning to false', () => {
        expect(timing.isRunning).toBe(false);
      });
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      timing = new Timing();
    });

    test('should always try to stop the timer', () => {
      const stopTimerSpy = jest.spyOn(timing, 'stop');

      timing.interval();

      expect(stopTimerSpy).toHaveBeenCalled();
    });

    test('if stop was successful should push the interval to the intervals array', () => {
      timing.startTime = 0;
      timing.isRunning = true;

      timing.interval();

      const lastInterval = timing.intervals.pop();

      expect(lastInterval).toBe(1);
    });

    test('if stop was unseccessful should not push anything to the intervals array', () => {
      timing.stop = () => false;

      timing.interval();

      expect(timing.intervals).toEqual([]);
    });
  });

  describe('lastInterval', () => {
    beforeAll(() => {
      timing = new Timing();
      timing.startTime = 1;
      timing.endTime = 6;
      perfMock.value = 3;
    });

    test('if timer is running should return the real time value of the interval', () => {
      timing.isRunning = true;

      expect(timing.lastInterval).toBe(2);
    });

    test('if timer is not running should return the last stored interval', () => {
      timing.isRunning = false;

      expect(timing.lastInterval).toBe(5);
    });
  });

  describe('average interval', () => {
    test('should return the average of the stored intervals', () => {
      timing = new Timing();
      timing.intervals = [2, 4, 8, 4.5, 5.7];

      expect(timing.avgInterval()).toBe(4.84);
    });
  });

  describe('clearIntervals', () => {
    test('should reset the intervals array to an empty one', () => {
      timing = new Timing();
      timing.intervals = [1, 2, 3];

      timing.clearIntervals();

      expect(timing.intervals).toEqual([]);
    });
  });

  describe('reset', () => {
    beforeAll(() => {
      timing = new Timing();
      timing.startTime = 12;
      timing.endTime = 10;
      timing.intervals = [1, 2, 3];
      timing.isRunning = true;

      timing.reset();
    });

    test('should set startTime to 0', () => {
      expect(timing.startTime).toBe(0);
    });

    test('should set endTime to 0', () => {
      expect(timing.endTime).toBe(0);
    });

    test('should set the intervals to empty', () => {
      expect(timing.intervals).toEqual([]);
    });

    test('should set isRunning to false', () => {
      expect(timing.isRunning).toBe(false);
    });
  });
});
