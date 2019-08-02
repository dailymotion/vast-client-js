import { Creative } from './creative';

export class CreativeLinear extends Creative {
  constructor(creativeAttributes = {}) {
    super(creativeAttributes);

    this.type = 'linear';
    this.duration = 0;
    this.skipDelay = null;
    this.mediaFiles = [];
    this.mezzanine = null;
    this.videoClickThroughURLTemplate = null;
    this.videoClickTrackingURLTemplates = [];
    this.videoCustomClickURLTemplates = [];
    this.adParameters = null;
    this.icons = [];
    this.trackingEvents = {};
  }
}
