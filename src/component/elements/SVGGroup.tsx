import type { ReactElement, SVGAttributes } from 'react';
import { Children, useLayoutEffect, useRef } from 'react';

interface SVGGroupProps extends SVGAttributes<SVGElement> {
  children: ReactElement | ReactElement[];
  direction?: 'row' | 'column';
  space?: number;
}

export function SVGGroup(props: SVGGroupProps) {
  const elementsRef = useRef<SVGGraphicsElement[]>([]);
  const { children, direction = 'row', space = 0, ...resProps } = props;

  useLayoutEffect(() => {
    const elements = elementsRef.current;

    if (!elements) {
      return;
    }

    let shift = 0;

    for (const element of elements) {
      if (!element) {
        continue;
      }

      const boundary = element.getBBox();
      if (direction === 'row') {
        element.setAttribute('transform', `translate(${shift} 0)`);
        shift += boundary.width + space;
      } else {
        element.setAttribute('transform', `translate(0 ${shift})`);
        shift += boundary.height + space;
      }
    }
  });

  const items = Children.toArray(children);

  return (
    <g {...resProps}>
      {Children.map(items, (child, index) => {
        return (
          <g
            // eslint-disable-next-line @eslint-react/no-array-index-key
            key={index}
            ref={(ref) => {
              if (ref) {
                elementsRef.current[index] = ref;
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
