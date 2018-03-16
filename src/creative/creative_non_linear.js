import { Creative } from './creative';

export class CreativeNonLinear extends Creative {
  constructor(creativeAttributes = {}) {
    super(creativeAttributes);

    this.type = 'nonlinear';
    this.variations = [];
  }
}
