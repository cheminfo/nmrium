/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { memo, useCallback } from 'react';

import { useDispatch } from '../../../context/DispatchContext';
import { CHANGE_SPECTRUM_SETTING } from '../../../reducer/types/Types';

import Spectrum1DSetting from './Spectrum1DSetting';
import Spectrum2DSetting from './Spectrum2DSetting';

const style = css`
  position: fixed;
  z-index: 999999999;
  display: flex;
  flex-direction: row-reverse;
  border-radius: 4px;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.15) 0px 8px 16px;
    overflow: auto;
    height: 350px;


  .sketch-picker {
    border-radius: none !important;
    box-shadow: none !important;
  }

  .sketch-picker > div:first-of-type {
    // padding-bottom: 40% !important;
  }
  .horizontal-slider {
    width: 80%;
    height: 15px;
  }

  .thumb {
    height: 15px;
    line-height: 15px;
    width: 20px;
    text-align: center;
    color: black;
    border-radius: 5px;
    cursor: grab;
    font-size: 10px;
    background-image: -webkit-linear-gradient(top, #f4f1ee, #fff);
    background-image: linear-gradient(top, #f4f1ee, #fff);
    // box-shadow: 0px 8px 10px 0px rgba(0, 0, 0, 0.3), inset 0px 4px 1px 1px white,
      // inset 0px -3px 1px 1px rgba(204, 198, 197, 0.5);
  }

  .track {
    top: 0;
    bottom: 0;
    background: #eaeaea;
    border-radius: 999px;
    border-radius: 5px;
  }

  .track-1 {
    background: red;
  }
   
  .label{
    font-size: 12px;
    margin: 8px 0;
    display: block;
  }
 
  }
`;
const SpectrumSetting = ({
  position,
  data: { id, info, display },
  onMouseLeave,
}) => {
  const dispatch = useDispatch();

  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: CHANGE_SPECTRUM_SETTING, id, display: values });
    },
    [dispatch, id],
  );

  const { x, y } = position;
  return (
    <div
      css={[
        style,
        {
          left: info.dimension === 2 ? x - 450 : x - 220,
          padding: info.dimension === 2 ? '10px 0' : '',
          top: y,
        },
      ]}
      onMouseLeave={onMouseLeave}
    >
      {info.dimension === 2 ? (
        <Spectrum2DSetting onSubmit={submitHandler} data={display} />
      ) : (
        <Spectrum1DSetting onSubmit={submitHandler} data={display} />
      )}
    </div>
  );
};

function arePropsEqual() {
  return true;
}

export default memo(SpectrumSetting, arePropsEqual);
