export function createAd(adAttributes = {}) {
  return {
    id: adAttributes.id || null,
    sequence: adAttributes.sequence || null,
    adType: adAttributes.adType || null,
    adServingId: null,
    categories: [],
    expires: null,
    viewableImpression: {},
    system: null,
    title: null,
    description: null,
    advertiser: null,
    pricing: null,
    survey: null,
    errorURLTemplates: [],
    impressionURLTemplates: [],
    creatives: [],
    extensions: [],
    adVerifications: []
  };
}
