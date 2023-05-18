const math = {};

/**
 * Function to get linear interpolation value
 * @param {number} a - first value of range
 * @param {number} b - last value of range
 * @param {number} t - scaling parameter between 0 to 1 (0 to 100%)
 * @returns {number} when t = 0, it will return a , when t = 0.5, it will return medium value of a and b
 */
math.lerp = (a, b, t) => {
  return a + (b - a) * t;
};

/**
 * Inverse linear interpolation value. It return value having 0 to 1 depending on the current value 'v'
 * @param {number} a - first value of range
 * @param {number} b - last value of range
 * @param {number} v - current value in range
 * @returns {number} value of 0 to 1
 */
math.invLerp = (a, b, v) => {
  return (v - a) / (b - a);
};

/**
 * Remapping value from old range (oldA, oldB) to new range (newA, newB)
 * @param {number} oldA - first value of old range
 * @param {number} oldB - last value of old range
 * @param {number} newA - first value of new range
 * @param {number} newB - last value of new range
 * @param {number} v - current value in old range
 * @returns
 */
math.remap = (oldA, oldB, newA, newB, v) => {
  return math.lerp(newA, newB, math.invLerp(oldA, oldB, v));
};

/**
 *
 * @param {object{left:number, right:number, top:number, bottom:number}} oldBounds
 * @param {object{left:number, right:number, top:number, bottom:number}} newBouns
 * @param {[number, number]} point
 * @returns point remapped
 */
math.remapPoint = (oldBounds, newBouns, point) => {
  return [
    math.remap(
      oldBounds.left,
      oldBounds.right,
      newBouns.left,
      newBouns.right,
      point[0]
    ),
    math.remap(
      oldBounds.top,
      oldBounds.bottom,
      newBouns.top,
      newBouns.bottom,
      point[1]
    ),
  ];
};

/**
 * Formatting number value to have fixed floating point
 * @param {number} n - given number
 * @param {number} dec - number of decimal. default 0
 */
math.formatNumber = (n, dec = 0) => {
  return n.toFixed(dec);
};
