/**
 * Helper class to ease performance monitoring by providing the
 * concept of start, stop and intervals.
 *
 * @class Timing
 */
export class Timing {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.intervals = [];
    this.isRunning = false;
  }

  /**
   * Returns the last interval stored or the real time value of the
   * running one (if any) as a Number
   *
   * @readonly
   */
  get lastInterval() {
    return this.isRunning
      ? performance.now() - this.startTime
      : this.endTime - this.startTime;
  }

  /**
   * Starts the timer. If the timer is already started it overrides the current value.
   *
   * @return {void}
   */
  start() {
    this.startTime = performance.now();
    this.isRunning = true;
  }

  /**
   * Stops the timer if one is running, does nothing otherwise.
   * Returns true if the timer was stopped, false otherwise.
   *
   * @return {Boolean}
   */
  stop() {
    if (!this.isRunning) {
      return false;
    }

    this.endTime = performance.now();
    this.isRunning = false;

    return true;
  }

  /**
   * Tries to stop the timer, if it succeeds it stores the diff between
   * the end and start time in the intervals array.
   *
   * @return {void}
   */
  interval() {
    if (this.stop()) {
      this.intervals.push(this.endTime - this.startTime);
    }
  }

  /**
   * Resets the intervals array to an empty one.
   *
   * @return {void}
   */
  clearIntervals() {
    this.intervals = [];
  }

  /**
   * Returns the average value of the stored intervals.
   *
   * @return {Number}
   */
  avgInterval() {
    const intervalsTotalTime = this.intervals.reduce((previous, interval) => {
      return previous + interval;
    }, 0);

    return intervalsTotalTime / this.intervals.length;
  }

  /**
   * Resets the timer to the inital values.
   *
   * @return {void}
   */
  reset() {
    this.startTime = 0;
    this.endTime = 0;
    this.intervals = [];
    this.isFreezed = false;
    this.isRunning = false;
  }
}
