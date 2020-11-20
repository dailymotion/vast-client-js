/**
 * Types for vast-client 3.0.0
 *
 * Types are mostly written according to the docs, what is missing in the docs is
 * take from source code.
 *
 * APIs that are marked as private in the docs are not included here by intention.
 *
 * Docs:
 * [api](./docs/api)
 * [vast docs](./docs/api/class-reference.md)
 * [vast docs 2](./docs/api/3.0-migration.md)
 *
 * Reference:
 * [vast 3.0 xsd](https://github.com/InteractiveAdvertisingBureau/vast/blob/master/vast3_draft.xsd)
 * [vast 4.0 spec](https://www.iab.com/wp-content/uploads/2016/04/VAST4.0_Updated_April_2016.pdf)
 *
 * ⚠️ Note: vast-client types correspond quite well to VAST 3.0 types, however sometimes
 *      - naming is changed (e.g. system/adSystem, impression/impressionUrlTemplates, ...)
 *      - structure is flattened / changed (e.g. CreativeLinear/Creative.Linear)
 *      - number is typed and passed as string (e.g. Icon.pxratio)
 *
 *
 *
 */
declare module 'vast-client' {
    /**
     * ---------------------------------------------------------------------
     * Client, parser, etc types -------------------------------------------
     * ---------------------------------------------------------------------
     */

    export class VASTParser {
        constructor()
        on(eventName: 'VAST-error', callback: (event: {
            ERRORCODE: number
            ERRORMESSAGE?: string
            extensions?: Array<Extension>
            system?: AdSystem
        }) => void): void
        on(eventName: 'VAST-warning', callback: (event: {
            message: string
            parentElement: string
            specVersion: number
        }) => void): void
        on(eventName: 'VAST-resolving', callback: (event: {
            url: string
            previousUrl: string | null
            wrapperDepth: number
            maxWrapperDepth: number
            timeout: number
        }) => void): void
        on(eventName: 'VAST-resolved', callback: (event: {
            url: string
            previousUrl: string | null
            wrapperDepth: number
            error: Error | null
            duration: number
            byteLength: number | undefined
            statusCode: number | undefined
        }) => void): void
        on(eventName: 'VAST-ad-parsed', callback: (event: {
            url: string
            wrapperDepth: number
            type: 'ERROR' | 'WRAPPER' | 'INLINE'
            adIndex: number | undefined
        }) => void): void
    }

    export interface UrlHandler {
        get: (url: string, options: {
            timeout?: number
            withCredentials?: boolean
        }, callback: (...args: any) => void) => void
    }

    export class VASTClient {
        constructor(
            cappingFreeLunch?: number,
            cappingMinimumTimeInterval?: number,
            customStorage?: Storage
        )
        get(uri: string, options?: {
            timeout?: number
            withCredentials?: boolean
            wrapperLimit?: number
            urlHandler?: UrlHandler
            // urlhandler?: UrlHandler // deprecated
            resolveAll?: boolean

        }): Promise<VastResponse>
        getNextAds(all?: boolean): Promise<Array<VastResponse>>
        getParser(): VASTParser
        hasRemainingAds(): boolean
        cappingFreeLunch: number
        cappingMinimumTimeInterval: number
        storage: Storage
    }

    export interface Storage {
        clear(): void
        getItem(key: string): any
        removeItem(key: string): void
        setItem(key: string, value: any): void
    }

    export interface Event {
        trackingURLTemplates: Array<String>
    }

    export type EventName = 'clickthrough'
        | 'skip-countdown'
        | EventName2

    export type EventName2 = EventName3
        /**
         * String of the form progress-[0-100]% progress-[currentTime]
         * e.g. progress-50%, progress-51%, progress-2000
         */
        | string

    export type EventName3 = 'complete'
        | 'close'
        | 'closeLinear'
        | 'collapse'
        | 'creativeView'
        | 'exitFullscreen'
        | 'expand'
        | 'firstQuartile'
        | 'fullscreen'
        | 'loaded'
        | 'midpoint'
        | 'mute'
        | 'pause'
        | 'playerExpand'
        | 'playerCollapse'
        | 'resume'
        | 'rewind'
        | 'skip'
        | 'start'
        | 'thirdQuartile'
        | 'unmute'
        | 'notUsed'
        | 'otherAdInteraction'
        | 'acceptInvitation'
        | 'adExpand'
        | 'adCollapse'
        | 'minimize'
        | 'overlayViewDuration'
        | 'verificationNotExecuted'

