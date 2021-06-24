/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import {
  ReactNode,
  useState,
  Children,
  useMemo,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { FaAngleLeft } from 'react-icons/fa';
import { useMeasure } from 'react-use';

interface ArrowProps {
  direction: 'right' | 'left';
  onClick: () => void;
}

function Arrow({ direction, onClick }: ArrowProps) {
  return (
    <div
      onClick={onClick}
      css={css`
        display: flex;
        position: absolute;
        top: calc(50% - 20px);
        ${direction === 'right' ? `right: 25px` : `left: 25px`};
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
    >
      <FaAngleLeft
        style={{ transform: `scaleX(${direction === 'right' ? '-1' : '1'})` }}
      />
    </div>
  );
}

const transition = 0.45;

interface NextPrevProps {
  children: ReactNode;
  loop?: boolean;
  defaultIndex?: number;
  onChange?: (element: number) => void;
}

function NextPrev({
  children,
  loop = false,
  defaultIndex = 0,
  onChange = () => null,
}: NextPrevProps) {
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  const Sliders = useMemo(
    () =>
      Children.map(children, (child: any) => {
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
          transform: translateX(-${width * activeIndex}px);
          transition: transform ease-out ${transition}s;
          height: 100%;
          width: ${width * (Sliders ? Sliders.length : 1)}px;
          display: flex;
        `}
      >
        {Sliders}
      </div>

      {activeIndex !== 0 && <Arrow direction="left" onClick={prevHandler} />}
      {Sliders && activeIndex !== Sliders.length - 1 && (
        <Arrow direction="right" onClick={nextHandler} />
      )}
    </div>
  );
}

export default memo(NextPrev);
