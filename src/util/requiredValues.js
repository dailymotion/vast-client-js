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
    inLineRessources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
    attributes: ['width', 'height']
  },
  Companion: {
    inLineRessources: ['StaticResource', 'IFrameResource', 'HTMLResource'],
    attributes: ['width', 'height']
  },
  StaticResource: {
    attributes: ['creativeType']
  },
  Icons: {
    subElements: ['Icon']
  },
  Icon: {
    inLineRessources: ['StaticResource', 'IFrameResource', 'HTMLResource']
  }
};
