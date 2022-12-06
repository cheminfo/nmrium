import { VerticalAlign, VerticalAlignment } from '../../reducer/Reducer';

export default function getVerticalShift(
  verticalAlign: VerticalAlign,
  option: { index?: number; align?: VerticalAlignment },
) {
  const { index = 1, align = 'stack' } = option || {
    index: 1,
    align: 'stack',
  };
  return verticalAlign.align === align
    ? index * verticalAlign.verticalShift
    : 0;
}
