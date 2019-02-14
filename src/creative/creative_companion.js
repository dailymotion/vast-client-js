import { Creative } from './creative';

export class CreativeCompanion extends Creative {
  constructor(creativeAttributes = {}) {
    super(creativeAttributes);

    this.type = 'companion';
    this.required = null;
    this.variations = [];
  }
}
