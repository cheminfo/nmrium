import { useFormikContext } from 'formik';
import { Jcoupling, Peak1D, translateMultiplet } from 'nmr-processing';
import { CSSProperties, useCallback, useMemo, useState } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import { Multiplets } from '../../../../../data/constants/Multiplets';
import Button from '../../../../elements/Button';
import ReactTable, { Column } from '../../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../../elements/formik/FormikInput';
import FormikSelect from '../../../../elements/formik/FormikSelect';
import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities';
import { useEvent } from '../../../../utility/Events';

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

interface PeaksTableProps {
  index: number;
}

function getJCouplingKey(
  signalIndex: number,
  jIndex,
  jCouplingKey: keyof Jcoupling,
) {
  return `signals[${signalIndex}].js.${jIndex}.${jCouplingKey}`;
}

export default function JCouplingsTable(props: PeaksTableProps) {
  const { values, setFieldValue } = useFormikContext<any>();
  const signal = values?.signals?.[values?.signalIndex] || {};
  const jCouplings = signal?.js || [];
  const [lastSelectedCouplingIndex, setLastSelectedCouplingIndex] = useState<
    number | null
  >(null);

  useEvent({
    onClick: (options) => {
      if (
        `${props.index}` === values.signalIndex &&
        typeof lastSelectedCouplingIndex === 'number'
      ) {
        const x = options.xPPM;
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
      } = options;
      if (
        `${props.index}` === values.signalIndex &&
        typeof lastSelectedCouplingIndex === 'number'
      ) {
        void setFieldValue(
          getJCouplingKey(
            values.signalIndex,
            lastSelectedCouplingIndex,
            'coupling',
          ),
          (to - from) / 2 + from,
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
              name={getJCouplingKey(values.signalIndex, row.index, 'coupling')}
              type="number"
              placeholder={'J (Hz)'}
              style={{ input: styles.input }}
              disabled={!hasCouplingConstant(row.original?.multiplicity)}
              onClick={(e) => e.stopPropagation()}
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
    [deleteHandler, multiplicityChangeHandler, values.signalIndex],
  );

  function selectRowHandler(index) {
    setLastSelectedCouplingIndex((prevIndex) =>
      prevIndex === index ? null : index,
    );
  }

  function handleActiveRow(row) {
    return row?.index === lastSelectedCouplingIndex;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '5px 0', display: 'flex' }}>
        <Toolbar>
          <Toolbar.Item
            icon={<FaPlus />}
            title="Add a new J coupling"
            intent="success"
            onClick={() => addHandler(jCouplings)}
          />
          <Toolbar.Item
            icon={<FaRegTrashAlt />}
            title="Delete all J couplings"
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
          data={jCouplings}
          columns={COLUMNS}
          onClick={(e, rowData: any) => selectRowHandler(rowData.index)}
          activeRow={handleActiveRow}
          emptyDataRowText="No J Couplings"
        />
      </div>
    </div>
  );
}
