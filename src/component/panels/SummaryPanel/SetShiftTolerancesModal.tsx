/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { Formik } from 'formik';
import { Tolerance } from 'nmr-correlation';
import { CSSProperties, useMemo } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import FormikInput from '../../elements/formik/FormikInput';
import { useChartData } from '../../context/ChartContext';

const styles: Record<'input' | 'column', CSSProperties> = {
  input: {
    padding: '0.25rem 0.5rem',
  },
  column: {
    padding: '2px',
  },
};

interface ToleranceItem {
  atom: string;
  value: number;
}

interface SetShiftToleranceModalProps extends InnerSetShiftToleranceModalProps {
  isOpen: boolean;
}
interface InnerSetShiftToleranceModalProps {
  onClose: () => void;
}

const toleranceValidationSchema = Yup.array()
  .of(Yup.object({ value: Yup.number().required() }))
  .min(1);

export function SetShiftToleranceModal(props: SetShiftToleranceModalProps) {
  const { isOpen, ...otherPros } = props;

  if (!isOpen) {
    return;
  }

  return <InnerSetShiftToleranceModal {...otherPros} />;
}

function InnerSetShiftToleranceModal(props: InnerSetShiftToleranceModalProps) {
  const { onClose } = props;
  const { correlations } = useChartData();
  const dispatch = useDispatch();

  function onSaveHandler(data) {
    const tolerance: Tolerance = {};
    for (const { atom, value } of data) {
      tolerance[atom] = value;
    }
    dispatch({
      type: 'SET_CORRELATIONS_TOLERANCE',
      payload: {
        tolerance,
      },
    });
    onClose?.();
  }

  const COLUMNS: Array<Column<ToleranceItem>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center', ...styles.column },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Atom',
        style: { width: '25px', textAlign: 'center', ...styles.column },
        accessor: 'atom',
      },
      {
        Header: 'Value',
        style: { padding: 0, ...styles.column },
        Cell: ({ row }) => {
          return (
            <FormikInput
              name={`${row.index}.value`}
              style={{ input: styles.input }}
              type="number"
              checkErrorAfterInputTouched={false}
            />
          );
        },
      },
    ],
    [],
  );

  const tolerances = correlations?.options?.tolerance || {};

  const tolerancesData: ToleranceItem[] = Object.keys(tolerances).map(
    (atom) => ({
      atom,
      value: tolerances[atom],
    }),
  );

  return (
    <Dialog
      isOpen
      title="Shift tolerances"
      onClose={onClose}
      style={{ width: 400 }}
    >
      <Formik
        initialValues={tolerancesData}
        onSubmit={onSaveHandler}
        validationSchema={toleranceValidationSchema}
      >
        {({ isValid, handleSubmit }) => (
          <>
            <DialogBody>
              <ReactTable
                data={tolerancesData}
                columns={COLUMNS}
                emptyDataRowText="No atoms"
              />
            </DialogBody>
            <DialogFooter>
              <Button.Done onClick={() => handleSubmit()} disabled={!isValid}>
                Set shift tolerances
              </Button.Done>
            </DialogFooter>
          </>
        )}
      </Formik>
    </Dialog>
  );
}
