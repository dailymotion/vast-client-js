# Class reference

## VASTResponse

This class represents a parsed VAST response.

- `ads: Array<Ad>`
- `errorURLTemplates: Array<String>`

## Ad

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
- `creatives: Array<Creative>`
- `extensions: Array<AdExtension>`

## Creative

This class represents a generic Creative. It's used as a parent class for more specific creative implementations.

- `id: String|null`
- `adId: String|null`
- `sequence: Number|null`
- `apiFramework: String|null`
- `trackingEvents: Object`
