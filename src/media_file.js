export class MediaFile {
    constructor() {
        this.id = null;
        this.fileURL = null;
        this.deliveryType = "progressive";
        this.mimeType = null;
        this.codec = null;
        this.bitrate = 0;
        this.minBitrate = 0;
        this.maxBitrate = 0;
        this.width = 0;
        this.height = 0;
        this.apiFramework = null;
        this.scalable = null;
        this.maintainAspectRatio = null;
    }
}
