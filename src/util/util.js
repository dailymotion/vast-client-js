function track(URLTemplates, variables, options) {
  const URLs = resolveURLTemplates(URLTemplates, variables, options);

  URLs.forEach(URL => {
    if (typeof window !== 'undefined' && window !== null) {
      const i = new Image();
      i.src = URL;
    }
  });
}

/**
 * Replace the provided URLTemplates with the given values
 *
 * @param {Array} URLTemplates - An array of tracking url templates.
 * @param {Object} [variables={}] - An optional Object of parameters to be used in the tracking calls.
 * @param {Object} [options={}] - An optional Object of options to be used in the tracking calls.
 */
function resolveURLTemplates(URLTemplates, variables = {}, options = {}) {
  const URLs = [];

  // Encode String variables, when given
  if (variables['ASSETURI']) {
    variables['ASSETURI'] = encodeURIComponentRFC3986(variables['ASSETURI']);
  }
  if (variables['CONTENTPLAYHEAD']) {
    variables['CONTENTPLAYHEAD'] = encodeURIComponentRFC3986(
      variables['CONTENTPLAYHEAD']
    );
  }

  // Set default value for invalid ERRORCODE
  if (
    variables['ERRORCODE'] &&
    !options.isCustomCode &&
    !/^[0-9]{3}$/.test(variables['ERRORCODE'])
  ) {
    variables['ERRORCODE'] = 900;
  }

  // Calc random/time based macros
  variables['CACHEBUSTING'] = leftpad(
    Math.round(Math.random() * 1.0e8).toString()
  );
  variables['TIMESTAMP'] = encodeURIComponentRFC3986(new Date().toISOString());

  // RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
  variables['RANDOM'] = variables['random'] = variables['CACHEBUSTING'];

  for (const URLTemplateKey in URLTemplates) {
    let resolveURL = URLTemplates[URLTemplateKey];

    if (typeof resolveURL !== 'string') {
      continue;
    }

    for (const key in variables) {
      const value = variables[key];
      const macro1 = `[${key}]`;
      const macro2 = `%%${key}%%`;
      resolveURL = resolveURL.replace(macro1, value);
      resolveURL = resolveURL.replace(macro2, value);
    }
    URLs.push(resolveURL);
  }

  return URLs;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
function encodeURIComponentRFC3986(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    c => `%${c.charCodeAt(0).toString(16)}`
  );
}

function leftpad(str) {
  if (str.length < 8) {
    return (
      range(0, 8 - str.length, false)
        .map(() => '0')
        .join('') + str
    );
  }
  return str;
}

function range(left, right, inclusive) {
  const result = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;

  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    result.push(i);
  }
  return result;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function flatten(arr) {
  return arr.reduce((flat, toFlatten) => {
    return flat.concat(
      Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten
    );
  }, []);
}

/**
 * Joins two arrays without duplicates
 * @param {Array} arr1
 * @param {Array} arr2
 * @return {Array}
 */
function joinArrayUnique(arr1 = [], arr2 = []) {
  const firstArr = Array.isArray(arr1) ? arr1 : [];
  const secondArr = Array.isArray(arr2) ? arr2 : [];
  const arr = firstArr.concat(secondArr);

  return arr.reduce((res, val) => {
    if (res.indexOf(val) === -1) {
      res.push(val);
    }
    return res;
  }, []);
}

export const util = {
  track,
  resolveURLTemplates,
  encodeURIComponentRFC3986,
  leftpad,
  range,
  isNumeric,
  flatten,
  joinArrayUnique
};