    export type Macro = 'ADCATEGORIES'
        | 'ADCOUNT'
        | 'ADPLAYHEAD'
        | 'ADSERVINGID'
        | 'ADTYPE'
        | 'APIFRAMEWORKS'
        | 'APPBUNDLE'
        | 'ASSETURI'
        | 'BLOCKEDADCATEGORIES'
        | 'BREAKMAXADLENGTH'
        | 'BREAKMAXADS'
        | 'BREAKMAXDURATION'
        | 'BREAKMINADLENGTH'
        | 'BREAKMINDURATION'
        | 'BREAKPOSITION'
        | 'CLICKPOS'
        | 'CLICKTYPE'
        | 'CLIENTUA'
        | 'CONTENTID'
        | 'CONTENTPLAYHEAD' // @deprecated VAST 4.
        | 'CONTENTURI'
        | 'DEVICEIP'
        | 'DEVICEUA'
        | 'DOMAIN'
        | 'EXTENSIONS'
        | 'GDPRCONSENT'
        | 'IFA'
        | 'IFATYPE'
        | 'INVENTORYSTATE'
        | 'LATLONG'
        | 'LIMITADTRACKING'
        | 'MEDIAMIME'
        | 'MEDIAPLAYHEAD'
        | 'OMIDPARTNER'
        | 'PAGEURL'
        | 'PLACEMENTTYPE'
        | 'PLAYERCAPABILITIES'
        | 'PLAYERSIZE'
        | 'PLAYERSTATE'
        | 'PODSEQUENCE'
        | 'REGULATIONS'
        | 'SERVERSIDE'
        | 'SERVERUA'
        | 'TRANSACTIONID'
        | 'UNIVERSALADID'
        | 'VASTVERSIONS'
        | 'VERIFICATIONVENDORS'

    type Macros = { [key in Macro]: string | number }

    export class VASTTracker {
        constructor(
            vastClient: VASTClient,
            ad: Ad,
            creative: Creative,
            variation?: Variation
        )
        acceptInvitation(macros?: Macros): void
        adCollapse(macros?: Macros): void
        adExpand(macros?: Macros): void
        close(macros?: Macros): void
        click(fallbackClickThroughURL?: string, macros?: Macros): void
        complete(macros?: Macros): void
        convertToTimecode(timeInSeconds: number): void
        errorWithCode(errorCode: string, isCustomCode: boolean): void
        load(macros?: Macros): void
        minimize(macros?: Macros): void
        notUsed(macros?: Macros): void
        off(eventName: 'clickthrough', callback: (event: string) => void): void
        off(eventName: 'skip-countdown', callback: (event: number) => void): void
        off(eventName: EventName2, callback: (event: Event) => void): void
        on(eventName: 'clickthrough', callback: (event: string) => void): void
        on(eventName: 'skip-countdown', callback: (event: number) => void): void
        on(eventName: EventName2, callback: (event: Event) => void): void
        otherAdInteraction(macros?: Macros): void
        overlayViewDuration(duration: number, macros?: Macros): void
        setDuration(duration: number): void
        setExpand(isExpanded: boolean, macros?: Macros): void
        setFullscreen(isFullScreen: boolean, macros?: Macros): void
        setMuted(isMuted: boolean, macros?: Macros): void
        setPaused(isPaused: boolean, macros?: Macros): void
        setProgress(seconds: number, macros?: Macros): void
        setSkipDelay(duration: number): void
        skip(macros?: Macros): void
        track(eventName: string, options: { macros?: Macros, once?: boolean }): void
        trackImpression(macros?: Macros): void
        verificationNotExecuted(macros?: Macros): void
    }








    /**
     * ----------------------------------------------------------------------
     * VAST-like types ------------------------------------------------------
     * ----------------------------------------------------------------------
    */

    /**
     * A map of eventName to be tracked and array of tracking urls to be called
     * when event occurs. This is done by VASTTracker.
     * @see EventName for all supported event names
     */
    interface TrackingEvents {[eventName: string]: Array<string>}

