import { useFormikContext } from 'formik';
import { Jcoupling, Peak1D, translateMultiplet } from 'nmr-processing';
import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import { Multiplets } from '../../../../../../data/constants/Multiplets';
import { isSpectrum1D } from '../../../../../../data/data1d/Spectrum1D';
import { useChartData } from '../../../../../context/ChartContext';
import Button from '../../../../../elements/Button';
import ReactTable, {
  Column,
} from '../../../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../../../elements/formik/FormikInput';
import FormikSelect from '../../../../../elements/formik/FormikSelect';
import { usePanelPreferences } from '../../../../../hooks/usePanelPreferences';
import useSpectrum from '../../../../../hooks/useSpectrum';
import { hasCouplingConstant } from '../../../../../panels/extra/utilities/MultiplicityUtilities';
import { useEvent } from '../../../../../utility/Events';
import { formatNumber } from '../../../../../utility/formatNumber';

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

export function SignalJCouplingsTable(props: SignalJCouplingsTableProps) {
  const { values, setFieldValue } = useFormikContext<any>();
  const signal = values?.signals?.[values?.signalIndex] || {};
  const [lastSelectedCouplingIndex, setLastSelectedCouplingIndex] = useState<
    number | null
  >(null);
  const spectrum = useSpectrum();
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const rangesPreferences = usePanelPreferences('ranges', activeTab);
  const inputRef = useRef<HTMLInputElement[]>([]);

  useEvent({
    onClick: ({ xPPM, shiftKey }) => {
      if (
        `${props.index}` === values.signalIndex &&
        typeof lastSelectedCouplingIndex === 'number' &&
        shiftKey
      ) {
        const x = formatNumber(xPPM, rangesPreferences.deltaHz.format);

        void setFieldValue(
          getJCouplingKey(
            values.signalIndex,
            lastSelectedCouplingIndex,
            'coupling',
          ),
          x,
        );
      }
    },

    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (
        `${props.index}` === values.signalIndex &&
        typeof lastSelectedCouplingIndex === 'number' &&
        shiftKey &&
        isSpectrum1D(spectrum)
      ) {
        const value = Number(
          formatNumber(
            Math.abs(to - from) * spectrum.info.originFrequency,
            rangesPreferences.deltaHz.format,
          ),
        );

        void setFieldValue(
          getJCouplingKey(
            values.signalIndex,
            lastSelectedCouplingIndex,
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
        multiplicity: translateMultiplet('m'),
        coupling: '',
      };
      void setFieldValue(`signals[${values?.signalIndex}].js`, [
        ...data,
        coupling,
      ]);
      setLastSelectedCouplingIndex(data.length);
    },
    [setFieldValue, values?.signalIndex],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const jCouplings = data.filter((_, columnIndex) => columnIndex !== index);

      void setFieldValue(`signals[${values?.signalIndex}].js`, jCouplings);
      if (lastSelectedCouplingIndex === index) {
        setLastSelectedCouplingIndex(null);
      }
    },
    [lastSelectedCouplingIndex, setFieldValue, values?.signalIndex],
  );

  function deleteAllHandler() {
    void setFieldValue(`signals[${values?.signalIndex}].js`, []);
    setLastSelectedCouplingIndex(null);
  }

  const multiplicityChangeHandler = useCallback(
    (value, name) => {
      if (!hasCouplingConstant(value)) {
        void setFieldValue(name, '');
      }
    },
    [setFieldValue],
  );

  const COLUMNS: Array<Column<any>> = useMemo(
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
            <FormikSelect
              className="select-box"
              name={getJCouplingKey(
                values.signalIndex,
                row.index,
                'multiplicity',
              )}
              items={Multiplets}
              itemValueField="label"
              onChange={(value) => {
                multiplicityChangeHandler(
                  value,
                  getJCouplingKey(values.signalIndex, row.index, 'coupling'),
                );

                if (
                  hasCouplingConstant(row.original?.multiplicity) &&
                  typeof lastSelectedCouplingIndex === 'number'
                ) {
                  inputRef.current[lastSelectedCouplingIndex].focus();
                }
              }}
              style={styles.select}
              onClick={(e) => e.stopPropagation()}
            />
          );
        },
      },
      {
        Header: 'J (Hz)',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              ref={(ref) => {
                if (ref) {
                  inputRef.current[row.index] = ref;
                }
              }}
              name={getJCouplingKey(values.signalIndex, row.index, 'coupling')}
              type="number"
              placeholder={'J (Hz)'}
              style={{ input: styles.input }}
              disabled={!hasCouplingConstant(row.original?.multiplicity)}
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
                <Button.Danger
                  fill="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHandler(data, row.index);
                  }}
                >
                  <FaRegTrashAlt />
                </Button.Danger>
              )}
            </div>
          );
        },
      },
    ],
    [
      deleteHandler,
      lastSelectedCouplingIndex,
      multiplicityChangeHandler,
      values.signalIndex,
    ],
  );

  function selectRowHandler(index) {
    setLastSelectedCouplingIndex((prevIndex) =>
      prevIndex === index ? null : index,
    );
  }

  useEffect(() => {
    if (typeof lastSelectedCouplingIndex === 'number') {
      inputRef.current[lastSelectedCouplingIndex].focus();
    }
  }, [lastSelectedCouplingIndex, signal?.js]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
