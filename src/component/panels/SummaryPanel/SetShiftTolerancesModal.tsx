/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { Tolerance } from 'nmr-correlation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';

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
  .of(
    Yup.object().shape({
      value: Yup.number().required(),
      atom: Yup.string().required(),
    }),
  )
  .required()
  .min(1);

const schema = Yup.object().shape({
  tolerances: toleranceValidationSchema,
});

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

  const tolerances = correlations?.options?.tolerance || {};

  const tolerancesData: ToleranceItem[] =
    Object.keys(tolerances).map((atom) => ({
      atom,
      value: tolerances[atom],
    })) || [];
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<{ tolerances: ToleranceItem[] }>({
    defaultValues: { tolerances: tolerancesData },
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  function onSaveHandler(data) {
    const tolerance: Tolerance = {};
    for (const { atom, value } of data.tolerances) {
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
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Atom',
        style: { width: '25px', textAlign: 'center' },
        accessor: 'atom',
      },
      {
        Header: 'Value',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <NumberInput2Controller
              name={`tolerances.${row.index}.value`}
              control={control}
              fill
            />
          );
        },
      },
    ],
    [control],
  );

  return (
    <Dialog
      isOpen
      title="Shift tolerances"
      onClose={onClose}
      style={{ width: 400 }}
    >
      <DialogBody>
        <ReactTable
          data={tolerancesData}
          columns={COLUMNS}
          emptyDataRowText="No atoms"
        />
      </DialogBody>
      <DialogFooter>
        <Button.Done
          onClick={() => handleSubmit(onSaveHandler)()}
          disabled={!isValid}
        >
          Set shift tolerances
        </Button.Done>
      </DialogFooter>
    </Dialog>
  );
}
