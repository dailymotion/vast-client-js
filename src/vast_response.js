export function createVASTResponse({ ads, errorURLTemplates, version }) {
  return {
    ads: ads || [],
    errorURLTemplates: errorURLTemplates || [],
    version: version || null
  };
}

export function isVASTResponse(response) {
  return (
    response.hasOwnProperty('ads') &&
    response.hasOwnProperty('errorURLTemplates') &&
    response.hasOwnProperty('version')
  );
}
