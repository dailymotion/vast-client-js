/*
  We decided to put the estimated bitrate separated from classes to persist it between different instances of vast client/parser
*/

let estimatedBitrateCount = 0;
export let estimatedBitrate = 0;

/**
 * Calculate average estimated bitrate from the previous values and new entries
 * @param {Number} byteLength - The length of the response in bytes.
 * @param {Number} duration - The duration of the request in ms.
 */
export const updateEstimatedBitrate = (byteLength, duration) => {
  if (!byteLength || !duration || byteLength <= 0 || duration <= 0) {
    return;
  }

  // We want the bitrate in bit by seconds, byteLength are in bytes and duration in ms, we need to convert them
  const bitrate = (byteLength * 8) / duration * 1000;
  estimatedBitrate = (estimatedBitrate * estimatedBitrateCount + bitrate) / ++estimatedBitrateCount
}
