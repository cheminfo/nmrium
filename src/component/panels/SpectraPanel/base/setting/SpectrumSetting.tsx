import { Popover } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { Display1D, Display2D } from 'nmrium-core';

import { useDispatch } from '../../../../context/DispatchContext.js';
import { ColorIndicator } from '../ColorIndicator.js';

import { Spectrum1DSetting } from './Spectrum1DSetting.js';
import { Spectrum2DSetting } from './Spectrum2DSetting.js';

const SpectrumSettingContent = styled.div`
  max-height: 360px;
  overflow-y: auto;
`;
interface SpectrumSettingProps {
  data: any;
  display: Display1D | Display2D;
  dimension: number;
}

export function SpectrumSetting({
  data,
  display,
  dimension,
}: SpectrumSettingProps) {
  const dispatch = useDispatch();
  const { id, info } = data;

  function submitHandler(values) {
    dispatch({
      type: 'CHANGE_SPECTRUM_SETTING',
      payload: { id, display: values },
    });
  }

  return (
    <Popover
      interactionKind="click"
      placement="left-start"
      canEscapeKeyClose
      content={
        <SpectrumSettingContent
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {info.dimension === 2 ? (
            <Spectrum2DSetting onSubmit={submitHandler} data={data} />
          ) : (
            <Spectrum1DSetting onSubmit={submitHandler} data={data} />
          )}
        </SpectrumSettingContent>
      }
      renderTarget={({ isOpen, onClick, ...targetProps }) => (
        <div
          {...targetProps}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
          }}
        >
          <ColorIndicator display={display} dimension={dimension} />
        </div>
      )}
    />
  );
}
