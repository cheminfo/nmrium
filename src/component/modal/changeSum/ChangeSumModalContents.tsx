import styled from '@emotion/styled';
import { Formik } from 'formik';
import { SumOptions } from 'nmr-load-save';
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext';
import Button from '../../elements/Button';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import FormikInput from '../../elements/formik/FormikInput';

import SelectMolecule from './SelectMolecule';

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

const ManualContainer = styled.div`
  padding: 30px 5px;

  .input {
    width: 80% !important;
    height: 36px;
    margin: 0 auto;
  }

  .input input {
    padding: 5px;
    text-align: center;
  }
`;

export interface ChangeSumModalContentsProps {
  currentSum: number | null;
  sumType: string;
  sumOptions: SumOptions;
  onSave: (saveInput: SaveInput) => void;
  onClose: () => void;
}

export function ChangeSumModalContents(props: ChangeSumModalContentsProps) {
  const { currentSum, sumType, sumOptions, onSave, onClose } = props;
  const {
    current: {
      display: { panels },
    },
  } = usePreferences();

  const [setOption, setActiveOption] = useState<SumSetOption>('auto');
  const formRef = useRef<any>(null);

  useEffect(() => {
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
  }, [panels?.structuresPanel, sumOptions]);

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      formRef.current.submitForm();
    }
  }

  function onTabChangeHandler(tab) {
    setActiveOption(tab.tabid);
  }
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
    onClose();
  }

  const isStructurePanelVisible = panels?.structuresPanel?.display || false;

  return (
    <>
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
              <ManualContainer>
                <FormikInput
                  name="sum"
                  type="number"
                  placeholder="Enter the new value"
                  onKeyDown={handleKeyDown}
                />
              </ManualContainer>
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
    </>
  );
}
