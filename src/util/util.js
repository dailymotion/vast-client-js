function track(URLTemplates, variables) {
  const URLs = resolveURLTemplates(URLTemplates, variables);

  URLs.forEach(URL => {
    if (typeof window !== 'undefined' && window !== null) {
      const i = new Image();
      i.src = URL;
    }
  });
}

function resolveURLTemplates(URLTemplates, variables = {}) {
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
  if (variables['ERRORCODE'] && !/^[0-9]{3}$/.test(variables['ERRORCODE'])) {
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
  const range = [];
  const ascending = left < right;
  const end = !inclusive ? right : ascending ? right + 1 : right - 1;

  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
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

export const util = {
  track,
  resolveURLTemplates,
  encodeURIComponentRFC3986,
  leftpad,
  range,
  isNumeric,
  flatten
};
