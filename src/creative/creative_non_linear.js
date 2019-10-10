import { createCreative } from './creative';

export function createCreativeNonLinear(creativeAttributes = {}) {
  const { id, adId, sequence, apiFramework } = createCreative(
    creativeAttributes
  );
  return {
    id,
    adId,
    sequence,
    apiFramework,
    type: 'nonlinear',
    variations: [],
    trackingEvents: {}
  };
}
