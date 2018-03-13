const ParserUtils = require('./parser_utils.js');
const { VASTCreativeLinear } = require('../creative.js');
const VASTIcon = require('../icon.js');
const VASTMediaFile = require('../mediafile.js');

class CreativeLinearParser {
    constructor() {
        this.utils = new ParserUtils();
    }

    parse(creativeElement, creativeAttributes) {
        let offset;
        const creative = new VASTCreativeLinear(creativeAttributes);

        creative.duration = this.utils.parseDuration(this.utils.parseNodeText(this.utils.childByName(creativeElement, "Duration")));
        const skipOffset = creativeElement.getAttribute("skipoffset");

        if ((skipOffset == null)) { creative.skipDelay = null;
        } else if ((skipOffset.charAt(skipOffset.length - 1) === "%") &&  (creative.duration !== -1)) {
            const percent = parseInt(skipOffset, 10);
            creative.skipDelay = creative.duration * (percent / 100);
        } else {
            creative.skipDelay = this.utils.parseDuration(skipOffset);
        }

        const videoClicksElement = this.utils.childByName(creativeElement, "VideoClicks");
        if (videoClicksElement != null) {
            creative.videoClickThroughURLTemplate = this.utils.parseNodeText(this.utils.childByName(videoClicksElement, "ClickThrough"));
            for (let clickTrackingElement of this.utils.childrenByName(videoClicksElement, "ClickTracking")) {
                creative.videoClickTrackingURLTemplates.push(this.utils.parseNodeText(clickTrackingElement));
            }
            for (let customClickElement of this.utils.childrenByName(videoClicksElement, "CustomClick")) {
                creative.videoCustomClickURLTemplates.push(this.utils.parseNodeText(customClickElement));
            }
        }

        const adParamsElement = this.utils.childByName(creativeElement, "AdParameters");
        if (adParamsElement != null) {
            creative.adParameters = this.utils.parseNodeText(adParamsElement);
        }

        for (let trackingEventsElement of this.utils.childrenByName(creativeElement, "TrackingEvents")) {
            for (let trackingElement of this.utils.childrenByName(trackingEventsElement, "Tracking")) {
                let eventName = trackingElement.getAttribute("event");
                const trackingURLTemplate = this.utils.parseNodeText(trackingElement);
                if ((eventName != null) && (trackingURLTemplate != null)) {
                    if (eventName === "progress") {
                        offset = trackingElement.getAttribute("offset");
                        if (!offset) {
                            continue;
                        }
                        if (offset.charAt(offset.length - 1) === '%') {
                            eventName = `progress-${offset}`;
                        } else {
                            eventName = `progress-${Math.round(this.utils.parseDuration(offset))}`;
                        }
                    }

                    if (creative.trackingEvents[eventName] == null) { creative.trackingEvents[eventName] = []; }
                    creative.trackingEvents[eventName].push(trackingURLTemplate);
                }
            }
        }

        for (let mediaFilesElement of this.utils.childrenByName(creativeElement, "MediaFiles")) {
            for (let mediaFileElement of this.utils.childrenByName(mediaFilesElement, "MediaFile")) {
                const mediaFile = new VASTMediaFile();
                mediaFile.id = mediaFileElement.getAttribute("id");
                mediaFile.fileURL = this.utils.parseNodeText(mediaFileElement);
                mediaFile.deliveryType = mediaFileElement.getAttribute("delivery");
                mediaFile.codec = mediaFileElement.getAttribute("codec");
                mediaFile.mimeType = mediaFileElement.getAttribute("type");
                mediaFile.apiFramework = mediaFileElement.getAttribute("apiFramework");
                mediaFile.bitrate = parseInt(mediaFileElement.getAttribute("bitrate") || 0);
                mediaFile.minBitrate = parseInt(mediaFileElement.getAttribute("minBitrate") || 0);
                mediaFile.maxBitrate = parseInt(mediaFileElement.getAttribute("maxBitrate") || 0);
                mediaFile.width = parseInt(mediaFileElement.getAttribute("width") || 0);
                mediaFile.height = parseInt(mediaFileElement.getAttribute("height") || 0);

                let scalable = mediaFileElement.getAttribute("scalable");
                if (scalable && (typeof scalable === "string")) {
                  scalable = scalable.toLowerCase();
                  if (scalable === "true") { mediaFile.scalable = true;
                  } else if (scalable === "false") { mediaFile.scalable = false; }
              }

                let maintainAspectRatio = mediaFileElement.getAttribute("maintainAspectRatio");
                if (maintainAspectRatio && (typeof maintainAspectRatio === "string")) {
                  maintainAspectRatio = maintainAspectRatio.toLowerCase();
                  if (maintainAspectRatio === "true") { mediaFile.maintainAspectRatio = true;
                  } else if (maintainAspectRatio === "false") { mediaFile.maintainAspectRatio = false; }
              }

                creative.mediaFiles.push(mediaFile);
            }
        }

        const iconsElement = this.utils.childByName(creativeElement, "Icons");
        if (iconsElement != null) {
            for (let iconElement of this.utils.childrenByName(iconsElement, "Icon")) {
                const icon = new VASTIcon();
                icon.program = iconElement.getAttribute("program");
                icon.height = parseInt(iconElement.getAttribute("height") || 0);
                icon.width = parseInt(iconElement.getAttribute("width") || 0);
                icon.xPosition = this.parseXPosition(iconElement.getAttribute("xPosition"));
                icon.yPosition = this.parseYPosition(iconElement.getAttribute("yPosition"));
                icon.apiFramework = iconElement.getAttribute("apiFramework");
                icon.offset = this.utils.parseDuration(iconElement.getAttribute("offset"));
                icon.duration = this.utils.parseDuration(iconElement.getAttribute("duration"));

                for (let htmlElement of this.utils.childrenByName(iconElement, "HTMLResource")) {
                    icon.type = htmlElement.getAttribute("creativeType") || 'text/html';
                    icon.htmlResource = this.utils.parseNodeText(htmlElement);
                }

                for (let iframeElement of this.utils.childrenByName(iconElement, "IFrameResource")) {
                    icon.type = iframeElement.getAttribute("creativeType") || 0;
                    icon.iframeResource = this.utils.parseNodeText(iframeElement);
                }

                for (let staticElement of this.utils.childrenByName(iconElement, "StaticResource")) {
                    icon.type = staticElement.getAttribute("creativeType") || 0;
                    icon.staticResource = this.utils.parseNodeText(staticElement);
                }

                const iconClicksElement = this.utils.childByName(iconElement, "IconClicks");
                if (iconClicksElement != null) {
                    icon.iconClickThroughURLTemplate = this.utils.parseNodeText(this.utils.childByName(iconClicksElement, "IconClickThrough"));
                    for (let iconClickTrackingElement of this.utils.childrenByName(iconClicksElement, "IconClickTracking")) {
                        icon.iconClickTrackingURLTemplates.push(this.utils.parseNodeText(iconClickTrackingElement));
                    }
                }

                icon.iconViewTrackingURLTemplate = this.utils.parseNodeText(this.utils.childByName(iconElement, "IconViewTracking"));

                creative.icons.push(icon);
            }
        }

        return creative;
    }

    parseXPosition(xPosition) {
        if (["left", "right"].includes(xPosition)) {
            return xPosition;
        }

        return parseInt(xPosition || 0);
    }

    parseYPosition(yPosition) {
        if (["top", "bottom"].includes(yPosition)) {
            return yPosition;
        }

        return parseInt(yPosition || 0);
    }
}

module.exports = CreativeLinearParser;
