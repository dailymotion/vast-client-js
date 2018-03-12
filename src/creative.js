/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class VASTCreative {
    constructor(creativeAttributes) {
        if (creativeAttributes == null) { creativeAttributes = {}; }
        this.id = creativeAttributes.id || null;
        this.adId = creativeAttributes.adId || null;
        this.sequence = creativeAttributes.sequence || null;
        this.apiFramework = creativeAttributes.apiFramework || null;
        this.trackingEvents = {};
    }
}

class VASTCreativeLinear extends VASTCreative {
    constructor(creativeAttributes) {
        if (creativeAttributes == null) { creativeAttributes = {}; }
        super(creativeAttributes);
        this.type = "linear";
        this.duration = 0;
        this.skipDelay = null;
        this.mediaFiles = [];
        this.videoClickThroughURLTemplate = null;
        this.videoClickTrackingURLTemplates = [];
        this.videoCustomClickURLTemplates = [];
        this.adParameters = null;
        this.icons = [];
    }
}

class VASTCreativeNonLinear extends VASTCreative {
    constructor(creativeAttributes) {
        if (creativeAttributes == null) { creativeAttributes = {}; }
        super(creativeAttributes);
        this.type = "nonlinear";
        this.variations = [];
    }
}

class VASTCreativeCompanion extends VASTCreative {
    constructor(creativeAttributes) {
        if (creativeAttributes == null) { creativeAttributes = {}; }
        super(creativeAttributes);
        this.type = "companion";
        this.variations = [];
    }
}

module.exports = {
    VASTCreativeLinear,
    VASTCreativeNonLinear,
    VASTCreativeCompanion
};
