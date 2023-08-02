import { Formik } from 'formik';
import { SumOptions } from 'nmr-load-save';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Modal, useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext';
import Button from '../../elements/Button';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import FormikInput from '../../elements/formik/FormikInput';

import SelectMolecule from './SelectMolecule';

type SumSetOption = 'auto' | 'manual';

type SaveInput =
  | {
      sum: number;
      sumAuto: false;
    }
  | {
      moleculeId: string;
      mf: string;
      sumAuto: true;
    };

interface ChangeSumModalProps {
  onSave: (saveInput: SaveInput) => void;
  sumType: string;
  currentSum: number | null;
  sumOptions: SumOptions;
  renderButton: (onClick: () => void) => ReactNode;
}

function getValidationSchema(option: SumSetOption) {
  switch (option) {
    case 'auto': {
      return Yup.object({
        molecule: Yup.object().required(),
      });
    }
    case 'manual': {
      return Yup.object({
        sum: Yup.number().required(),
      });
    }
    default:
      return null;
  }
}

export default function ChangeSumModal({
  onSave,
  sumType,
  currentSum,
  sumOptions,
  renderButton,
}: ChangeSumModalProps) {
  const {
    current: {
      display: { panels },
    },
  } = usePreferences();

  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const [setOption, setActiveOption] = useState<SumSetOption>('auto');
  const formRef = useRef<any>(null);

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      formRef.current.submitForm();
    }
  }

  function onTabChangeHandler(tab) {
    setActiveOption(tab.tabid);
  }

  useEffect(() => {
    if (isOpenDialog) {
      if (sumOptions?.sumAuto && panels?.structuresPanel?.display) {
        setActiveOption('auto');
        const { mf, moleculeId: id } = sumOptions;
        formRef.current.setValues({
          sum: null,
          molecule: id && mf ? { mf, id } : null,
        });
      } else {
        setActiveOption('manual');
        formRef.current.setValues({
          sum: sumOptions?.sum ?? '',
          molecule: null,
        });
      }
    }
  }, [isOpenDialog, panels?.structuresPanel, sumOptions]);

  function saveHandler(values) {
    switch (setOption) {
      case 'auto': {
        const {
          molecule: { mf, id: moleculeId },
        } = values;

        onSave({ sumAuto: true, mf, moleculeId });
        break;
      }
      case 'manual': {
        const { sum } = values;
        onSave({ sum, sumAuto: false });
        break;
      }
      default:
        return;
    }
    closeDialog();
  }

  const isStructurePanelVisible = panels?.structuresPanel?.display || false;

  return (
    <>
      {renderButton(openDialog)}

      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={closeDialog}
        width={500}
        height={400}
      >
        <Modal.Header>
          {currentSum
            ? `Set new ${sumType} sum (Current: ${currentSum.toFixed(2)})`
            : `Set new ${sumType} Sum`}
        </Modal.Header>
        <Modal.Body>
          <Formik
            innerRef={formRef}
            onSubmit={saveHandler}
            initialValues={{ sum: '', molecule: null }}
            validationSchema={getValidationSchema(setOption)}
          >
            <Tabs activeTab={setOption} onClick={onTabChangeHandler}>
              {isStructurePanelVisible && (
                <Tab title="Auto" tabid="auto">
                  <SelectMolecule name="molecule" />
                </Tab>
              )}

              <Tab title="Manual" tabid="manual">
                <FormikInput
                  name="sum"
                  type="number"
                  nullable
                  placeholder="Enter the new value"
                  onKeyDown={handleKeyDown}
                />
              </Tab>
            </Tabs>
          </Formik>
        </Modal.Body>
        <Modal.Footer>
          <Button.Done
            onClick={() => formRef.current.submitForm()}
            style={{ width: 80 }}
          >
            Set
          </Button.Done>
        </Modal.Footer>
      </Modal>
    </>
  );
}
