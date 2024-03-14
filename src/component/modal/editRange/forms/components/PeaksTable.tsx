import { v4 } from '@lukeed/uuid';
import { useFormikContext } from 'formik';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { Peak1D, getShiftX } from 'nmr-processing';
import { CSSProperties, useCallback, useMemo } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Toolbar } from 'react-science/ui';

import Button from '../../../../elements/Button';
import ReactTable, { Column } from '../../../../elements/ReactTable/ReactTable';
import FormikInput from '../../../../elements/formik/FormikInput';
import useSpectrum from '../../../../hooks/useSpectrum';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    width: '100%',
    padding: '0.25rem 0.5rem',
  },
  column: {
    padding: '2px',
  },
};

export default function PeaksTable() {
  const { values, setFieldValue } = useFormikContext<any>();
  const signal = values?.signals?.[values?.signalIndex] || {};
  const peaks = signal?.peaks || [];
  const delta = signal?.delta || 0;
  const spectrum = useSpectrum() as Spectrum1D;
  const {
    data: { x, re },
  } = spectrum;
  const shiftX = getShiftX(spectrum);

  const addHandler = useCallback(
    (data: Peak1D[]) => {
      const xIndex = xFindClosestIndex(x, delta, { sorted: false });

      const peak: Peak1D = {
        id: v4(),
        x: delta,
        y: xIndex !== -1 ? re[xIndex] : 0,
        originalX: delta - shiftX,
        width: 1,
      };
      void setFieldValue(`signals[${values?.signalIndex}].peaks`, [
        ...data,
        peak,
      ]);
    },
    [delta, re, setFieldValue, shiftX, values?.signalIndex, x],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const peaks = data.filter((_, columnIndex) => columnIndex !== index);
      void setFieldValue(`signals[${values?.signalIndex}].peaks`, peaks);
    },
    [setFieldValue, values?.signalIndex],
  );

  function deleteAllHandler() {
    void setFieldValue(`signals[${values?.signalIndex}].peaks`, []);
  }

  const changeDeltaHandler = useCallback(
    (event, index: number) => {
      const delta = Number(event.target.value);

      const xIndex = xFindClosestIndex(x, delta, { sorted: false });

      void setFieldValue(
        `signals[${values?.signalIndex}].peaks.${index}.y`,
        re[xIndex],
      );
    },
    [re, setFieldValue, values?.signalIndex, x],
  );

  const COLUMNS: Array<Column<any>> = useMemo(
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
            <FormikInput
              name={`signals.${values?.signalIndex}.peaks.${row.index}.x`}
              style={{ input: styles.input }}
              onChange={(event) => changeDeltaHandler(event, row.index)}
              type="number"
            />
          );
        },
      },
      {
        Header: 'Intensity',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`signals.${values?.signalIndex}.peaks.${row.index}.y`}
              style={{ input: styles.input }}
              readOnly
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
                  onClick={() => deleteHandler(data, row.index)}
                >
                  <FaRegTrashAlt />
                </Button.Danger>
              )}
            </div>
          );
        },
      },
    ],
    [changeDeltaHandler, deleteHandler, values?.signalIndex],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '5px 0', display: 'flex' }}>
        <Toolbar>
          <Toolbar.Item
            icon={<FaPlus />}
            title="Add a new peak"
            intent="success"
            onClick={() => addHandler(peaks)}
          />
          <Toolbar.Item
            icon={<FaRegTrashAlt />}
            title="Delete all peaks"
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
          data={peaks}
          columns={COLUMNS}
          emptyDataRowText="No peaks"
        />
      </div>
    </div>
  );
}
