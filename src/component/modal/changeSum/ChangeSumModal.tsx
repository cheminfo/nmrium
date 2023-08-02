/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrSum } from 'cheminfo-font';
import { Formik } from 'formik';
import { SumOptions } from 'nmr-load-save';
import { useEffect, useRef, useState } from 'react';
import { Modal, useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext';
import Button from '../../elements/Button';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';
import FormikInput from '../../elements/formik/FormikInput';
import { ModalStyles } from '../ModalStyle';

import SelectMolecule from './SelectMolecule';

const styles = css`
  width: 450px;
  height: 400px;

  .header {
    display: flex;
    justify-content: center;
    padding: 0;

    span {
      font-size: 14px;
      flex: 1;
    }
  }

  .tab-content {
    flex: 1;
  }

  .manual-container {
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
  }
`;

enum SumSetOptions {
  Auto = 'auto',
  Manual = 'manual',
}

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
  header: string;
  sumOptions: SumOptions;
}

function getValidationSchema(option) {
  switch (option) {
    case SumSetOptions.Auto: {
      return Yup.object({
        molecule: Yup.object().required(),
      });
    }
    case SumSetOptions.Manual: {
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
  header,
  sumOptions,
}: ChangeSumModalProps) {
  const {
    current: {
      display: { panels },
    },
  } = usePreferences();

  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const [setOption, setActiveOption] = useState(SumSetOptions.Auto);
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
        setActiveOption(SumSetOptions.Auto);
        const { mf, moleculeId: id } = sumOptions;
        formRef.current.setValues({
          sum: null,
          molecule: id && mf ? { mf, id } : null,
        });
      } else {
        setActiveOption(SumSetOptions.Manual);
        formRef.current.setValues({
          sum: sumOptions?.sum ?? '',
          molecule: null,
        });
      }
    }
  }, [isOpenDialog, panels?.structuresPanel, sumOptions]);

  function saveHandler(values) {
    switch (setOption) {
      case SumSetOptions.Auto: {
        const {
          molecule: { mf, id: moleculeId },
        } = values;

        onSave({ sumAuto: true, mf, moleculeId });
        break;
      }
      case SumSetOptions.Manual: {
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
      <button className="sum-button" type="button" onClick={openDialog}>
        <SvgNmrSum />
      </button>

      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={() => {
          closeDialog();
        }}
        maxWidth={1000}
      >
        <div css={[ModalStyles, styles]}>
          <Modal.Header>
            <div className="header handle">
              <span>{header}</span>
            </div>
          </Modal.Header>
          <div className="tab-content">
            <Formik
              innerRef={formRef}
              onSubmit={saveHandler}
              initialValues={{ sum: '', molecule: null }}
              validationSchema={getValidationSchema(setOption)}
            >
              <Tabs activeTab={setOption} onClick={onTabChangeHandler}>
                {isStructurePanelVisible && (
                  <Tab title="Auto" tabid={SumSetOptions.Auto}>
                    <SelectMolecule name="molecule" />
                  </Tab>
                )}

                <Tab title="Manual" tabid={SumSetOptions.Manual}>
                  <div className="manual-container">
                    <FormikInput
                      name="sum"
                      type="number"
                      nullable
                      placeholder="Enter the new value"
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </Tab>
              </Tabs>
            </Formik>
          </div>
          <div className="footer-container">
            <Button.Done
              onClick={() => formRef.current.submitForm()}
              style={{ width: '80px' }}
            >
              Set
            </Button.Done>
          </div>
        </div>
      </Modal>
    </>
  );
}
