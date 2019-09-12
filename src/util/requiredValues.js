export const requiredValues = {
  VAST: {
    subElements: [], // Error or Ad
    attributes: []
  },
  Error: {
    subElements: [],
    attributes: []
  },
  Ad: {
    subElements: [], // Inline or Wrapper
    attributes: []
  },
  VASTAdTagURI: {
    // content as a String
    // Warn emit on ad_parser.js l.213
    subElements: [],
    attributes: []
  },
  Wrapper: {
    subElements: ['VASTAdTagURI', 'Impression'],
    attributes: []
  },
  BlockedAdCategories: {
    subElements: [],
    attributes: ['authority']
  },
  InLine: {
    subElements: [
      'AdSystem',
      'AdTitle',
      'Impression',
      'AdServingId',
      'Creatives'
    ],
    attributes: []
  },
  AdSystem: {
    subElements: [],
    attributes: []
  },
  AdTitle: {
    subElements: [],
    attributes: []
  },
  Impression: {
    subElements: [],
    attributes: []
  },
  AdServingId: {
    subElements: [],
    attributes: []
  },
  Category: {
    subElements: [],
    attributes: ['authority']
  },
  Pricing: {
    subElements: [],
    attributes: ['model', 'currency']
  },
  Verification: {
    subElements: [],
    attributes: ['vendor']
  },
  JavaScriptResource: {
    subElements: [],
    attributes: ['apiFramework', 'browserOptional']
  },
  ExecutableResource: {
    subElements: [],
    attributes: ['apiFramework', 'type']
  },
  Creatives: {
    subElements: ['Creative'],
    attributes: []
  },
  Creative: {
    subElements: [], // UniversalAdId not implemented yet so not required atm
    attributes: []
  },
  Linear: {
    subElements: ['MediaFiles', 'Duration'],
    attributes: []
  },
  Duration: {
    subElements: [],
    attributes: []
  },
  MediaFiles: {
    subElements: ['MediaFile'], // creative_linear_parser.js l.134
    attributes: []
  },
  MediaFile: {
    subElements: [],
    attributes: ['delivery', 'type', 'width', 'height']
  },
  Mezzanine: {
    subElements: [],
    attributes: ['delivery', 'type', 'width', 'height']
  },
  NonLinear: {
    subElements: [],
    attributes: ['width', 'height']
  },
  Companion: {
    subElements: [],
    attributes: ['width', 'height']
  },
  StaticResource: {
    subElements: [],
    attributes: ['creativeType']
  },
  Icons: {
    subElements: ['Icon'],
    attributes: []
  }
};
