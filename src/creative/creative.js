export class Creative {
    constructor(creativeAttributes = {}) {
        this.id = creativeAttributes.id || null;
        this.adId = creativeAttributes.adId || null;
        this.sequence = creativeAttributes.sequence || null;
        this.apiFramework = creativeAttributes.apiFramework || null;
        this.trackingEvents = {};
    }
}
