import { useCallback } from 'react';

import { useScaleChecked } from '../../context/ScaleContext';

import { useJGraph } from './JGraph';
import { CouplingLink } from './generateJGraphData';

interface JsCouplingLinksProps {
  links: CouplingLink[];
}

export default function JsCouplingLinks(props: JsCouplingLinksProps) {
  const { links } = props;
  const { scaleX } = useScaleChecked();
  const { scaleY, maxValue } = useJGraph();
  const generatePath = useCallback(
    (link: CouplingLink): string => {
      /**
       * We get the first and last only to have straight line because couplings constant are difference
       */

      const { from, to, couplings } = link; // first coupling
      let paths: string[] = [];
      for (const coupling of couplings) {
        paths.push(
          `M${scaleX()(from)},${scaleY(coupling.coupling)} L${scaleX()(
            to,
          )},${scaleY(coupling.coupling)}`,
        );
      }
      return paths.join(' ');
    },
    [scaleX, scaleY],
  );

  return (
    <g className="js-coupling-links">
      {links.map((link) => {
        return (
          <path
            key={`${link.from}${link.to}`}
            d={generatePath(link)}
            style={{
              stroke: `hsl(${
                (link.couplings[0].coupling * 360) / maxValue
              },100%,50%)`,
            }}
            strokeWidth="1"
          />
        );
      })}
    </g>
  );
}
