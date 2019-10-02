import { Creative } from './creative';

export function CreativeNonLinear(creativeAttributes = {}) {
  Creative.call(this, creativeAttributes);

  this.type = 'nonlinear';
  this.variations = [];
  this.trackingEvents = {};
}
