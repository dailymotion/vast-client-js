//eslint-disable-next-line
import { VASTClient, VASTTracker } from '@dailymotion/vast-client';

const mainContent =
  'https://dmplayer.storage.googleapis.com/tech_test/midnight_sun_720p.mp4';
const videoPlayer = document.getElementById('myVideo');
const variationImg = document.getElementById('variationImg');
const variationContainer = document.getElementById('variationContainer');

//vastTracker for linear ads
let vastTracker = null;
//vastTracker for companion ads
let companionVastTracker = null;

/**
 * Get the first valid creative from an ad
 */
export const getCreative = (ad) => {
  if (!ad.creatives) {
    return null;
  }

  return ad.creatives.find((creative) => creative.mediaFiles) || null;
};

/**
 * Get the URL of the first media file in the creative
 */

export const getMediaFileUrl = (creative) => {
  const mediaFiles = creative.mediaFiles;
  if (!mediaFiles.length) {
    return null;
  }

  return mediaFiles.find((mediaFile) => mediaFile.fileURL).fileURL || null;
};

/**
 * @returns a promise that resolves with the parsed VAST
 */

export const parsePreroll = async () => {
  const VAST = 'https://statics.dmcdn.net/h/html/vast/simple-inline.xml';

  const vastClient = new VASTClient();
  try {
    return vastClient.get(VAST);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

/**
 * play a preroll
 */

export const playPreroll = async () => {
  const parsedVAST = await parsePreroll();
  // here we are using the first ad from the parsed vast that contain creatives,
  // however, this logic can depend on you player implementation logic
  const validAd = parsedVAST.ads.find((ads) => ads.creatives.length > 0);
  if (!validAd) {
    return;
  }

  const creative = getCreative(validAd);
  const mediaFileUrl = getMediaFileUrl(creative);
  const variationData = getVariationData(validAd);
  const companionCreative = getCreativeCompanion(validAd);

  videoPlayer.src = mediaFileUrl;
  videoPlayer.play();

  // listen the ended event to stop the ad and remove trackers
  videoPlayer.addEventListener('ended', stopAd);

  // once we have the parsed vast we can instantiate the vastTracker
  vastTracker = new VASTTracker(null, validAd, creative);

  //if we have a companion ad we instantiate the companionVastTracker
  if (variationData.variation) {
    companionVastTracker = new VASTTracker(
      null,
      validAd,
      companionCreative,
      variationData.variation
    );
  }

  displayVariation(variationData);
  initTrackers();
};

/**
 * Stop the ad and remove all EventListeners
 */

export const stopAd = () => {
  videoPlayer.src = mainContent;
  videoPlayer.load();
  videoPlayer.play();
  variationContainer.style.display = 'none';
  removeTrackers(videoPlayer);
};

/**
 *  attach all the EventListeners to the videoPlayer
 */
export const initTrackers = () => {
  videoPlayer.addEventListener('volumechange', handleMuteTrackers);
  videoPlayer.addEventListener('click', handleClickTrackers);
  videoPlayer.addEventListener('canplay', handleImpressionTrackers);
  videoPlayer.addEventListener('canplay', handleCompanionImpressionTrackers);
  videoPlayer.addEventListener('timeupdate', handleTimeUpdateTrackers);
  videoPlayer.addEventListener('ended', handleCompleteTrackers);
  videoPlayer.addEventListener('play', handleResumeTrackers);
  videoPlayer.addEventListener('pause', handlePauseTrackers);
  videoPlayer.addEventListener('error', handleErrorTrackers);
  //listener on the variation container to detect the click an fire the tracker
  variationImg.addEventListener('click', handleCompanionClickTrackers);
};

/**
 * removes all the EventListeners from the videoPlayer
 */
export const removeTrackers = () => {
  videoPlayer.removeEventListener('volumechange', handleMuteTrackers);
  videoPlayer.removeEventListener('click', handleClickTrackers);
  videoPlayer.removeEventListener('canplay', handleImpressionTrackers);
  videoPlayer.removeEventListener('canplay', handleCompanionImpressionTrackers);
  videoPlayer.removeEventListener('timeupdate', handleTimeUpdateTrackers);
  videoPlayer.removeEventListener('play', handleResumeTrackers);
  videoPlayer.removeEventListener('pause', handlePauseTrackers);
  videoPlayer.removeEventListener('ended', handleCompleteTrackers);
  videoPlayer.removeEventListener('error', handleErrorTrackers);
  variationImg.removeEventListener('click', handleCompanionClickTrackers);
};

/**
 * Send  mute and unmute trackers using the vastTracker
 */
const handleMuteTrackers = (e) => {
  if (!vastTracker) {
    return;
  }

  const muted = e.target.muted;
  vastTracker.setMuted(muted);
};

/**
 * Send click trackers using the vastTracker
 */
const handleClickTrackers = (e) => {
  if (!vastTracker) {
    return;
  }

  // The values for the CLICKPOS macros depends on your player implementations logic
  vastTracker.click(null, { CLICKPOS: [e.clientX, e.clientY] });
  vastTracker.on('clickthrough', (url) => {
    window.open(url, '_blank');
  });
};

/**
 * Send companion click trackers using the vastTracker
 */
const handleCompanionClickTrackers = () => {
  if (!companionVastTracker) {
    return;
  }
  companionVastTracker.click();
  companionVastTracker.on('clickthrough', (url) => {
    window.open(url, '_blank');
  });
};

/**
 * Send impression trackers for linear ads using the vastTracker
 */
const handleImpressionTrackers = () => {
  if (!vastTracker) {
    return;
  }
  vastTracker.trackImpression();
};

/**
 * Send impression trackers for companion ads using the vastTracker
 */
const handleCompanionImpressionTrackers = () => {
  if (!companionVastTracker) {
    return;
  }
  companionVastTracker.trackImpression();
};

/**
 * Send complete tracker using the vastTracker
 */
const handleCompleteTrackers = () => {
  if (!vastTracker) {
    return;
  }
  vastTracker.complete();
};

/**
 * Send pause tracker using the vastTracker
 */

const handlePauseTrackers = () => {
  if (!vastTracker) {
    return;
  }
  vastTracker.setPaused(true);
};

/**
 * Send resume tracker using the vastTracker
 */
const handleResumeTrackers = () => {
  if (!vastTracker) {
    return;
  }
  vastTracker.setPaused(false);
};

/**
 * Send progress tracker(firstQuartile, midpoint...) using the vastTracker
 */
const handleTimeUpdateTrackers = () => {
  if (!vastTracker) {
    return;
  }
  vastTracker.setProgress(videoPlayer.currentTime);
};

/**
 * Send error trackers using the vastTracker
 */

const handleErrorTrackers = () => {
  if (!vastTracker) {
    return;
  }
  vastTracker.error();
};

///////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////COMPANION HANDLING////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @returns the first valid companion creative
 */
const getCreativeCompanion = (ad) => {
  if (!ad.creatives) {
    return null;
  }

  const validCreative = ad.creatives.find(
    (creative) => creative.type === 'companion'
  );

  return validCreative || null;
};

/**
 * @returns an Object containing the image url and the variation
 */

const getVariationData = (ad) => {
  if (!ad.creatives) {
    return null;
  }
  const validCreative = getCreativeCompanion(ad);

  if (!validCreative.variations.length) {
    return null;
  }

  return {
    imgUrl: getVariationUrl(validCreative.variations[0]),
    variation: validCreative.variations[0],
  };
};

/**
 * @returns the image url of the variation to display
 */

const getVariationUrl = (variation) => {
  if (!variation.staticResources.length) {
    return null;
  }

  return variation.staticResources[0].url;
};

const displayVariation = (variationData) => {
  const { imgUrl, variation } = variationData;
  if (!variation) {
    return null;
  }
  variationImg.src = imgUrl;
  variationImg.style.height = `${variation.assetHeight}px`;
  variationImg.style.assetWIdth = `${variation.assetWidth}px`;
  variationContainer.style.display = 'block';
  variationContainer.style.width = `${variation.width}px`;
  variationContainer.style.height = `${variation.height}px`;
  variationImg.style.maxWidth = `${variation.expandedWidth}px`;
  variationImg.style.maxHeight = `${variation.expandedHeight}px`;
};
