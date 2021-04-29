/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { memo, useCallback } from 'react';

import { useDispatch } from '../../../../context/DispatchContext';
import { CHANGE_SPECTRUM_SETTING } from '../../../../reducer/types/Types';

import Spectrum1DSetting from './Spectrum1DSetting';
import Spectrum2DSetting from './Spectrum2DSetting';

const style = css`
  position: fixed;
  z-index: 999999999;
  width:100%;
  height:100%;
  left:0;
  top:0;
  .ineer-conatiner{
    position:absolute;
    display: flex;
    flex-direction: row-reverse;
    border-radius: 4px;
    background-color: white;
    box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px,
      rgba(0, 0, 0, 0.15) 0px 8px 16px;
      overflow: auto;
      height: 350px;
  }


  .sketch-picker {
    border-radius: none !important;
    box-shadow: none !important;
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
function SpectrumSetting({ position, data, onClose }) {
  const dispatch = useDispatch();
  const { id, info } = data;
  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: CHANGE_SPECTRUM_SETTING, id, display: values });
    },
    [dispatch, id],
  );

  const clickHandler = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const { x, y } = position;
  return (
    <div css={style} onClick={clickHandler}>
      <div
        className="ineer-conatiner"
        style={{
          left: info.dimension === 2 ? x - 450 : x - 220,
          padding: info.dimension === 2 ? '10px 0' : '',
          top: y,
        }}
      >
        {info.dimension === 2 ? (
          <Spectrum2DSetting onSubmit={submitHandler} data={data} />
        ) : (
          <Spectrum1DSetting onSubmit={submitHandler} data={data} />
        )}
      </div>
    </div>
  );
}

function arePropsEqual() {
  return true;
}

export default memo(SpectrumSetting, arePropsEqual);
