export function createAd() {
  return {
    id: null,
    sequence: null,
    system: null,
    title: null,
    description: null,
    advertiser: null,
    pricing: null,
    survey: null, // @deprecated in VAST 4.1
    errorURLTemplates: [],
    impressionURLTemplates: [],
    creatives: [],
    extensions: [],
    adVerifications: []
  };
}
