/**
 * This class provides methods to track an ad execution.
 *
 * @export
 * @class VASTTracker
 * @extends EventEmitter
 */
export class VASTTracker extends EventEmitter {
    /**
     * Creates an instance of VASTTracker.
     *
     * @param {VASTClient} client - An instance of VASTClient that can be updated by the tracker. [optional]
     * @param {Ad} ad - The ad to track.
     * @param {Creative} creative - The creative to track.
     * @param {Object} [variation=null] - An optional variation of the creative.
     * @param {Boolean} [muted=false] - The initial muted state of the video.
     * @constructor
     */
    constructor(client: VASTClient, ad: Ad, creative: Creative, variation?: any, muted?: boolean);
    ad: Ad;
    creative: Creative;
    variation: any;
    muted: boolean;
    impressed: boolean;
    skippable: boolean;
    trackingEvents: {};
    trackedProgressEvents: any[];
    lastPercentage: number;
    _alreadyTriggeredQuartiles: {};
    emitAlwaysEvents: string[];
    viewableImpressionTrackers: any;
    /**
     * Init the custom tracking options for linear creatives.
     *
     * @return {void}
     */
    _initLinearTracking(): void;
    linear: boolean;
    skipDelay: any;
    clickThroughURLTemplate: any;
    clickTrackingURLTemplates: any;
    /**
     * Init the custom tracking options for nonlinear and companion creatives.
     * These options are provided in the variation Object.
     *
     * @return {void}
     */
    _initVariationTracking(): void;
    /**
     * Sets the duration of the ad and updates the quartiles based on that.
     *
     * @param  {Number} duration - The duration of the ad.
     */
    setDuration(duration: number): void;
    assetDuration: number;
    quartiles: {
        firstQuartile: number;
        midpoint: number;
        thirdQuartile: number;
    };
    /**
     * Sets the duration of the ad and updates the quartiles based on that.
     * This is required for tracking time related events.
     *
     * @param {Number} progress - Current playback time in seconds.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#start
     * @emits VASTTracker#skip-countdown
     * @emits VASTTracker#progress-[0-100]%
     * @emits VASTTracker#progress-[currentTime]
     * @emits VASTTracker#rewind
     * @emits VASTTracker#firstQuartile
     * @emits VASTTracker#midpoint
     * @emits VASTTracker#thirdQuartile
     */
    setProgress(progress: number, macros?: any, trackOnce?: boolean): void;
    progress: number;
    /**
     * Checks if a quartile has been reached without have being triggered already.
     *
     * @param {String} quartile - Quartile name
     * @param {Number} time - Time offset of the quartile, when this quartile is reached in seconds.
     * @param {Number} progress - Current progress of the ads in seconds.
     *
     * @return {Boolean}
     */
    isQuartileReached(quartile: string, time: number, progress: number): boolean;
    /**
     * Updates the mute state and calls the mute/unmute tracking URLs.
     *
     * @param {Boolean} muted - Indicates if the video is muted or not.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#mute
     * @emits VASTTracker#unmute
     */
    setMuted(muted: boolean, macros?: any): void;
    /**
     * Update the pause state and call the resume/pause tracking URLs.
     *
     * @param {Boolean} paused - Indicates if the video is paused or not.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#pause
     * @emits VASTTracker#resume
     */
    setPaused(paused: boolean, macros?: any): void;
    paused: any;
    /**
     * Updates the fullscreen state and calls the fullscreen tracking URLs.
     *
     * @param {Boolean} fullscreen - Indicates if the video is in fulscreen mode or not.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#fullscreen
     * @emits VASTTracker#exitFullscreen
     */
    setFullscreen(fullscreen: boolean, macros?: any): void;
    fullscreen: any;
    /**
     * Updates the expand state and calls the expand/collapse tracking URLs.
     *
     * @param {Boolean} expanded - Indicates if the video is expanded or not.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#expand
     * @emits VASTTracker#playerExpand
     * @emits VASTTracker#collapse
     * @emits VASTTracker#playerCollapse
     */
    setExpand(expanded: boolean, macros?: any): void;
    expanded: any;
    /**
     * Must be called if you want to overwrite the <Linear> Skipoffset value.
     * This will init the skip countdown duration. Then, every time setProgress() is called,
     * it will decrease the countdown and emit a skip-countdown event with the remaining time.
     * Do not call this method if you want to keep the original Skipoffset value.
     *
     * @param {Number} duration - The time in seconds until the skip button is displayed.
     */
    setSkipDelay(duration: number): void;
    /**
     * Tracks an impression (can be called only once).
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#creativeView
     */
    trackImpression(macros?: any): void;
    /**
     * Tracks Viewable impression
     * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
     */
    trackViewableImpression(macros?: any, once?: boolean): void;
    /**
     * Tracks NotViewable impression
     * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
     */
    trackNotViewableImpression(macros?: any, once?: boolean): void;
    /**
     * Tracks ViewUndetermined impression
     * @param {Object} [macros = {}] An optional Object containing macros and their values to be used and replaced in the tracking calls.
     */
    trackUndeterminedImpression(macros?: any, once?: boolean): void;
    /**
     * Send a request to the URI provided by the VAST <Error> element.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
     */
    error(macros?: any, isCustomCode?: boolean): void;
    /**
     * Send a request to the URI provided by the VAST <Error> element.
     * If an [ERRORCODE] macro is included, it will be substitute with errorCode.
     * @deprecated
     * @param {String} errorCode - Replaces [ERRORCODE] macro. [ERRORCODE] values are listed in the VAST specification.
     * @param {Boolean} [isCustomCode=false] - Flag to allow custom values on error code.
     */
    errorWithCode(errorCode: string, isCustomCode?: boolean): void;
    /**
     * Must be called when the user watched the linear creative until its end.
     * Calls the complete tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#complete
     */
    complete(macros?: any): void;
    /**
     * Must be called if the ad was not and will not be played
     * This is a terminal event; no other tracking events should be sent when this is used.
     * Calls the notUsed tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#notUsed
     */
    notUsed(macros?: any): void;
    /**
     * An optional metric that can capture all other user interactions
     * under one metric such as hover-overs, or custom clicks. It should NOT replace
     * clickthrough events or other existing events like mute, unmute, pause, etc.
     * Calls the otherAdInteraction tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#otherAdInteraction
     */
    otherAdInteraction(macros?: any): void;
    /**
     * Must be called if the user clicked or otherwise activated a control used to
     * pause streaming content,* which either expands the ad within the player’s
     * viewable area or “takes-over” the streaming content area by launching
     * additional portion of the ad.
     * Calls the acceptInvitation tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#acceptInvitation
     */
    acceptInvitation(macros?: any): void;
    /**
     * Must be called if user activated a control to expand the creative.
     * Calls the adExpand tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#adExpand
     */
    adExpand(macros?: any): void;
    /**
     * Must be called when the user activated a control to reduce the creative to its original dimensions.
     * Calls the adCollapse tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#adCollapse
     */
    adCollapse(macros?: any): void;
    /**
     * Must be called if the user clicked or otherwise activated a control used to minimize the ad.
     * Calls the minimize tracking URLs.
     *
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#minimize
     */
    minimize(macros?: any): void;
    /**
     * Must be called if the player did not or was not able to execute the provided
     * verification code.The [REASON] macro must be filled with reason code
     * Calls the verificationNotExecuted tracking URL of associated verification vendor.
     *
     * @param {String} vendor - An identifier for the verification vendor. The recommended format is [domain]-[useCase], to avoid name collisions. For example, "company.com-omid".
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#verificationNotExecuted
     */
    verificationNotExecuted(vendor: string, macros?: any): void;
    /**
     * The time that the initial ad is displayed. This time is based on
     * the time between the impression and either the completed length of display based
     * on the agreement between transactional parties or a close, minimize, or accept
     * invitation event.
     * The time will be passed using [ADPLAYHEAD] macros for VAST 4.1
     * Calls the overlayViewDuration tracking URLs.
     *
     * @param {String} formattedDuration - The time that the initial ad is displayed.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#overlayViewDuration
     */
    overlayViewDuration(formattedDuration: string, macros?: any): void;
    /**
     * Must be called when the player or the window is closed during the ad.
     * Calls the `closeLinear` (in VAST 3.0 and 4.1) and `close` tracking URLs.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     *
     * @emits VASTTracker#closeLinear
     * @emits VASTTracker#close
     */
    close(macros?: any): void;
    /**
     * Must be called when the skip button is clicked. Calls the skip tracking URLs.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     *
     * @emits VASTTracker#skip
     */
    skip(macros?: any): void;
    /**
     * Must be called then loaded and buffered the creative’s media and assets either fully
     * or to the extent that it is ready to play the media
     * Calls the loaded tracking URLs.
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     *
     * @emits VASTTracker#loaded
     */
    load(macros?: any): void;
    /**
     * Must be called when the user clicks on the creative.
     * It calls the tracking URLs and emits a 'clickthrough' event with the resolved
     * clickthrough URL when done.
     *
     * @param {?String} [fallbackClickThroughURL=null] - an optional clickThroughURL template that could be used as a fallback
     * @param {Object} [macros={}] - An optional Object containing macros and their values to be used and replaced in the tracking calls.
     * @emits VASTTracker#clickthrough
     */
    click(fallbackClickThroughURL?: string | null, macros?: any): void;
    /**
     * Calls the tracking URLs for progress events for the given eventName and emits the event.
     *
     * @param {String} eventName - The name of the event.
     * @param macros - An optional Object of parameters (vast macros) to be used in the tracking calls.
     * @param once - Boolean to define if the event has to be tracked only once.
     */
    trackProgressEvents(eventName: string, macros: any, once: any): void;
    /**
     * Calls the tracking URLs for the given eventName and emits the event.
     *
     * @param {String} eventName - The name of the event.
     * @param {Object} options
     * @param {Object} [options.macros={}] - An optional Object of parameters (vast macros) to be used in the tracking calls.
     * @param {Boolean} [options.once=false] - Boolean to define if the event has to be tracked only once.
     *
     */
    track(eventName: string, { macros, once }?: {
        macros?: any;
        once?: boolean;
    }): void;
    /**
     * Calls the tracking urls templates with the given macros .
     *
     * @param {Array} URLTemplates - An array of tracking url templates.
     * @param {Object} [macros ={}] - An optional Object of parameters to be used in the tracking calls.
     * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
     */
    trackURLs(URLTemplates: any[], macros?: any, options?: any): void;
    /**
     * Formats time in seconds to VAST timecode (e.g. 00:00:10.000)
     *
     * @param {Number} timeInSeconds - Number in seconds
     * @return {String}
     */
    convertToTimecode(timeInSeconds: number): string;
    /**
     * Formats time progress in a readable string.
     *
     * @return {String}
     */
    progressFormatted(): string;
}
import { EventEmitter } from './util/event_emitter';
//# sourceMappingURL=vast_tracker.d.ts.map