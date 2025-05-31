import type { SVGAttributes, ReactElement } from 'react';
import { Children, useLayoutEffect, useRef } from 'react';

interface SVGGroupProps extends SVGAttributes<SVGElement> {
  children: ReactElement | ReactElement[];
  direction?: 'row' | 'column';
  space?: number;
}

export function SVGGroup(props: SVGGroupProps) {
  const elementsRefs = useRef<SVGGraphicsElement[]>([]);
  const { children, direction = 'row', space = 0, ...resProps } = props;

  useLayoutEffect(() => {
    let shift = 0;
    const elements = elementsRefs.current;

    if (!elements) {
      return;
    }

    for (const element of elements) {
      if (element) {
        const boundary = element.getBBox();
        if (direction === 'row') {
          element.setAttribute('transform', `translate(${shift} 0)`);
          shift += boundary.width + space;
        } else {
          element.setAttribute('transform', `translate(0 ${shift})`);
          shift += boundary.height + space;
        }
      }
    }
  });

  const items = Children.toArray(children);

  return (
    <g {...resProps}>
      {Children.map(items, (child, index) => {
        return (
          <g
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}`}
            ref={(ref) => {
              if (ref) {
                elementsRefs.current[index] = ref;
              }
            }}
          >
            {child}
          </g>
        );
      })}
    </g>
  );
}
