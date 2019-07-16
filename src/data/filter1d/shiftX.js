
/**
 * 
 * @param {Object} datum1d 
 * @param {number value  shift value
 */

export default function shiftX(data, shiftValue) {
  
  const result = data.map((val) => val + shiftValue);
  
  return result;
}
