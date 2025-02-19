import { Button, Classes } from '@blueprintjs/core';
import { xFindClosestIndex } from 'ml-spectra-processing';
import type { Spectrum1D } from 'nmr-load-save';
import type { Peak1D } from 'nmr-processing';
import { getShiftX } from 'nmr-processing';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import { NumberInput2Controller } from '../../../../../elements/NumberInput2Controller.js';
import type { Column } from '../../../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../../../elements/ReactTable/ReactTable.js';
import useSpectrum from '../../../../../hooks/useSpectrum.js';
import { useEvent } from '../../../../../utility/Events.js';
import { useEventFocusInput } from '../SignalsContent.js';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
    padding: '0.25rem 0.5rem',
  },
  column: {
    padding: '2px',
  },
};

interface SignalPeaksTableProps {
  index: number;
}

function getPeakKey(signalIndex: number, peakIndex, key?: keyof Peak1D) {
  const path = `signals[${signalIndex}].peaks.${peakIndex}`;

  if (!key) {
    return path;
  }

  return `${path}.${key}`;
}

export function SignalPeaksTable(props: SignalPeaksTableProps) {
  const { focusSource, setFocusSource } = useEventFocusInput();

  const { setValue, control, setFocus } = useFormContext();
  const { signals, signalIndex } = useWatch();
  const signal = signals?.[signalIndex] || {};
  const delta = signal?.delta || 0;
  const spectrum = useSpectrum() as Spectrum1D;
  const {
    data: { x: xArray, re },
  } = spectrum;
  const shiftX = getShiftX(spectrum);
  const lastSelectedPeakIndexRef = useRef<number | null>(null);

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (
        props.index === signalIndex &&
        typeof lastSelectedPeakIndexRef.current === 'number' &&
        shiftKey &&
        focusSource === 'peak'
      ) {
        const delta = xPPM;
        const xIndex = xFindClosestIndex(xArray, delta, { sorted: false });
        const intensity = re[xIndex];
        setValue(getPeakKey(signalIndex, lastSelectedPeakIndexRef.current), {
          ...signal?.peaks?.[lastSelectedPeakIndexRef.current],
          x: delta,
          y: intensity,
        });
      }
    },
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (
        props.index === signalIndex &&
        typeof lastSelectedPeakIndexRef.current === 'number' &&
        shiftKey &&
        focusSource === 'peak'
      ) {
        const delta = (to - from) / 2 + from;

        const xIndex = xFindClosestIndex(xArray, delta, { sorted: false });

        setValue(getPeakKey(signalIndex, lastSelectedPeakIndexRef.current), {
          ...signal?.peaks?.[lastSelectedPeakIndexRef.current],
          x: delta,
          y: re[xIndex],
        });
      }
    },
  });

  const addHandler = useCallback(
    (data: Peak1D[]) => {
      const xIndex = xFindClosestIndex(xArray, delta, { sorted: false });

      const peak: Peak1D = {
        id: crypto.randomUUID(),
        x: delta,
        y: xIndex !== -1 ? re[xIndex] : 0,
        originalX: delta - shiftX,
        width: 1,
      };
      setValue(`signals[${signalIndex}].peaks`, [...data, peak]);
      const rowIndex = data?.length || 0;
      lastSelectedPeakIndexRef.current = rowIndex;
    },
    [delta, re, setValue, shiftX, signalIndex, xArray],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const peaks = data.filter((_, columnIndex) => columnIndex !== index);

      setValue(`signals[${signalIndex}].peaks`, peaks);
      if (lastSelectedPeakIndexRef.current === index) {
        lastSelectedPeakIndexRef.current = null;
      }
    },
    [setValue, signalIndex],
  );

  function deleteAllHandler() {
    setValue(`signals[${signalIndex}].peaks`, []);
    lastSelectedPeakIndexRef.current = null;
  }

  const changeDeltaHandler = useCallback(
    (delta, index: number) => {
      const xIndex = xFindClosestIndex(xArray, delta, { sorted: false });

      setValue(`signals[${signalIndex}].peaks.${index}.y`, re[xIndex]);
    },
    [re, setValue, signalIndex, xArray],
  );

  const COLUMNS: Column[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'delta',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <NumberInput2Controller
              control={control}
              name={`signals.${signalIndex}.peaks.${row.index}.x`}
              onValueChange={(valueAsNumber) =>
                changeDeltaHandler(valueAsNumber, row.index)
              }
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
              fill
              buttonPosition="none"
            />
          );
        },
      },
      {
        Header: 'Intensity',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <NumberInput2Controller
              control={control}
              name={`signals.${signalIndex}.peaks.${row.index}.y`}
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
              fill
              readOnly
              buttonPosition="none"
            />
          );
        },
      },
      {
        Header: '',
        style: { width: '70px', ...styles.column },
        id: 'action-button',
        Cell: ({ data, row }) => {
          const record: any = row.original;
          return (
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {!record?.name && (
                <Button
                  small
                  outlined
                  intent="danger"
                  onClick={() => deleteHandler(data, row.index)}
                >
                  <FaRegTrashAlt className={Classes.ICON} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [changeDeltaHandler, control, deleteHandler, signalIndex],
  );

  function selectRowHandler(index) {
    setFocusSource('peak');
    lastSelectedPeakIndexRef.current = index;
    setFocus(`signals.${signalIndex}.peaks.${index}.x`, { shouldSelect: true });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '5px 0', display: 'flex' }}>
        <Toolbar>
          <Toolbar.Item
            icon={<FaPlus />}
            tooltip="Add a new peak"
            intent="success"
            onClick={() => addHandler(signal?.peaks || [])}
          />
          <Toolbar.Item
            icon={<FaRegTrashAlt />}
            tooltip="Delete all peaks"
            intent="danger"
            onClick={deleteAllHandler}
          />
        </Toolbar>
      </div>
      <div
        style={{
          maxHeight: '300px',
          overflow: 'auto',
        }}
      >
        <ReactTable
          data={signal?.peaks || []}
          columns={COLUMNS}
          onClick={(e, rowData: any) => selectRowHandler(rowData.index)}
          emptyDataRowText="No peaks"
        />
      </div>
    </div>
  );
}
