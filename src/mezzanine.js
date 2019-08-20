export class Mezzanine {
    constructor () {
      this.id = null;
      this.fileURL = null;
      this.delivery = null;
      this.codec = null;
      this.type = null;
      this.width = 0;
      this.height = 0;
      this.fileSize = 0;
      this.mediaType = '2D';

      this.mandatoryFields = ['delivery', 'type', 'width', 'height']
    }

  validate () {
    return !this.mandatoryFields.some((name) => {
      return this[name] === null || this[name] === 0;
    });
  }

}
