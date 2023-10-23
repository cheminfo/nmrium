/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  useState,
  Children,
  useMemo,
  useEffect,
  useCallback,
  memo,
  CSSProperties,
  ReactElement,
} from 'react';
import { FaAngleLeft } from 'react-icons/fa';
import { useMeasure } from 'react-use';

interface ArrowProps {
  direction: 'right' | 'left';
  onClick: () => void;
  style?: CSSProperties;
}

function Arrow({ direction, onClick, style = {} }: ArrowProps) {
  return (
    <div
      onClick={onClick}
      css={css`
        display: inline-flex;
        height: 40px;
        width: 40px;
        justify-content: center;
        background: white;
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
          transform: translateX(${direction === 'left' ? '-2' : '2'}px);

          &:focus {
            outline: 0;
          }
        }
      `}
      style={style}
    >
      <FaAngleLeft
        style={{ transform: `scaleX(${direction === 'right' ? '-1' : '1'})` }}
      />
    </div>
  );
}

const transition = 0.45;

interface NextPrevProps {
  children: ReactElement | ReactElement[];
  loop?: boolean;
  defaultIndex?: number;
  onChange?: (element: number) => void;
  style?: { arrowContainer?: CSSProperties };
}

function NextPrev(props: NextPrevProps) {
  const {
    children,
    loop = false,
    defaultIndex = 0,
    onChange = () => null,
    style = {},
  } = props;
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  const Sliders = useMemo(
    () =>
      Children.map(children, (child: ReactElement) => {
        return (
          <div
            key={child.key}
            css={css`
              width: ${width}px;
              height: 100%;
            `}
          >
            {child}
          </div>
        );
      }),
    [children, width],
  );

  const nextHandler = useCallback(() => {
    setActiveIndex((preActiveIndex) => {
      if (Sliders && preActiveIndex === Sliders.length - 1) {
        onChange(preActiveIndex);

        if (loop) {
          return 0;
        } else {
          return preActiveIndex;
        }
      }

      const nextIndex = preActiveIndex + 1;
      onChange(nextIndex);

      return nextIndex;
    });
  }, [Sliders, loop, onChange]);

  const prevHandler = useCallback(() => {
    setActiveIndex((preActiveIndex) => {
      if (preActiveIndex === 0) {
        onChange(preActiveIndex);
        if (loop) {
          return 0;
        } else {
          return preActiveIndex;
        }
      }
      const prevIndex = preActiveIndex - 1;

      onChange(prevIndex);

      return prevIndex;
    });
  }, [loop, onChange]);

  if (!width && !Sliders) return null;

  const translation = width * activeIndex;
  const slidersWidth = width * (Sliders ? Sliders.length : 1);

  return (
    <div
      css={css`
        position: relative;
        height: 100%;
        width: 100%;
        margin: 0 auto;
        overflow: hidden;
        display: block;
      `}
      ref={ref}
    >
      <div
        css={css`
          transform: translateX(-${translation}px);
          transition: transform ease-out ${transition}s;
          height: 100%;
          width: ${slidersWidth}px;
          display: flex;
        `}
      >
        {Sliders}
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          padding: '0 10px',
          justifyContent: 'space-between',
          width: '100%',
          display: 'flex',
          pointerEvents: 'none',
          ...style?.arrowContainer,
        }}
      >
        <Arrow
          direction="left"
          onClick={prevHandler}
          style={{
            ...(activeIndex === 0 && {
              visibility: 'hidden',
              pointerEvents: 'none',
            }),
          }}
        />
        <Arrow
          direction="right"
          onClick={nextHandler}
          style={{
            ...((!Sliders || activeIndex === Sliders.length - 1) && {
              visibility: 'hidden',
              pointerEvents: 'none',
            }),
          }}
        />
      </div>
    </div>
  );
}

export default memo(NextPrev);
