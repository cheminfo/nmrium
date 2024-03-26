import { Dialog, DialogBody, Tab, Tabs } from '@blueprintjs/core';
import { Formik } from 'formik';
import { CSSProperties, useState } from 'react';
import * as Yup from 'yup';

import getAtomsFromMF from '../../../data/utilities/getAtomsFromMF';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import MoleculeSelection from '../../elements/MoleculeSelection';
import FormikError from '../../elements/formik/FormikError';
import FormikInput from '../../elements/formik/FormikInput';

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

  return (
    <div style={styles.container}>
      <p>Please type in a molecular formula!</p>

      <Formik
        onSubmit={saveHandler}
        initialValues={{ mf: correlations?.options?.mf }}
        validationSchema={validationSchema}
      >
        {({ isValid, handleSubmit }) => (
          <>
            <FormikError name="mf">
              <FormikInput
                name="mf"
                placeholder="Enter a molecular formula"
                style={{ input: styles.input }}
                checkErrorAfterInputTouched={false}
              />
            </FormikError>
            <Button.Done
              onClick={() => handleSubmit()}
              disabled={!isValid}
              style={{ marginTop: '10px' }}
            >
              Set molecular formula
            </Button.Done>
          </>
        )}
      </Formik>
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
