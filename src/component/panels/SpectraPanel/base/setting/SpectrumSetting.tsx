import { PopoverNext } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { Display1D, Display2D } from '@zakodium/nmrium-core';
import type { CSSProperties } from 'react';

import { useDispatch } from '../../../../context/DispatchContext.js';
import { useActiveSpectra } from '../../../../hooks/useActiveSpectra.ts';
import { ColorIndicator } from '../ColorIndicator.js';

import { Spectrum1DSetting } from './Spectrum1DSetting.js';
import { Spectrum2DSetting } from './Spectrum2DSetting.js';

const SpectrumSettingContent = styled.div`
  max-height: 390px;
  overflow-y: auto;
`;
const settingsButtonStyle: CSSProperties = {
  display: 'flex',
  width: '100%',
  padding: 0,
  border: 'none',
  background: 'none',
};

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
  const activeSpectra = useActiveSpectra();

  function submitHandler(values: any) {
    const { applyToAll, ...other } = values;
    const ids =
      activeSpectra && activeSpectra.length >= 2 && applyToAll
        ? activeSpectra.map((s) => s.id)
        : [id];

    dispatch({
      type: 'CHANGE_SPECTRUM_SETTING',
      payload: { ids, ...other },
    });
  }

  return (
    <PopoverNext
      lazy
      interactionKind="click"
      placement="left-start"
      canEscapeKeyClose
      content={
        <SpectrumSettingContent
          role="dialog"
          aria-label="Spectrum settings"
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
        <button
          type="button"
          aria-label="Spectrum settings"
          style={settingsButtonStyle}
          {...targetProps}
          onClick={(event) => {
            event.stopPropagation();
            onClick?.(event);
          }}
        >
          <ColorIndicator display={display} dimension={dimension} />
        </button>
      )}
    />
  );
}
