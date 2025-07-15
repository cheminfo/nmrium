import styled from '@emotion/styled';
import type { CSSProperties, ReactElement } from 'react';
import { Children } from 'react';
import { useResizeObserver } from 'react-d3-utils';
import { FaAngleLeft } from 'react-icons/fa';

type Direction = 'right' | 'left';

interface ArrowProps {
  direction: Direction;
  onClick: () => void;
  style?: CSSProperties;
}

const ArrowButton = styled.div<{
  direction: Direction;
}>`
  display: inline-flex;
  height: 40px;
  width: 40px;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  align-items: center;
  border: none;
  transition: transform ease-in 0.1s;
  background-color: #f7f7f7;
  pointer-events: auto;

  &:hover {
    transform: scale(1.1);
    background-color: #607d8b !important;
    color: white;
  }

  img {
    transform: translateX(
      ${(props) => (props.direction === 'left' ? '-2' : '2')}px
    );

    &:focus {
      outline: 0;
    }
  }
`;

function Arrow({ direction, onClick, style = {} }: ArrowProps) {
  return (
    <ArrowButton onClick={onClick} direction={direction} style={style}>
      <FaAngleLeft
        style={{ transform: `scaleX(${direction === 'right' ? '-1' : '1'})` }}
      />
    </ArrowButton>
  );
}

const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  display: block;
`;
const TransformController = styled.div<{
  translation: number;
  slidersWidth: number;
}>(
  ({ translation, slidersWidth }) => `transform: translateX(-${translation}px);
  transition: transform ease-out ${transition}s;
  height: 100%;
  width: ${slidersWidth}px;
  display: flex;
`,
);

const Content = styled.div<{ width: number }>`
  width: ${(props) => props.width}px;
  flex: 1;
`;

const transition = 0.45;

interface NextPrevProps {
  children: ReactElement | ReactElement[];
  loop?: boolean;
  index: number;
  onChange: (element: number) => void;
  style?: { arrowContainer?: CSSProperties };
}

export function NextPrev(props: NextPrevProps) {
  const {
    children,
    loop = false,
    index = 0,
    onChange = () => null,
    style = {},
  } = props;
  const [ref, { width } = { width: 0 }] = useResizeObserver();
  const slidersCount = Children.count(children);
  const lastIndex = slidersCount > 0 ? slidersCount - 1 : 0;
  const activeIndex = Math.min(index, lastIndex);

  function nextHandler() {
    if (index === lastIndex) {
      onChange(index);

      if (loop) {
        return 0;
      } else {
        return index;
      }
    }

    const nextIndex = index + 1;
    onChange(nextIndex);
  }

  function prevHandler() {
    if (index === 0) {
      onChange(index);
      if (loop) {
        return 0;
      } else {
        return index;
      }
    }
    const prevIndex = index - 1;

    onChange(prevIndex);
  }

  if (!width && slidersCount === 0) return null;

  const translation = width * activeIndex;
  const slidersWidth = width * slidersCount;

  return (
    <Container ref={ref}>
      <TransformController
        translation={translation}
        slidersWidth={slidersWidth}
      >
        {Children.map(children, (child: ReactElement) => {
          return (
            <Content key={child.key} width={width}>
              {child}
            </Content>
          );
        })}
      </TransformController>
      <SliderControllers
        onNext={nextHandler}
        onPrevious={prevHandler}
        activeIndex={activeIndex}
        lastIndex={lastIndex}
        style={style?.arrowContainer}
      />
    </Container>
  );
}

interface SliderControllersProps {
  onNext: ArrowProps['onClick'];
  onPrevious: ArrowProps['onClick'];
  activeIndex: number;
  lastIndex: number;
  style?: CSSProperties;
}

function SliderControllers(props: SliderControllersProps) {
  const { onNext, onPrevious, activeIndex, lastIndex, style } = props;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        padding: '0 10px',
        justifyContent: 'space-between',
        width: '100%',
        display: 'flex',
        pointerEvents: 'none',
        ...style,
      }}
    >
      <Arrow
        direction="left"
        onClick={onPrevious}
        style={{
          ...(activeIndex === 0 && {
            visibility: 'hidden',
            pointerEvents: 'none',
          }),
        }}
      />
      <Arrow
        direction="right"
        onClick={onNext}
        style={{
          ...(activeIndex === lastIndex && {
            visibility: 'hidden',
            pointerEvents: 'none',
          }),
        }}
      />
    </div>
  );
}
