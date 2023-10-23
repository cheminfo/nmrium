import {
  Children,
  useLayoutEffect,
  useRef,
  SVGAttributes,
  ReactElement,
} from 'react';

interface SVGGroupProps extends SVGAttributes<SVGElement> {
  children: ReactElement | ReactElement[];
  direction?: 'row' | 'column';
  space?: number;
}

export function SVGGroup(props: SVGGroupProps) {
  const elementsRefs = useRef<SVGElement[]>([]);
  const { children, direction = 'row', space = 0, ...resProps } = props;

  useLayoutEffect(() => {
    let shift = 0;
    if (elementsRefs) {
      for (const element of elementsRefs.current) {
        if (element) {
          const boundary = element.getBoundingClientRect();
          if (direction === 'row') {
            element.style.transform = `translate(${shift}px,0)`;
            shift += boundary.width + space;
          } else {
            element.style.transform = `translate(0,${shift}px)`;
            shift += boundary.height + space;
          }
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
            key={(child as ReactElement)?.key || `${index}`}
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
