import * as Bitrate from '../src/parser/bitrate';

describe('updateEstimatedBitrate', () => {
  beforeEach(() => {
    Bitrate.estimatedBitrate = 0;
  });

  it('does not update estimated bitrate if one value is missing', () => {
    Bitrate.updateEstimatedBitrate(1000, null);
    expect(Bitrate.estimatedBitrate).toEqual(0);
    Bitrate.updateEstimatedBitrate(null, 1234);
    expect(Bitrate.estimatedBitrate).toEqual(0);
  });

  it('does not update estimated bitrate if one value is negative', () => {
    Bitrate.updateEstimatedBitrate(1000, -12);
    expect(Bitrate.estimatedBitrate).toEqual(0);
    Bitrate.updateEstimatedBitrate(-243, 1234);
    expect(Bitrate.estimatedBitrate).toEqual(0);
  });

  it('updates estimated bitrate if values are both positive and make the average from cumulated values', () => {
    Bitrate.updateEstimatedBitrate(1000, 200);
    expect(Bitrate.estimatedBitrate).toEqual(40);
    Bitrate.updateEstimatedBitrate(100, 200);
    expect(Bitrate.estimatedBitrate).toEqual(22);
    Bitrate.updateEstimatedBitrate(2050, 200);
    expect(Bitrate.estimatedBitrate).toEqual(42);
  });
});
