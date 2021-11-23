/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FaSearchPlus } from 'react-icons/fa';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths';
import Button from '../../elements/Button';
import CloseButton from '../../elements/CloseButton';
import SaveButton from '../../elements/SaveButton';
import FormikForm from '../../elements/formik/FormikForm';

import SignalsForm from './SignalsForm';
import useRangeFormValidation from './validation/EditZoneValidation';
import isDefaultPathLength from './validation/isDefaultPathLength';

const styles = css`
  width: 500px;
  height: 250px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
    span {
      color: #464646;
      font-size: 15px;
      flex: 1;
      border-left: 1px solid #ececec;
      padding-left: 6px;
    }

    button {
      background-color: transparent;
      border: none;
      padding: 5px;

      svg {
        height: 16px;
      }
    }
  }
  .container {
    display: flex;
    margin: 30px 5px;
  }
`;

interface EditZoneModalProps {
  onSaveEditZoneModal: (value: any) => Promise<void> | null | void;
  onCloseEditZoneModal: () => void;
  onZoomEditZoneModal: (value: any) => void;
  rowData: any;
}

function EditZoneModal({
  onSaveEditZoneModal = () => null,
  onCloseEditZoneModal = () => null,
  onZoomEditZoneModal = () => null,
  rowData,
}: EditZoneModalProps) {
  const formRef = useRef<any>(null);
  const validation = useRangeFormValidation();

  const handleOnZoom = useCallback(() => {
    onZoomEditZoneModal(rowData);
  }, [onZoomEditZoneModal, rowData]);

  useEffect(() => {
    handleOnZoom();
  }, [handleOnZoom]);

  const handleOnClose = useCallback(() => {
    onCloseEditZoneModal();
  }, [onCloseEditZoneModal]);

  const handleOnSave = useCallback(
    async (formValues) => {
      const _rowData = {
        ...rowData,
        signals: formValues.signals.map((signal) => {
          if (
            isDefaultPathLength(
              signal.pathLength,
              rowData.tableMetaInfo.experiment,
            )
          ) {
            delete signal.pathLength;
          } else {
            signal.pathLength.source = 'manual';
          }
          return signal;
        }),
      };

      await onSaveEditZoneModal(_rowData);
      handleOnClose();
    },
    [handleOnClose, onSaveEditZoneModal, rowData],
  );

  const data = useMemo(() => {
    return {
      activeTab: '0',
      signals: rowData.signals.map((signal) => {
        return {
          pathLength: {
            min: DefaultPathLengths[rowData.tableMetaInfo.experiment].min || 1,
            max: DefaultPathLengths[rowData.tableMetaInfo.experiment].max || 1,
            source: 'default',
          },
          ...signal,
        };
      }),
    };
  }, [rowData.signals, rowData.tableMetaInfo.experiment]);

  return (
    <div css={styles}>
      <FormikForm
        ref={formRef}
        initialValues={data}
        validationSchema={validation}
        onSubmit={handleOnSave}
      >
        <div className="header handle">
          <Button onClick={handleOnZoom} className="zoom-button">
            <FaSearchPlus title="Set to default view on range in spectrum" />
          </Button>
          <span>{` Zone and Signal edition`}</span>
          <SaveButton
            onClick={() => formRef.current.submitForm()}
            popupTitle="Save and exit"
          />
          <CloseButton onClick={handleOnClose} />
        </div>
        <SignalsForm />
      </FormikForm>
    </div>
  );
}

export default EditZoneModal;
