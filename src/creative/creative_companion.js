import { Creative } from './creative';

export function CreativeCompanion(creativeAttributes = {}) {
  Creative.call(this, creativeAttributes);

  this.type = 'companion';
  this.required = null;
  this.variations = [];
}
