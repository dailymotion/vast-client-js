import { CreativeLinear } from '../creative/creative_linear';
import { Icon } from '../icon';
import { MediaFile } from '../media_file';
import { Mezzanine } from '../mezzanine';
import { parserUtils } from './parser_utils';

/**
 * This module provides methods to parse a VAST Linear Element.
 */

/**
 * Parses a Linear element.
 * @param  {Object} creativeElement - The VAST Linear element to parse.
 * @param  {any} creativeAttributes - The attributes of the Linear (optional).
 * @return {CreativeLinear}
 */
export function parseCreativeLinear(creativeElement, creativeAttributes) {
  let offset;
  const creative = new CreativeLinear(creativeAttributes);

  creative.duration = parserUtils.parseDuration(
    parserUtils.parseNodeText(
      parserUtils.childByName(creativeElement, 'Duration')
    )
  );
  const skipOffset = creativeElement.getAttribute('skipoffset');

  if (typeof skipOffset === 'undefined' || skipOffset === null) {
    creative.skipDelay = null;
  } else if (
    skipOffset.charAt(skipOffset.length - 1) === '%' &&
    creative.duration !== -1
  ) {
    const percent = parseInt(skipOffset, 10);
    creative.skipDelay = creative.duration * (percent / 100);
  } else {
    creative.skipDelay = parserUtils.parseDuration(skipOffset);
  }

  const videoClicksElement = parserUtils.childByName(
    creativeElement,
    'VideoClicks'
  );
  if (videoClicksElement) {
    creative.videoClickThroughURLTemplate = parserUtils.parseNodeText(
      parserUtils.childByName(videoClicksElement, 'ClickThrough')
    );

    parserUtils
      .childrenByName(videoClicksElement, 'ClickTracking')
      .forEach(clickTrackingElement => {
        creative.videoClickTrackingURLTemplates.push(
          parserUtils.parseNodeText(clickTrackingElement)
        );
      });

    parserUtils
      .childrenByName(videoClicksElement, 'CustomClick')
      .forEach(customClickElement => {
        creative.videoCustomClickURLTemplates.push(
          parserUtils.parseNodeText(customClickElement)
        );
      });
  }

  const adParamsElement = parserUtils.childByName(
    creativeElement,
    'AdParameters'
  );
  if (adParamsElement) {
    creative.adParameters = parserUtils.parseNodeText(adParamsElement);
  }

  parserUtils
    .childrenByName(creativeElement, 'TrackingEvents')
    .forEach(trackingEventsElement => {
      parserUtils
        .childrenByName(trackingEventsElement, 'Tracking')
        .forEach(trackingElement => {
          let eventName = trackingElement.getAttribute('event');
          const trackingURLTemplate = parserUtils.parseNodeText(
            trackingElement
          );
          if (eventName && trackingURLTemplate) {
            if (eventName === 'progress') {
              offset = trackingElement.getAttribute('offset');
              if (!offset) {
                return;
              }
              if (offset.charAt(offset.length - 1) === '%') {
                eventName = `progress-${offset}`;
              } else {
                eventName = `progress-${Math.round(
                  parserUtils.parseDuration(offset)
                )}`;
              }
            }

            if (!Array.isArray(creative.trackingEvents[eventName])) {
              creative.trackingEvents[eventName] = [];
            }
            creative.trackingEvents[eventName].push(trackingURLTemplate);
          }
        });
    });

  parserUtils
    .childrenByName(creativeElement, 'MediaFiles')
    .forEach(mediaFilesElement => {
      parserUtils
        .childrenByName(mediaFilesElement, 'MediaFile')
        .forEach(mediaFileElement => {
          const mediaFile = new MediaFile();
          mediaFile.id = mediaFileElement.getAttribute('id');
          mediaFile.fileURL = parserUtils.parseNodeText(mediaFileElement);
          mediaFile.deliveryType = mediaFileElement.getAttribute('delivery');
          mediaFile.codec = mediaFileElement.getAttribute('codec');
          mediaFile.mimeType = mediaFileElement.getAttribute('type');
          mediaFile.apiFramework = mediaFileElement.getAttribute(
            'apiFramework'
          );
          mediaFile.bitrate = parseInt(
            mediaFileElement.getAttribute('bitrate') || 0
          );
          mediaFile.minBitrate = parseInt(
            mediaFileElement.getAttribute('minBitrate') || 0
          );
          mediaFile.maxBitrate = parseInt(
            mediaFileElement.getAttribute('maxBitrate') || 0
          );
          mediaFile.width = parseInt(
            mediaFileElement.getAttribute('width') || 0
          );
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
        });

      const mezzanineElement = parserUtils.childByName(mediaFilesElement, 'Mezzanine');
      if (mezzanineElement) {
        const mezzanine = new Mezzanine();
        mezzanine.id = mezzanineElement.getAttribute('id');
        mezzanine.fileURL = parserUtils.parseNodeText(mezzanineElement);
        mezzanine.deliveryType = mezzanineElement.getAttribute('delivery');
        mezzanine.codec = mezzanineElement.getAttribute('codec');
        mezzanine.type = mezzanineElement.getAttribute('type');
        mezzanine.width = parseInt(
            mezzanineElement.getAttribute('width') || 0, 10
        );
        mezzanine.height = parseInt(
            mezzanineElement.getAttribute('height') || 0, 10
        );
        mezzanine.fileSize = parseInt(
            mezzanineElement.getAttribute('fileSize') || 0, 10
        );
        mezzanine.mediaType = mezzanineElement.getAttribute('mediaType') || '2D';

        creative.mezzanine = mezzanine;
      }
    });

  const iconsElement = parserUtils.childByName(creativeElement, 'Icons');
  if (iconsElement) {
    parserUtils.childrenByName(iconsElement, 'Icon').forEach(iconElement => {
      const icon = new Icon();
      icon.program = iconElement.getAttribute('program');
      icon.height = parseInt(iconElement.getAttribute('height') || 0);
      icon.width = parseInt(iconElement.getAttribute('width') || 0);
      icon.xPosition = parseXPosition(iconElement.getAttribute('xPosition'));
      icon.yPosition = parseYPosition(iconElement.getAttribute('yPosition'));
      icon.apiFramework = iconElement.getAttribute('apiFramework');
      icon.offset = parserUtils.parseDuration(
        iconElement.getAttribute('offset')
      );
      icon.duration = parserUtils.parseDuration(
        iconElement.getAttribute('duration')
      );

      parserUtils
        .childrenByName(iconElement, 'HTMLResource')
        .forEach(htmlElement => {
          icon.type = htmlElement.getAttribute('creativeType') || 'text/html';
          icon.htmlResource = parserUtils.parseNodeText(htmlElement);
        });

      parserUtils
        .childrenByName(iconElement, 'IFrameResource')
        .forEach(iframeElement => {
          icon.type = iframeElement.getAttribute('creativeType') || 0;
          icon.iframeResource = parserUtils.parseNodeText(iframeElement);
        });

      parserUtils
        .childrenByName(iconElement, 'StaticResource')
        .forEach(staticElement => {
          icon.type = staticElement.getAttribute('creativeType') || 0;
          icon.staticResource = parserUtils.parseNodeText(staticElement);
        });

      const iconClicksElement = parserUtils.childByName(
        iconElement,
        'IconClicks'
      );
      if (iconClicksElement) {
        icon.iconClickThroughURLTemplate = parserUtils.parseNodeText(
          parserUtils.childByName(iconClicksElement, 'IconClickThrough')
        );
        parserUtils
          .childrenByName(iconClicksElement, 'IconClickTracking')
          .forEach(iconClickTrackingElement => {
            icon.iconClickTrackingURLTemplates.push(
              parserUtils.parseNodeText(iconClickTrackingElement)
            );
          });
      }

      icon.iconViewTrackingURLTemplate = parserUtils.parseNodeText(
        parserUtils.childByName(iconElement, 'IconViewTracking')
      );

      creative.icons.push(icon);
    });
  }

  return creative;
}

/**
 * Parses an horizontal position into a String ('left' or 'right') or into a Number.
 * @param  {String} xPosition - The x position to parse.
 * @return {String|Number}
 */
function parseXPosition(xPosition) {
  if (['left', 'right'].indexOf(xPosition) !== -1) {
    return xPosition;
  }

  return parseInt(xPosition || 0);
}

/**
 * Parses an vertical position into a String ('top' or 'bottom') or into a Number.
 * @param  {String} yPosition - The x position to parse.
 * @return {String|Number}
 */
function parseYPosition(yPosition) {
  if (['top', 'bottom'].indexOf(yPosition) !== -1) {
    return yPosition;
  }

  return parseInt(yPosition || 0);
}
