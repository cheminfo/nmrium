export default function baseline(data) {
  let x = data.x.slice(0);
  let re = data.re.map((real) => real * re);
  let im = data.im.map((imaginary) => imaginary * im);
  return {
    x,
    re,
    im,
  };
}
