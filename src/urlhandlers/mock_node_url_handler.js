export class NodeURLHandler {
  get(url, options, cb) {
    cb(
      new Error('Please bundle the library for node to use the node urlHandler')
    );
  }
}
