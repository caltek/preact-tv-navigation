/**
 * Chrome 38 Compatibility Utilities
 * Provides polyfills and workarounds for Chrome 38 specific issues
 */

// Polyfill for Object.assign (not available in Chrome 38)
if (!Object.assign) {
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    
    const to = Object(target);
    
    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];
      
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Polyfill for Array.from (not available in Chrome 38)
if (!Array.from) {
  Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
    const C = this;
    const items = Object(arrayLike);
    
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object - not null or undefined');
    }
    
    const mapFunction = mapFn ? mapFn : undefined;
    const T = thisArg;
    
    const len = parseInt(items.length) || 0;
    const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
    
    let k = 0;
    let kValue;
    
    while (k < len) {
      kValue = items[k];
      if (mapFunction) {
        A[k] = typeof T === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(T, kValue, k);
      } else {
        A[k] = kValue;
      }
      k += 1;
    }
    A.length = len;
    return A;
  };
}

// Polyfill for Array.find (not available in Chrome 38)
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate: any, _thisArg?: any) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    const list = Object(this);
    const length = parseInt(list.length) || 0;
    const context = arguments[1];
    let value;
    
    for (let i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(context, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

// Polyfill for Array.includes (not available in Chrome 38)
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement: any, fromIndex?: number) {
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }
    const O = Object(this);
    const len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    const n = parseInt(String(fromIndex)) || 0;
    let k = n >= 0 ? n : Math.max(len + n, 0);
    
    function sameValueZero(x: any, y: any) {
      return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
    }
    
    for (; k < len; k++) {
      if (sameValueZero(O[k], searchElement)) {
        return true;
      }
    }
    return false;
  };
}

// Polyfill for String.includes (not available in Chrome 38)
if (!String.prototype.includes) {
  String.prototype.includes = function(search: string, start?: number) {
    const startIndex = typeof start === 'number' ? start : 0;
    if (startIndex + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, startIndex) !== -1;
    }
  };
}

// Polyfill for String.startsWith (not available in Chrome 38)
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString: string, position?: number) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

// Polyfill for String.endsWith (not available in Chrome 38)
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString: string, length?: number) {
    if (length === undefined || length > this.length) {
      length = this.length;
    }
    return this.substring(length - searchString.length, length) === searchString;
  };
}

// Polyfill for Number.isNaN (not available in Chrome 38)
if (!Number.isNaN) {
  Number.isNaN = function(value: any) {
    return typeof value === 'number' && isNaN(value);
  };
}

// Polyfill for Number.isFinite (not available in Chrome 38)
if (!Number.isFinite) {
  Number.isFinite = function(value: any) {
    return typeof value === 'number' && isFinite(value);
  };
}

// Polyfill for Math.trunc (not available in Chrome 38)
if (!Math.trunc) {
  Math.trunc = function(x: number) {
    return x < 0 ? Math.ceil(x) : Math.floor(x);
  };
}

// Polyfill for Math.sign (not available in Chrome 38)
if (!Math.sign) {
  Math.sign = function(x: number) {
    x = +x; // convert to a number
    if (x === 0 || isNaN(x)) {
      return x;
    }
    return x > 0 ? 1 : -1;
  };
}

// Console logging helper for Chrome 38 debugging
export const chrome38Log = (message: string, data?: any) => {
  if (typeof console !== 'undefined' && console.log) {
    console.log(`[Chrome38] ${message}`, data || '');
  }
};

// Feature detection for Chrome 38
export const isChrome38 = () => {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent;
  return userAgent.includes('Chrome/38') || userAgent.includes('Chrome/37') || userAgent.includes('Chrome/36');
};

// CSS property compatibility helper
export const getCompatibleCSSProperty = (property: string, value: string) => {
  const chrome38Prefixes: { [key: string]: string } = {
    'display': '-webkit-box',
    'flexDirection': 'WebkitBoxOrient',
    'alignItems': 'WebkitBoxAlign',
    'justifyContent': 'WebkitBoxPack',
    'transition': 'WebkitTransition',
    'transform': 'WebkitTransform',
    'backfaceVisibility': 'WebkitBackfaceVisibility',
    'overflowScrolling': 'WebkitOverflowScrolling',
  };
  
  const result: { [key: string]: string } = {};
  
  // Add the standard property
  result[property] = value;
  
  // Add Chrome 38 prefix if available
  if (chrome38Prefixes[property]) {
    result[chrome38Prefixes[property]] = value;
  }
  
  return result;
};

// Scroll behavior compatibility
export const getCompatibleScrollBehavior = () => {
  if (isChrome38()) {
    return {
      WebkitOverflowScrolling: 'touch',
      overflowScrolling: 'touch',
    };
  }
  return {};
};
