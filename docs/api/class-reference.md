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
- `extensions: Array<AdExtension>`

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
