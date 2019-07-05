export default function baseline(data, options = {}) {
  let x = data.x.slice(0);
  let re = data.re.map((re) => re * re);
  let im = data.im.map((im) => im * im);
  return {
    x,
    re,
    im,
  };
}
