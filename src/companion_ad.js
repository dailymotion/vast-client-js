export function createCompanionAd(creativeAttributes = {}) {
  return {
    id: creativeAttributes.id || null,
    adType: 'companionAd',
    width: creativeAttributes.width || 0,
    height: creativeAttributes.height || 0,
    assetWidth: creativeAttributes.assetWidth || null,
    assetHeight: creativeAttributes.assetHeight || null,
    expandedWidth: creativeAttributes.expandedWidth || null,
    expandedHeight: creativeAttributes.expandedHeight || null,
    apiFramework: creativeAttributes.apiFramework || null,
    adSlotID: creativeAttributes.adSlotID || null,
    staticResources: [],
    htmlResources: [],
    iframeResources: [],
    adParameters: null,
    xmlEncoded: null,
    altText: null,
    companionClickThroughURLTemplate: null,
    companionClickTrackingURLTemplates: [],
    trackingEvents: {}
  };
}

export function isCompanionAd(companionAd) {
  return companionAd.adType === 'companionAd';
}
