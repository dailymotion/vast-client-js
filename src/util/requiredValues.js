export const requiredValues = {
  Wrapper: {
    subElements: ['VASTAdTagURI', 'Impression']
  },
  BlockedAdCategories: {
    attributes: ['authority']
  },
  InLine: {
    subElements: [
      'AdSystem',
      'AdTitle',
      'Impression',
      'AdServingId',
      'Creatives'
    ]
  },
  Category: {
    attributes: ['authority']
  },
  Pricing: {
    attributes: ['model', 'currency']
  },
  Verification: {
    attributes: ['vendor']
  },
  UniversalAdId: {
    attributes: ['idRegistry']
  },
  JavaScriptResource: {
    attributes: ['apiFramework', 'browserOptional']
  },
  ExecutableResource: {
    attributes: ['apiFramework', 'type']
  },
  Creatives: {
    subElements: ['Creative']
  },
  Linear: {
    subElements: ['MediaFiles', 'Duration']
  },
  MediaFiles: {
    subElements: ['MediaFile']
  },
  MediaFile: {
    attributes: ['delivery', 'type', 'width', 'height']
  },
  Mezzanine: {
    attributes: ['delivery', 'type', 'width', 'height']
  },
  NonLinear: {
    oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
    attributes: ['width', 'height']
  },
  Companion: {
    oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
    attributes: ['width', 'height']
  },
  StaticResource: {
    attributes: ['creativeType']
  },
  Icons: {
    subElements: ['Icon']
  },
  Icon: {
    oneOfinLineResources: ['StaticResource', 'IFrameResource', 'HTMLResource']
  }
};
