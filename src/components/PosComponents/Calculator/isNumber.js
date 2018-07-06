export default function isNumber(item) {
  // return !!item.match(/[0-9]+/);
  return !isNaN(item - 0);
}
