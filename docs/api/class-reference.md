# Class reference

## VASTResponse

This class represents a parsed VAST response.

- `ads: Array<Ad>` [go to class](#ad)
- `errorURLTemplates: Array<String>`
- `version: String`

## Ad<a name="ad"></a>

This class represents a single parsed Ad

- `id: String|null`
- `sequence: Number|null`
- `system: String|null`
- `title: String|null`
- `description: String|null`
- `advertiser: String|null`
- `pricing: String|null`
- `survey: String|null`
- `errorURLTemplates: Array<String>`
- `impressionURLTemplates: Array<String>`
- `creatives: Array<Creative>` [go to class](#creative)
- `extensions: Array<AdExtension>` [go to class](#ad-extension)
- `adVerifications: Array<AdVerification>` [go to class](#ad-verification)

## Creative<a name="creative"></a>

This class represents a generic Creative. It's used as a parent class for more specific creative implementations.

- `id: String|null`
- `adId: String|null`
- `sequence: Number|null`
- `apiFramework: String|null`

## CreativeLinear *extends* Creative<a name="creative-linear"></a>

- `type: String`
- `duration: Number`
- `skipDelay: Number|null`
- `mediaFiles: Array<MediaFile>` [go to class](#mediafile)
- `mezzanine: Object<Mezzanine>` [go to class](#mezzanine)
- `videoClickThroughURLTemplate: String|null`
- `videoClickTrackingURLTemplates: Array<String>`
- `videoCustomClickURLTemplates: Array<String>`
- `adParameters: String|null`
- `icons: Array<Icon>` [go to class](#icon)
- `trackingEvents: Object`

## CreativeNonLinear *extends* Creative<a name="creative-non-linear"></a>

- `type: String`
- `variations: Array<NonLinearAd>` [go to class](#non-linear-ad)
- `trackingEvents: Object`

## CreativeCompanion *extends* Creative<a name="creative-companion"></a>

- `type: String`
- `required: String|null`
- `variations: Array<CompanionAd>` [go to class](#companion-ad)

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
- `nonlinearClickTrackingURLTemplates: Array<String>`
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
- `staticResources: Array<{ url: String, creativeType: String|null }>`
- `htmlResources: Array<String>`
- `iframeResources: Array<String>`
- `altText: String|null`
- `companionClickThroughURLTemplate: String|null`
- `companionClickTrackingURLTemplates: Array<String>`
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
- `staticResource: String|null`
- `htmlResource: String|null`
- `iframeResource: String|null`
- `iconClickThroughURLTemplate: String|null`
- `iconClickTrackingURLTemplates: Array<String>`
- `iconViewTrackingURLTemplate: String|null`

## AdExtension<a name="ad-extension"></a>
- `name: String|null`
- `value: any`
- `attributes: Object`
- `children: Array<AdExtension>`
- `isEmpty(): Boolean` Returns true when none of these attributes have a value

## AdVerification<a name="ad-verification"></a>
- `apiFramework: String|null` The name of the API framework used to execute the AdVerification code
- `browserOptional: Boolean` If *true*, this resource is optimized and able to execute in an environment without DOM and other browser built-ins (e.g. iOS' JavaScriptCore).
- `parameters: String|null` Metadata about the current impression
- `resource: String|null` URI to the JavaScript file used to collect verification data
- `vendor: String|null` An identifier for the verification vendor