    interface VastResponse {
        ads: Array<Ad>
        errorUrlTemplates: Array<string>
        version: string
    }

    interface Ad {
        adServingId: string
        adType: 'video' | 'companionAd' | 'nonLinearAd' | null
        adVerifications: Array<AdVerification>
        /**
         * Common name of advertiser
         */
        advertiser: Advertiser | null
        allowMultipleAds: false
        blockedAdCategories: Array<Category>
        categories: Array<Category>
        /**
         * Contains all creative elements within an InLine or Wrapper Ad.
         * There is always at least 1 creative.
         */
        creatives: Array<Creative>
        description: null
        errorURLTemplates: Array<string>
        expires: number | null
        extensions: Array<Extension>
        fallbackOnNoAd: null
        followAdditionalWrappers: true
        id: string | null
        /**
         * Must be at least 1.
         */
        impressionURLTemplates: Array<UrlTemplate>
        /**
         * The price of the ad.
         */
        pricing: Pricing | null,
        /**
         * Identifies the sequence of multiple Ads and defines an Ad Pod.
         */
        sequence: number | null
        /**
         * URL of request to survey vendor
         */
        survey: string | null // @deprecated in VAST 4.1
        /**
         * Indicates source ad server
         */
        system: AdSystem
        title: string // adTitle
        viewableImpression: ViewableImpression
    }

    interface AdSystem {
        value: string
        /**
         * Internal version used by ad system
         */
        version: string | null
    }

    interface AdVerification {
        /**
         * The name of the API framework used to execute the AdVerification code
         */
        apiFramework: string | null
        /**
         * If *true*, this resource is optimized and able to execute in an
         * environment without DOM and other browser built-ins (e.g. iOS' JavaScriptCore).
         */
        browserOptional: boolean
        /**
         * string intended for bootstrapping the verification code and providing metadata
         * about the current impression
         */
        parameters: string | null
        /**
         * URI to the JavaScript file used to collect verification data
         */
        resource: string | null
        trackingEvents: TrackingEvents
        /**
         * The type of executable resource provided
         */
        type: string | null
        /**
         * An identifier for the verification vendor
         */
        vendor: string | null
    }

    interface Advertiser {
        id: string
        value: string
    }

    interface ViewableImpression {
        id: string | null
        notviewable: Array<string>
        viewable: Array<string>
        viewundetermined: Array<string>
    }

    interface Category {
        /**
         * A URL for the organizational authority that produced the list being used to identify ad content category
         */
        authority: string
        /**
         *  A category code or label that identifies the ad content category
         */
        value: string
    }

    interface Extension {
        attributes: Object
        children: Array<Extension>
        name: string | null
        value: Object
    }

    interface Pricing {
        currency: string
        model: string
        value: number
    }

    /**
     * This is an abstract interface, it should not be instantiated directly.
     * (Wraps each creative element within an InLine or Wrapper Ad)
     */
    interface Creative {
        /**
         * Ad-ID for the creative (formerly ISCI)
         */
        adId: string | null
        /**
         * The apiFramework defines the method to use for communication
         * if the MediaFile is interactive. Suggested values for this
         * element are “VPAID”, “FlashVars” (for Flash/Flex),
         * “initParams” (for Silverlight) and “GetVariables”
         * (variables placed in key/value pairs on the asset request).
         */
        apiFramework: string | null
        creativeExtensions: Array<Extension>
        id: string | null,
        /**
         * The preferred order in which multiple Creatives should be displayed
         */
        sequence: number | null
        type: CreativeType
        universalAdId: { value: string, idRegistry: string } | null
    }

    type CreativeType = 'linear' | 'nonlinear' | 'companion'

    interface CreativeLinear extends Creative {
        adParameters: string | null
        closedCaptionFiles: Array<ClosedCaptionFile>
        duration: number
        icons: Array<Icon>
        interactiveCreativeFile: InteractiveCreativeFile
        mediaFiles: Array<MediaFile>
        mezzanine: Mezzanine
        skipDelay: number | null
        trackingEvents: TrackingEvents
        type: 'linear'
        videoClickThroughURLTemplate: string | null
        videoClickTrackingURLTemplates: Array<string>
        videoCustomClickURLTemplates: Array<string>
    }

    interface CreativeNonLinear extends Creative {
        trackingEvents: TrackingEvents
        type: 'nonlinear'
        variations: Array<NonLinearAd>
    }

