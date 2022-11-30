/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { FromTo } from 'cheminfo-types';
import { Formik } from 'formik';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FaSearchPlus } from 'react-icons/fa';

import DefaultPathLengths from '../../../data/constants/DefaultPathLengths';
import { Signal2D } from '../../../data/types/data2d';
import Button from '../../elements/Button';
import CloseButton from '../../elements/CloseButton';
import SaveButton from '../../elements/SaveButton';

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
    (formValues) => {
      void (async () => {
        const _rowData = {
          ...rowData,
          signals: formValues.signals.map((signal: Signal2D) => {
            if (
              isDefaultPathLength(
                signal.j?.pathLength as FromTo,
                rowData.tableMetaInfo.experiment,
              )
            ) {
              delete signal.j?.pathLength;
              if (signal.j && Object.keys(signal.j).length === 0) {
                delete signal.j;
              }
            }

            return signal;
          }),
        };

        await onSaveEditZoneModal(_rowData);
        handleOnClose();
      })();
    },
    [handleOnClose, onSaveEditZoneModal, rowData],
  );

  const data = useMemo(() => {
    return {
      activeTab: '0',
      signals: rowData.signals.map((signal: Signal2D): Signal2D => {
        return {
          ...signal,
          j: {
            pathLength: {
              from:
                DefaultPathLengths[rowData.tableMetaInfo.experiment]?.from || 1,
              to: DefaultPathLengths[rowData.tableMetaInfo.experiment]?.to || 1,
            },
            ...signal.j,
          },
        };
      }),
    };
  }, [rowData.signals, rowData.tableMetaInfo.experiment]);

  return (
    <div css={styles}>
      <Formik
        innerRef={formRef}
        initialValues={data}
        validationSchema={validation}
        onSubmit={handleOnSave}
      >
        <div className="header handle">
          <Button onClick={handleOnZoom} className="zoom-button">
            <FaSearchPlus title="Set to default view on range in spectrum" />
          </Button>
          <span>{`Zone and Signal edition`}</span>
          <SaveButton
            onClick={() => formRef.current.submitForm()}
            popupTitle="Save and exit"
          />
          <CloseButton onClick={handleOnClose} />
        </div>
        <SignalsForm />
      </Formik>
    </div>
  );
}

export default EditZoneModal;
