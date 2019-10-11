# Object reference

## VASTResponse

This object represents a parsed VAST response.

- `ads: Array<Object>` [go to object](#ad)
- `errorURLTemplates: Array<String>`
- `version: String`

## Ad<a name="ad"></a>

This object represents a single parsed Ad

- `id: String|null`
- `sequence: Number|null`
- `system: String|null`
- `title: String|null`
- `description: String|null`
- `advertiser: Object|null`
- `pricing: String|null`
- `survey: String|null`
- `errorURLTemplates: Array<String>`
- `impressionURLTemplates: Array<Object>`
- `creatives: Array<Object>` [go to object](#creative)
- `extensions: Array<Object>` [go to object](#extension)
- `adVerifications: Array<Object>` [go to object](#ad-verification)

## Creative<a name="creative"></a>

This object represents a generic Creative. It's used as a parent object for more specific creative implementations.

- `id: String|null`
- `adId: String|null`
- `sequence: Number|null`
- `apiFramework: String|null`
- `universalAdId: Object|null`
- `creativeExtensions: Array<Object>` [go to object](#extension)

## CreativeLinear *extends* Creative<a name="creative-linear"></a>

- `type: String`
- `duration: Number`
- `skipDelay: Number|null`
- `mediaFiles: Array<Object>` [go to object](#mediafile)
- `mezzanine: Object<Object>` [go to object](#mezzanine)
- `videoClickThroughURLTemplate: String|null`
- `videoClickTrackingURLTemplates: Array<String>`
- `videoCustomClickURLTemplates: Array<String>`
- `adParameters: String|null`
- `icons: Array<Object>` [go to object](#icon)
- `trackingEvents: Object`

## CreativeNonLinear *extends* Creative<a name="creative-non-linear"></a>

- `type: String`
- `variations: Array<Object>` [go to object](#non-linear-ad)
- `trackingEvents: Object`

## CreativeCompanion *extends* Creative<a name="creative-companion"></a>

- `type: String`
- `required: String|null`
- `variations: Array<Object>` [go to object](#companion-ad)

## MediaFile<a name="mediafile"></a>

- `id: String|null`
- `fileURL: String|null`
- `deliveryType: String`
- `mimeType: String|null`
- `code: String|null`
- `bitrate: Number`
- `minBitrate: Number`
- `maxBitrate: Number`
- `width: Number`
- `height: Number`
- `apiFramework: String|null`
- `scalable: Boolean|null`
- `maintainAspectRatio: Boolean|null`

## Mezzanine<a name="mezzanine"></a>

- `delivery: String` Either "progressive" for progressive download protocols (such as HTTP) or "streaming" for streaming protocols
- `type: String` MIME type for the file container. Popular MIME types include, but are not limited to "video/mp4" for MP4, "audio/mpeg" and "audio/aac" for audio ads
- `width: Number`
- `height: Number`
- `codec: String|null` The codec used to encode the file which can take values as specified by RFC 4281: http://tools.ietf.org/html/rfc4281
- `id: String|null`
- `fileSize: Number|null`
- `mediaType: String|null` Type of media file (3D / 360 / etc). Optional. Default value = 2D
- `fileURL: String|null`

## NonLinearAd<a name="non-linear-ad"></a>

- `id: String|null`
- `width: Number`
- `height: Number`
- `expandedWidth: Number`
- `expandedHeight: Number`
- `scalable: Boolean`
- `maintainAspectRatio: Boolean`
- `minSuggestedDuration: Number`
- `apiFramework: String`
- `type: String|null`
- `staticResource: String|null`
- `htmlResource: String|null`
- `iframeResource: String|null`
- `nonlinearClickThroughURLTemplate: String|null`
- `nonlinearClickTrackingURLTemplates: Array<Object>`
- `adParameters: String|null`

## CompanionAd<a name="companion-ad"></a>

- `id: String|null`
- `width: Number`
- `height: Number`
- `assetWidth: Number|null`
- `assetHeight: Number|null`
- `expandedWidth: Number|null`
- `expandedHeight: Number|null`
- `apiFramework: String|null`
- `adSlotID: String|null`
- `pxratio: String|'1'`
- `renderingMode: String|'default'`
- `staticResources: Array<{ url: String, creativeType: String|null }>`
- `htmlResources: Array<String>`
- `iframeResources: Array<String>`
- `altText: String|null`
- `companionClickThroughURLTemplate: String|null`
- `companionClickTrackingURLTemplates: Array<Object>`
- `trackingEvents: Object`
- `adParameters: String|null`
- `xmlEncoded: Boolean|null`

## Icon<a name="icon"></a>

- `program: String|null`
- `height: Number`
- `width: Number`
- `xPosition: Number`
- `yPosition: Number`
- `apiFramework: String|null`
- `offset: String|null`
- `duration: Number`
- `type: String|null`
- `pxratio: String|'1'`
- `staticResource: String|null`
- `htmlResource: String|null`
- `iframeResource: String|null`
- `iconClickThroughURLTemplate: String|null`
- `iconClickTrackingURLTemplates: Array<Object>`
- `iconViewTrackingURLTemplate: String|null`

## Extension<a name="extension"></a>

- `name: String|null`
- `value: any`
- `attributes: Object`
- `children: Array<Extension>`
- `isEmpty(): Boolean` Returns true when none of these attributes have a value

## AdVerification<a name="ad-verification"></a>

- `apiFramework: String|null` The name of the API framework used to execute the AdVerification code
- `browserOptional: Boolean` If *true*, this resource is optimized and able to execute in an environment without DOM and other browser built-ins (e.g. iOS' JavaScriptCore).
- `parameters: String|null` Metadata about the current impression
- `resource: String|null` URI to the JavaScript file used to collect verification data
- `vendor: String|null` An identifier for the verification vendor