    interface CreativeCompanion extends Creative {
        required: string|null
        type: 'companion'
        variations: Array<CompanionAd>
    }

    type Variation = NonLinearAd | CompanionAd

    interface CompanionAd {
        /**
         * Used to indicate when and where to use this companion ad. Default value = default
         */
        adParameters: string|null
        adSlotID: string|null
        altText: string|null
        apiFramework: string|null
        assetHeight: number|null
        assetWidth: number|null
        companionClickThroughURLTemplate: string|null
        companionClickTrackingURLTemplates: Array<UrlTemplate>
        expandedHeight: number|null
        expandedWidth: number|null
        height: number
        htmlResources: Array<string>
        id: string|null
        iframeResources: Array<string>
        /**
         * The pixel ratio for which the companion creative is intended.
         * Default value = 1
         */
        pxratio: string|'1'
        renderingMode: string|'default'
        staticResources: Array<{ url: string, creativeType: string|null }>
        trackingEvents: TrackingEvents
        width: number
        xmlEncoded: boolean|null
    }

    interface UrlTemplate {
        id: string|null
        url: string
    }

    interface NonLinearAd {
        adParameters: string|null
        apiFramework: string
        expandedHeight: number
        expandedWidth: number
        height: number
        htmlResource: string|null
        id: string|null
        iframeResource: string|null
        maintainAspectRatio: boolean
        minSuggestedDuration: number
        nonlinearClickThroughURLTemplate: string|null
        nonlinearClickTrackingURLTemplates: Array<UrlTemplate>
        scalable: boolean
        staticResource: string|null
        type: string|null
        width: number
    }

    interface MediaFile {
        apiFramework: string|null
        bitrate: number
        code: string|null
        deliveryType: string
        fileSize: number|null
        fileURL: string|null
        height: number
        id: string|null
        maintainAspectRatio: boolean|null
        maxBitrate: number
        /**
         * Type of media file (3D / 360 / etc). Optional. Default value = 2D
         */
        mediaType: string|null
        mimeType: string|null
        minBitrate: number
        scalable: boolean|null
        width: number
    }

    interface Mezzanine {
        /**
         * Either "progressive" for progressive download protocols (such as HTTP)
         * or "streaming" for streaming protocols
         */
        delivery: 'progressive' | 'streaming'
        /**
         * MIME type for the file container. Popular MIME types include,
         * but are not limited to "video/mp4" for MP4, "audio/mpeg"
         * and "audio/aac" for audio ads
         */
        type: string
        width: number
        height: number
        /**
         * The codec used to encode the file which can take values
         * as specified by RFC 4281: http://tools.ietf.org/html/rfc4281
         */
        codec: string|null
        id: string|null
        fileSize: number|null
        /**
         * Type of media file (3D / 360 / etc). Optional. Default value = 2D
         */
        mediaType: string|null
        fileURL: string|null
    }

    interface ClosedCaptionFile {
        fileURL: string | null
        /**
         * Language of the Closed Caption File using ISO 631-1 codes
         */
        language: string | null
        /**
         *  MIME type for the file provided
         */
        type: string | null
    }

    interface InteractiveCreativeFile {
        /**
         * Identifies the API needed to execute the resource file, if applicable
         */
        apiFramework: string | null
        fileURL: string | null
        /**
         * MIME type for the file provided
         */
        type: string|null
        /**
         * Identifies whether the ad always drops when the duration is reached,
         * or if it can potentially extend the duration by pausing the underlying
         * video or delaying the adStopped call after adVideoComplete
         */
        variableDuration: boolean | null
    }

    /**
     * Icon representing advertising industry initiatives.
     */
    interface Icon {
        apiFramework: string|null
        duration: number
        height: number
        htmlResource: string|null
        iconClickThroughURLTemplate: string|null
        iconClickTrackingURLTemplates: Array<UrlTemplate>
        iconViewTrackingURLTemplate: string|null
        iframeResource: string|null
        offset: string|null
        program: string|null
        /**
         * The pixel ratio for which the icon creative is intended. Default value = 1
         */
        pxratio: string|'1'
        staticResource: string|null
        type: string|null
        width: number
        xPosition: number
        yPosition: number
    }
}
