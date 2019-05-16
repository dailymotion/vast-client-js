// This mock module is loaded in stead of the original NodeURLHandler module
// when bundling the library for environments which are not node.
// This allows us to avoid bundling useless node components and have a smaller build.
function get(url, options, cb) {
  cb(
    new Error('Please bundle the library for node to use the node urlHandler')
  );
}

export const nodeURLHandler = {
  get
};
