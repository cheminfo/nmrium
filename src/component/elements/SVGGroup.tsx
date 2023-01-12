import {
  Children,
  cloneElement,
  ReactNode,
  useLayoutEffect,
  useRef,
  SVGAttributes,
} from 'react';

interface SVGGroupProps extends SVGAttributes<SVGElement> {
  children: ReactNode;
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

  return (
    <g {...resProps}>
      {Children.toArray(children).map((child: any, indx) => {
        return cloneElement(child, {
          ref: (ref: SVGElement) => {
            elementsRefs.current[indx] = ref;
          },
        });
      })}
    </g>
  );
}
