import { Dialog, DialogBody, Tab, Tabs } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { CSSProperties, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import getAtomsFromMF from '../../../data/utilities/getAtomsFromMF.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import Button from '../../elements/Button.js';
import { Input2Controller } from '../../elements/Input2Controller.js';
import MoleculeSelection from '../../elements/MoleculeSelection.js';

function isValidMf(value: string): boolean {
  try {
    getAtomsFromMF(value);
    return true;
  } catch {
    return false;
  }
}

const validationSchema = Yup.object({
  mf: Yup.string()
    .required()
    .test('valid-mf', 'Enter a valid molecular formula', (value) =>
      isValidMf(value),
    ),
});

const styles: Record<'container' | 'input' | 'error' | 'title', CSSProperties> =
  {
    input: {
      padding: '0.5rem',
    },
    container: {
      padding: '0.5rem',
    },
    error: {
      textAlign: 'center',
      color: 'red',
      fontSize: '0.9em',
    },
    title: {
      textAlign: 'center',
    },
  };

interface InnerMolecularFormulaModalProps {
  onClose: () => void;
}
interface MolecularFormulaModalProps extends InnerMolecularFormulaModalProps {
  isOpen: boolean;
}

export function SetMolecularFormulaModal(props: MolecularFormulaModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) {
    return;
  }

  return <InnerSetMolecularFormulaModal {...otherProps} />;
}

function InnerSetMolecularFormulaModal({
  onClose,
}: InnerMolecularFormulaModalProps) {
  const dispatch = useDispatch();

  function saveHandler(mf) {
    dispatch({
      type: 'SET_CORRELATIONS_MF',
      payload: {
        mf,
      },
    });
    onClose?.();
  }

  return (
    <Dialog
      isOpen
      title="Molecular formula"
      style={{ width: 400 }}
      onClose={onClose}
    >
      <DialogBody>
        <Tabs fill>
          <Tab
            id="manual"
            title="Manual"
            panel={<ManualFormula onSave={saveHandler} />}
          />
          <Tab
            id="auto"
            title="Auto"
            panel={<AutoFormula onSave={saveHandler} />}
          />
        </Tabs>
      </DialogBody>
    </Dialog>
  );
}

function ManualFormula(props) {
  const { correlations } = useChartData();

  function saveHandler(data) {
    props?.onSave(data.mf);
  }

  const { handleSubmit, control } = useForm({
    defaultValues: { mf: correlations?.options?.mf },
    resolver: yupResolver(validationSchema),
  });

  return (
    <div style={styles.container}>
      <p>Please type in a molecular formula!</p>
      <Input2Controller
        enableErrorMessage
        control={control}
        name="mf"
        placeholder="Enter a molecular formula"
      />
      <Button.Done
        onClick={() => handleSubmit(saveHandler)()}
        style={{ marginTop: '10px' }}
      >
        Set molecular formula
      </Button.Done>
    </div>
  );
}

function AutoFormula(props) {
  const { molecules } = useChartData();

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  function onChangeHandlerMoleculeSelection(index) {
    setCurrentIndex(index);
  }

  function saveHandler() {
    const mf = molecules?.[currentIndex]?.mf;
    props?.onSave(mf);
  }

  if (!molecules || molecules?.length === 0) {
    return (
      <p style={styles.error}>
        You have to Select a spectrum and Add a molecule from the Structure
        panel to select as a reference!
      </p>
    );
  }

  return (
    <div style={styles.container}>
      <p style={styles.title}>Select a molecule as reference!</p>
      <MoleculeSelection
        molecules={molecules}
        onChange={onChangeHandlerMoleculeSelection}
      />
      <Button.Done
        onClick={saveHandler}
        disabled={!molecules?.[currentIndex]}
        style={{ marginTop: '10px' }}
      >
        Set molecular formula
      </Button.Done>
    </div>
  );
}
