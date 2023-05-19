const math = {};

math.equals = (p1, p2) => {
  return p1[0] == p2[0] && p1[1] == p2[1];
};

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
 * Add p2 to p1
 * @param {[number, number]} p1 - x1, y1
 * @param {[number, number]} p2 - x2, y2
 * @returns [x,y] (x : x1 + x2, y : y1 + y2)
 */
math.add = (p1, p2) => {
  return [p1[0] + p2[0], p1[1] + p2[1]];
};

/**
 * Subtract p2 from p1
 * @param {[number, number]} p1 - x1, y1
 * @param {[number, number]} p2 - x2, y2
 * @returns [x,y] (x : x1 - x2, y : y1 - y2)
 */
math.subtract = (p1, p2) => {
  return [p1[0] - p2[0], p1[1] - p2[1]];
};

/**
 * Calculating scaled values
 * @param {[number, number]} p
 * @param {number} scaler
 * @returns [p[0] * scaler, p[1] * scalder]
 */
math.scale = (p, scaler) => {
  return [p[0] * scaler, p[1] * scaler];
};

/**
 * Get euclidian distance between p1 and p2
 * @param {[number, number]} p1
 * @param {[number, number]} p2
 * @returns
 */
math.distance = (p1, p2) => {
  return Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2);
};

/**
 * Formatting number value to have fixed floating point
 * @param {number} n - given number
 * @param {number} dec - number of decimal. default 0
 */
math.formatNumber = (n, dec = 0) => {
  return n.toFixed(dec);
};

/**
 * Find the nearest points from loc and return the index in the points list
 * @param {[number, number]} loc
 * @param {[[number,number]]} points
 * @returns [number, number]
 */
math.getNearest = (loc, points) => {
  let minDist = Number.MAX_SAFE_INTEGER;
  let nearestIndex = 0;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const d = math.distance(loc, point);

    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }

  return nearestIndex;
};
