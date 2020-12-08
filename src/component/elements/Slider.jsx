/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import { useState, Children, useMemo, useEffect, useCallback } from 'react';
import { FaAngleLeft } from 'react-icons/fa';
import { useMeasure } from 'react-use';

const Arrow = ({ direction, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    css={css`
      display: flex;
      position: absolute;
      top: 50%;
      ${direction === 'right' ? `right: 25px` : `left: 25px`};
      height: 50px;
      width: 50px;
      justify-content: center;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      align-items: center;
      border: none;
      transition: transform ease-in 0.1s;
      &:hover {
        transform: scale(1.1);
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
  </button>
);

const SliderCSS = css`
  position: relative;
  height: 100vh;
  width: 100vw;
  margin: 0 auto;
  overflow: hidden;
`;

const Slider = ({
  children,
  loop = false,
  defaultIndex = 1,
  onChange = () => null,
}) => {
  const [ref, { width }] = useMeasure();
  const [{ translate, transition, activeIndex }, setSlide] = useState({
    activeIndex: defaultIndex,
    translate: width * defaultIndex,
    transition: 0.45,
  });

  useEffect(() => {
    setSlide((preState) => ({
      ...preState,
      translate: activeIndex * width,
    }));
  }, [activeIndex, width]);

  const Sliders = useMemo(
    () =>
      Children.map(children, (child) => {
        return (
          <div
            key={child.key}
            css={css`
              width: 100%;
              height: 100%;
            `}
          >
            {child}
          </div>
        );
      }),
    [children],
  );

  const nextHandler = useCallback(() => {
    setSlide((preState) => {
      if (preState.activeIndex === Sliders.length - 1) {
        onChange(preState.activeIndex - 1);

        if (loop) {
          return { ...preState, translate: 0, activeIndex: 0 };
        } else {
          return preState;
        }
      }
      return {
        ...preState,
        activeIndex: preState.activeIndex + 1,
        translate: (preState.activeIndex + 1) * width,
      };
    });
  }, [Sliders.length, loop, onChange, width]);

  const prevHandler = useCallback(() => {
    setSlide((preState) => {
      if (preState.activeIndex === 0) {
        onChange(preState.activeIndex);
        if (loop) {
          return { ...preState, translate: 0, activeIndex: 0 };
        } else {
          return preState;
        }
      }

      onChange(preState.activeIndex - 1);

      return {
        ...preState,
        activeIndex: preState.activeIndex - 1,
        translate: (preState.activeIndex - 1) * width,
      };
    });
  }, [loop, onChange, width]);

  if (!width && !Sliders) return null;

  return (
    <div css={SliderCSS} ref={ref}>
      <div
        className="sliderContent"
        css={css`
          transform: translateX(-${translate}px);
          transition: transform ease-out ${transition}s;
          height: 100%;
          width: ${width * Sliders.length}px;
          display: flex;
        `}
      >
        {Sliders}
      </div>

      <Arrow direction="left" onClick={prevHandler} />
      <Arrow direction="right" onClick={nextHandler} />
    </div>
  );
};

Slider.defaultProps = {
  loop: false,
  defaultIndex: 0,
  onChange: () => null,
};
export default Slider;
