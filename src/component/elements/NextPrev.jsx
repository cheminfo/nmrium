/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import {
  useState,
  Children,
  useMemo,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { FaAngleLeft } from 'react-icons/fa';
import { useMeasure } from 'react-use';

const Arrow = ({ direction, onClick }) => (
  <div
    onClick={onClick}
    css={css`
      display: flex;
      position: absolute;
      top: calc(50% - 18px);
      ${direction === 'right' ? `right: 25px` : `left: 25px`};
      height: 36px;
      width: 36px;
      justify-content: center;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      align-items: center;
      border: none;
      transition: transform ease-in 0.1s;
      &:hover {
        transform: scale(1.2);
        background-color: #607d8b;
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

const transition = 0.45;

const NextPrev = memo(({ children, loop, defaultIndex, onChange }) => {
  const [ref, { width }] = useMeasure();
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    setActiveIndex(defaultIndex);
  }, [defaultIndex]);

  const Sliders = useMemo(
    () =>
      Children.map(children, (child) => {
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
      if (preActiveIndex === Sliders.length - 1) {
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
  }, [Sliders.length, loop, onChange]);

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
      `}
      ref={ref}
    >
      <div
        css={css`
          transform: translateX(-${width * activeIndex}px);
          transition: transform ease-out ${transition}s;
          height: 100%;
          width: ${width * Sliders.length}px;
          display: flex;
        `}
      >
        {Sliders}
      </div>

      {activeIndex !== 0 && <Arrow direction="left" onClick={prevHandler} />}
      {activeIndex !== Sliders.length - 1 && (
        <Arrow direction="right" onClick={nextHandler} />
      )}
    </div>
  );
});

NextPrev.defaultProps = {
  loop: false,
  defaultIndex: 0,
  onChange: () => null,
};
export default NextPrev;
