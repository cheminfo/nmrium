import Numeral from 'numeral';

function FormatNumber(inputValue, format) {
  return Numeral(inputValue).format(format);
}

export default FormatNumber;
