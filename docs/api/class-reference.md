# Class reference

## VASTResponse

This class represents a parsed VAST response.

- `ads: Array<Ad>` [go to class](#ad)
- `errorURLTemplates: Array<String>`

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

## Creative<a name="creative"></a>

This class represents a generic Creative. It's used as a parent class for more specific creative implementations.

- `id: String|null`
- `adId: String|null`
- `sequence: Number|null`
- `apiFramework: String|null`
- `trackingEvents: Object`

## CreativeLinear *extends* Creative<a name="creative-linear"></a>

- `type: String`
- `duration: Number`
- `skipDelay: Number|null`
- `mediaFiles: Array<MediaFile>` [go to class](#mediafile)
- `videoClickThroughURLTemplate: String|null`
- `videoClickTrackingURLTemplates: Array<String>`
- `videoCustomClickURLTemplates: Array<String>`
- `adParameters: String|null`
- `icons: Array<Icon>` [go to class](#icon)

## CreativeNonLinear *extends* Creative<a name="creative-non-linear"></a>

- `type: String`
- `variations: Array<NonLinearAd>` [go to class](#non-linear-ad)

## CreativeCompanion *extends* Creative<a name="creative-companion"></a>

- `type: String`
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
- `type: String|null`
- `staticResource: String|null`
- `htmlResource: String|null`
- `iframeResource: String|null`
- `altText: String|null`
- `nonlinearClickThroughURLTemplate: String|null`
- `nonlinearClickTrackingURLTemplates: Array<String>`
- `trackingEvents: Object`

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

- `attributes: Object`
- `children: Array<AdExtensionChild>` [go to class](#ad-extension-child)
- `isEmpty(): Boolean` Returns true when none of these attributes have a value

## AdExtensionChild<a name="ad-extension-child"></a>

- `name: String|null`
- `value: any`
- `attributes: Object`
- `children: Array<AdExtensionChild>`
- `isEmpty(): Boolean` Returns true when none of these attributes have a value
