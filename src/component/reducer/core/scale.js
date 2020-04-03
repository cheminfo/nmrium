import { scaleLinear } from 'd3';

import { DISPLAYER_MODE } from './Constants';

function getXScale(spectrumId = null, state) {
  const { width, margin, xDomains, xDomain, mode } = state;
  const range =
    mode === 'RTL'
      ? [width - margin.right, margin.left]
      : [margin.left, width - margin.right];
  return scaleLinear(spectrumId ? xDomains[spectrumId] : xDomain, range);
}

/***
 * props {width,margin,xDomain}
 */
function get2DXScale(props) {
  const { width, margin, xDomain } = props;
  return scaleLinear(xDomain, [width - margin.right, margin.left]);
}

function getYScale(
  spectrumId = null,
  heightProps = null,
  isReverse = false,
  state,
) {
  const {
    height,
    margin,
    verticalAlign,
    yDomain,
    yDomains,
    displayerMode,
  } = state;

  const is2D = displayerMode === DISPLAYER_MODE.DM_2D;
  if (height && margin && verticalAlign && yDomain && yDomains) {
    const _height = heightProps
      ? heightProps
      : verticalAlign.flag && !verticalAlign.stacked
      ? height / 2
      : height;

    let domainY = [];
    if (spectrumId === null || yDomains[spectrumId] === undefined) {
      domainY = is2D ? yDomain : [0, yDomain[1]];
      //   domainY = [0, yDomain[1]];
    } else {
      domainY = is2D ? yDomains[spectrumId] : [0, yDomains[spectrumId][1]];

      //   domainY = [0, yDomains[spectrumId][1]];
    }
    return scaleLinear(
      domainY,
      isReverse
        ? [margin.top, _height - margin.bottom]
        : [_height - margin.bottom, margin.top],
    );
  } else {
    return null;
  }
}
/***
 * props {height,margin,yDomain}
 */
function get2DYScale(props) {
  const { height, margin, yDomain } = props;
  return scaleLinear(yDomain, [margin.top, height - margin.bottom]);
}

export { getXScale, getYScale, get2DXScale, get2DYScale };
