export function createMediaFile() {
  return {
    id: null,
    fileURL: null,
    deliveryType: 'progressive',
    mimeType: null,
    codec: null,
    bitrate: 0,
    minBitrate: 0,
    maxBitrate: 0,
    width: 0,
    height: 0,
    apiFramework: null, // @deprecated in VAST 4.1. <InteractiveCreativeFile> should be used instead.
    scalable: null,
    maintainAspectRatio: null
  };
}
