import { Button, Callout, Classes } from '@blueprintjs/core';
import type { Jcoupling, Peak1D } from '@zakodium/nmr-types';
import dlv from 'dlv';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import { multiplets } from '../../../../../../data/constants/Multiplets.js';
import { isSpectrum1D } from '../../../../../../data/data1d/Spectrum1D/index.js';
import { NumberInput2Controller } from '../../../../../elements/NumberInput2Controller.js';
import type { Column } from '../../../../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../../../../elements/ReactTable/ReactTable.js';
import { Select2Controller } from '../../../../../elements/Select2Controller.js';
import { useTabsController } from '../../../../../elements/TabsProvider.js';
import useSpectrum from '../../../../../hooks/useSpectrum.js';
import { hasCouplingConstant } from '../../../../../panels/extra/utilities/MultiplicityUtilities.js';
import { useEvent } from '../../../../../utility/Events.js';
import { useEventFocusInput } from '../SignalsContent.js';

const styles: Record<'input' | 'select' | 'column', CSSProperties> = {
  input: {
    width: '100%',
    padding: '0.25rem 0.5rem',
  },
  select: {
    height: '26px',
    width: '100%',
  },
  column: {
    padding: '2px',
  },
};

interface SignalJCouplingsTableProps {
  index: number;
}

function getJCouplingKey(
  signalIndex: number,
  jIndex,
  jCouplingKey: keyof Jcoupling,
) {
  return `signals[${signalIndex}].js.${jIndex}.${jCouplingKey}`;
}

function getCouplingMinErrorMessage(errors, index) {
  return dlv(errors, `signals.${index}.js.root.message`);
}

export function SignalJCouplingsTable(props: SignalJCouplingsTableProps) {
  const { focusSource, setFocusSource } = useEventFocusInput();

  const {
    setValue,
    control,
    setFocus,
    formState: { errors },
  } = useFormContext();
  const signals = useWatch({ name: 'signals' });
  const { selectedTabId: signalIndex = 0 } = useTabsController<number>();

  const signal = signals?.[signalIndex] || {};

  const lastSelectedCouplingIndexRef = useRef<number | null>(null);
  const spectrum = useSpectrum();

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (
        props.index === signalIndex &&
        typeof lastSelectedCouplingIndexRef.current === 'number' &&
        shiftKey &&
        focusSource === 'coupling'
      ) {
        setValue(
          getJCouplingKey(
            signalIndex,
            lastSelectedCouplingIndexRef.current,
            'coupling',
          ),
          xPPM,
        );
      }
    },

    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (
        props.index === signalIndex &&
        typeof lastSelectedCouplingIndexRef.current === 'number' &&
        shiftKey &&
        isSpectrum1D(spectrum) &&
        focusSource === 'coupling'
      ) {
        const value = Math.abs(to - from) * spectrum.info.originFrequency;

        setValue(
          getJCouplingKey(
            signalIndex,
            lastSelectedCouplingIndexRef.current,
            'coupling',
          ),
          value,
        );
      }
    },
  });

  const addHandler = useCallback(
    (data: Peak1D[]) => {
      const coupling = {
        multiplicity: 'm',
        coupling: '',
      };
      setValue(`signals[${signalIndex}].js`, [...data, coupling]);
      lastSelectedCouplingIndexRef.current = data.length;
    },
    [setValue, signalIndex],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const jCouplings = data.filter((_, columnIndex) => columnIndex !== index);

      setValue(`signals[${signalIndex}].js`, jCouplings);
      if (lastSelectedCouplingIndexRef.current === index) {
        lastSelectedCouplingIndexRef.current = null;
      }
    },
    [setValue, signalIndex],
  );

  function deleteAllHandler() {
    setValue(`signals[${signalIndex}].js`, []);
    lastSelectedCouplingIndexRef.current = null;
  }
  const COLUMNS: Column[] = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Multiplicity',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <Select2Controller
              control={control}
              name={getJCouplingKey(signalIndex, row.index, 'multiplicity')}
              items={multiplets}
              itemTextKey="label"
              itemValueKey="value"
              onItemSelect={({ value }) => {
                const name = getJCouplingKey(
                  signalIndex,
                  row.index,
                  'coupling',
                );

                if (!hasCouplingConstant(value)) {
                  setValue(name, '');
                } else {
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      setFocus(name, { shouldSelect: true });
                    }, 0);
                  });
                }
              }}
              fill
              selectedButtonProps={{ size: 'small', variant: 'minimal' }}
            />
          );
        },
      },
      {
        Header: 'J (Hz)',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <NumberInput2Controller
              control={control}
              name={getJCouplingKey(signalIndex, row.index, 'coupling')}
              placeholder="J (Hz)"
              disabled={!hasCouplingConstant(row.original?.multiplicity)}
              fill
              noShadowBox
              style={{ backgroundColor: 'transparent' }}
              debounceTime={250}
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
                  size="small"
                  variant="outlined"
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
    [control, deleteHandler, setFocus, setValue, signalIndex],
  );

  function selectRowHandler(index) {
    setFocusSource('coupling');
    lastSelectedCouplingIndexRef.current = index;
  }

  const minErrorMessage = getCouplingMinErrorMessage(errors, props.index);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {minErrorMessage && (
        <Callout intent="danger" icon="error" style={{ textAlign: 'start' }}>
          {minErrorMessage}
        </Callout>
      )}
      <div style={{ padding: '5px 0', display: 'flex' }}>
        <Toolbar>
          <Toolbar.Item
            icon={<FaPlus />}
            tooltip="Add a new J coupling"
            intent="success"
            onClick={() => addHandler(signal?.js || [])}
          />
          <Toolbar.Item
            icon={<FaRegTrashAlt />}
            tooltip="Delete all J couplings"
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
          data={signal?.js || []}
          columns={COLUMNS}
          onClick={(e, rowData: any) => selectRowHandler(rowData.index)}
          emptyDataRowText="No J Couplings"
        />
      </div>
    </div>
  );
}
