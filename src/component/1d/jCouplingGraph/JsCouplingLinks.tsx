import { useCallback } from 'react';

import { useScaleChecked } from '../../context/ScaleContext';

import { useJGraph } from './JGraph';
import { CouplingLink, CouplingLinks } from './generateJGraphData';

interface JsCouplingLinksProps {
  links: CouplingLinks;
}

export default function JsCouplingLinks(props: JsCouplingLinksProps) {
  const { links } = props;
  const { scaleX } = useScaleChecked();
  const { scaleY } = useJGraph();

  const generatePath = useCallback(
    (links: CouplingLink[]): string => {
      const { x, y } = links[0];
      return links.slice(1).reduce((path, link) => {
        path = path.concat(`L${scaleX()(link.x)},${scaleY(link.y)} `);
        return path;
      }, `M${scaleX()(x)},${scaleY(y)} `);
    },
    [scaleX, scaleY],
  );

  return (
    <g className="js-coupling-links">
      {Object.entries(links)
        .filter(([, links]) => links.length > 1)
        .map(([couplingKey, links]) => {
          return (
            <path
              strokeDasharray="4 2"
              key={couplingKey}
              d={generatePath(links)}
              stroke="black"
              strokeWidth="1"
            />
          );
        })}
    </g>
  );
}
