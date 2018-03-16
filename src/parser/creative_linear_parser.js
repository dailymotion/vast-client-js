import { CreativeLinear } from '../creative/creative_linear';
import { Icon } from '../icon';
import { MediaFile } from '../media_file';
import { ParserUtils } from './parser_utils';

export class CreativeLinearParser {
  constructor() {
    this.parserUtils = new ParserUtils();
  }

  parse(creativeElement, creativeAttributes) {
    let offset;
    const creative = new CreativeLinear(creativeAttributes);

    creative.duration = this.parserUtils.parseDuration(
      this.parserUtils.parseNodeText(
        this.parserUtils.childByName(creativeElement, 'Duration')
      )
    );
    const skipOffset = creativeElement.getAttribute('skipoffset');

    if (skipOffset == null) {
      creative.skipDelay = null;
    } else if (
      skipOffset.charAt(skipOffset.length - 1) === '%' &&
      creative.duration !== -1
    ) {
      const percent = parseInt(skipOffset, 10);
      creative.skipDelay = creative.duration * (percent / 100);
    } else {
      creative.skipDelay = this.parserUtils.parseDuration(skipOffset);
    }

    const videoClicksElement = this.parserUtils.childByName(
      creativeElement,
      'VideoClicks'
    );
    if (videoClicksElement != null) {
      creative.videoClickThroughURLTemplate = this.parserUtils.parseNodeText(
        this.parserUtils.childByName(videoClicksElement, 'ClickThrough')
      );
      for (let clickTrackingElement of this.parserUtils.childrenByName(
        videoClicksElement,
        'ClickTracking'
      )) {
        creative.videoClickTrackingURLTemplates.push(
          this.parserUtils.parseNodeText(clickTrackingElement)
        );
      }
      for (let customClickElement of this.parserUtils.childrenByName(
        videoClicksElement,
        'CustomClick'
      )) {
        creative.videoCustomClickURLTemplates.push(
          this.parserUtils.parseNodeText(customClickElement)
        );
      }
    }

    const adParamsElement = this.parserUtils.childByName(
      creativeElement,
      'AdParameters'
    );
    if (adParamsElement != null) {
      creative.adParameters = this.parserUtils.parseNodeText(adParamsElement);
    }

    for (let trackingEventsElement of this.parserUtils.childrenByName(
      creativeElement,
      'TrackingEvents'
    )) {
      for (let trackingElement of this.parserUtils.childrenByName(
        trackingEventsElement,
        'Tracking'
      )) {
        let eventName = trackingElement.getAttribute('event');
        const trackingURLTemplate = this.parserUtils.parseNodeText(
          trackingElement
        );
        if (eventName != null && trackingURLTemplate != null) {
          if (eventName === 'progress') {
            offset = trackingElement.getAttribute('offset');
            if (!offset) {
              continue;
            }
            if (offset.charAt(offset.length - 1) === '%') {
              eventName = `progress-${offset}`;
            } else {
              eventName = `progress-${Math.round(
                this.parserUtils.parseDuration(offset)
              )}`;
            }
          }

          if (creative.trackingEvents[eventName] == null) {
            creative.trackingEvents[eventName] = [];
          }
          creative.trackingEvents[eventName].push(trackingURLTemplate);
        }
      }
    }

    for (let mediaFilesElement of this.parserUtils.childrenByName(
      creativeElement,
      'MediaFiles'
    )) {
      for (let mediaFileElement of this.parserUtils.childrenByName(
        mediaFilesElement,
        'MediaFile'
      )) {
        const mediaFile = new MediaFile();
        mediaFile.id = mediaFileElement.getAttribute('id');
        mediaFile.fileURL = this.parserUtils.parseNodeText(mediaFileElement);
        mediaFile.deliveryType = mediaFileElement.getAttribute('delivery');
        mediaFile.codec = mediaFileElement.getAttribute('codec');
        mediaFile.mimeType = mediaFileElement.getAttribute('type');
        mediaFile.apiFramework = mediaFileElement.getAttribute('apiFramework');
        mediaFile.bitrate = parseInt(
          mediaFileElement.getAttribute('bitrate') || 0
        );
        mediaFile.minBitrate = parseInt(
          mediaFileElement.getAttribute('minBitrate') || 0
        );
        mediaFile.maxBitrate = parseInt(
          mediaFileElement.getAttribute('maxBitrate') || 0
        );
        mediaFile.width = parseInt(mediaFileElement.getAttribute('width') || 0);
        mediaFile.height = parseInt(
          mediaFileElement.getAttribute('height') || 0
        );

        let scalable = mediaFileElement.getAttribute('scalable');
        if (scalable && typeof scalable === 'string') {
          scalable = scalable.toLowerCase();
          if (scalable === 'true') {
            mediaFile.scalable = true;
          } else if (scalable === 'false') {
            mediaFile.scalable = false;
          }
        }

        let maintainAspectRatio = mediaFileElement.getAttribute(
          'maintainAspectRatio'
        );
        if (maintainAspectRatio && typeof maintainAspectRatio === 'string') {
          maintainAspectRatio = maintainAspectRatio.toLowerCase();
          if (maintainAspectRatio === 'true') {
            mediaFile.maintainAspectRatio = true;
          } else if (maintainAspectRatio === 'false') {
            mediaFile.maintainAspectRatio = false;
          }
        }

        creative.mediaFiles.push(mediaFile);
      }
    }

    const iconsElement = this.parserUtils.childByName(creativeElement, 'Icons');
    if (iconsElement != null) {
      for (let iconElement of this.parserUtils.childrenByName(
        iconsElement,
        'Icon'
      )) {
        const icon = new Icon();
        icon.program = iconElement.getAttribute('program');
        icon.height = parseInt(iconElement.getAttribute('height') || 0);
        icon.width = parseInt(iconElement.getAttribute('width') || 0);
        icon.xPosition = this.parseXPosition(
          iconElement.getAttribute('xPosition')
        );
        icon.yPosition = this.parseYPosition(
          iconElement.getAttribute('yPosition')
        );
        icon.apiFramework = iconElement.getAttribute('apiFramework');
        icon.offset = this.parserUtils.parseDuration(
          iconElement.getAttribute('offset')
        );
        icon.duration = this.parserUtils.parseDuration(
          iconElement.getAttribute('duration')
        );

        for (let htmlElement of this.parserUtils.childrenByName(
          iconElement,
          'HTMLResource'
        )) {
          icon.type = htmlElement.getAttribute('creativeType') || 'text/html';
          icon.htmlResource = this.parserUtils.parseNodeText(htmlElement);
        }

        for (let iframeElement of this.parserUtils.childrenByName(
          iconElement,
          'IFrameResource'
        )) {
          icon.type = iframeElement.getAttribute('creativeType') || 0;
          icon.iframeResource = this.parserUtils.parseNodeText(iframeElement);
        }

        for (let staticElement of this.parserUtils.childrenByName(
          iconElement,
          'StaticResource'
        )) {
          icon.type = staticElement.getAttribute('creativeType') || 0;
          icon.staticResource = this.parserUtils.parseNodeText(staticElement);
        }

        const iconClicksElement = this.parserUtils.childByName(
          iconElement,
          'IconClicks'
        );
        if (iconClicksElement != null) {
          icon.iconClickThroughURLTemplate = this.parserUtils.parseNodeText(
            this.parserUtils.childByName(iconClicksElement, 'IconClickThrough')
          );
          for (let iconClickTrackingElement of this.parserUtils.childrenByName(
            iconClicksElement,
            'IconClickTracking'
          )) {
            icon.iconClickTrackingURLTemplates.push(
              this.parserUtils.parseNodeText(iconClickTrackingElement)
            );
          }
        }

        icon.iconViewTrackingURLTemplate = this.parserUtils.parseNodeText(
          this.parserUtils.childByName(iconElement, 'IconViewTracking')
        );

        creative.icons.push(icon);
      }
    }

    return creative;
  }

  parseXPosition(xPosition) {
    if (['left', 'right'].includes(xPosition)) {
      return xPosition;
    }

    return parseInt(xPosition || 0);
  }

  parseYPosition(yPosition) {
    if (['top', 'bottom'].includes(yPosition)) {
      return yPosition;
    }

    return parseInt(yPosition || 0);
  }
}
