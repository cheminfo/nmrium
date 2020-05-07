import Numeral from 'numeral';

function FormatNumber(inputValue, format, prefix = '', suffix = '') {
  return prefix + Numeral(inputValue).format(format) + suffix;
}

export default FormatNumber;
