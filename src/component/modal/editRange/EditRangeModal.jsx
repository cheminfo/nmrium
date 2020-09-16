import { jsx, css } from '@emotion/core';
/** @jsx jsx */
import { Form, Formik } from 'formik';
import lodash from 'lodash';
import { useCallback, useEffect, useMemo } from 'react';
import { FaTimes, FaSearchPlus, FaRegSave } from 'react-icons/fa';

import Button from '../../elements/Button';
import {
  hasCouplingConstant,
  translateMultiplet,
} from '../../panels/extra/utilities/MultiplicityUtilities';

import SignalsForm from './forms/components/SignalsForm';
import EditRangeValidation from './forms/validation/EditRangeValidation';

const styles = css`
  overflow: auto;
  width: 600px;
  height: 500px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    span {
      color: #464646;
      font-size: 15px;
      flex: 1;
    }

    button {
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }
  }
  .container {
    display: flex;
    margin: 30px 5px;
    input,
    button {
      padding: 5px;
      border: 1px solid gray;
      border-radius: 5px;
      height: 36px;
      margin: 2px;
    }
    input {
      flex: 10;
    }
    button {
      flex: 2;
      color: white;
      background-color: gray;
    }
  }
`;

const EditRangeModal = ({
  onSaveEditRangeModal,
  onCloseEditRangeModal,
  onZoomEditRangeModal,
  rangeData,
}) => {
  const handleOnZoom = useCallback(() => {
    onZoomEditRangeModal(rangeData);
  }, [onZoomEditRangeModal, rangeData]);

  useEffect(() => {
    handleOnZoom();
  }, [handleOnZoom]);

  const handleOnClose = useCallback(() => {
    onCloseEditRangeModal();
  }, [onCloseEditRangeModal]);

  const getCouplings = useCallback(
    (couplings) =>
      couplings
        .filter((coupling) => coupling.coupling !== '')
        .map((coupling) => {
          return {
            ...coupling,
            multiplicity: translateMultiplet(coupling.multiplicity),
          };
        }),
    [],
  );

  const getSignals = useCallback(
    (signals) => {
      return signals.map((_signal) => {
        return {
          ..._signal,
          multiplicity: _signal.j
            .map((_coupling) => translateMultiplet(_coupling.multiplicity))
            .join(''),
          j: getCouplings(_signal.j),
        };
      });
    },
    [getCouplings],
  );

  const handleOnSave = useCallback(
    async (formValues) => {
      const _range = lodash.cloneDeep(rangeData);
      _range.signal = getSignals(formValues.signals);
      await onSaveEditRangeModal(_range);
      handleOnClose();
    },
    [getSignals, handleOnClose, onSaveEditRangeModal, rangeData],
  );

  const initialStateSignals = useMemo(() => {
    return rangeData.signal.map((_signal) => {
      // counter within j array to access to right j values
      let counterJ = 0;
      const couplings = [];
      let coupling;
      _signal.multiplicity.split('').forEach((_multiplicity) => {
        if (hasCouplingConstant(_multiplicity)) {
          coupling = { ..._signal.j[counterJ] };
          counterJ++;
        } else {
          coupling = { multiplicity: _multiplicity, coupling: '' };
        }
        coupling.multiplicity = translateMultiplet(coupling.multiplicity);
        couplings.push(coupling);
      });
      return { ..._signal, j: couplings };
    });
  }, [rangeData.signal]);

  const isSaveButtonDisabled = useCallback((errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      if (
        // ignore non-relevant newSignalDelta field
        errorKeys.length === 1 &&
        errorKeys[0] === 'newSignalDelta'
      ) {
        return false;
      }
      return true;
    }
    return false;
  }, []);

  return (
    <div css={styles}>
      {rangeData && (
        <Formik
          initialValues={{
            signals: initialStateSignals,
            newSignalDelta: (rangeData.from + rangeData.to) / 2,
            activeTab: '0',
          }}
          validate={(values) => EditRangeValidation(values, rangeData)}
          onSubmit={(values, { setSubmitting }) => {
            handleOnSave(values);
            setSubmitting(false);
          }}
        >
          {({ values, errors }) => {
            return (
              <Form>
                <div className="header">
                  <span>Range Information and Editing</span>
                  <Button
                    onClick={() => handleOnSave(values)}
                    className="save-button"
                    disabled={isSaveButtonDisabled(errors)}
                  >
                    <FaRegSave title="Save and exit" />
                  </Button>
                  <Button onClick={handleOnZoom} className="zoom-button">
                    <FaSearchPlus title="Set to default view on range in spectrum" />
                  </Button>
                  <Button onClick={handleOnClose} title="Close">
                    <FaTimes />
                  </Button>
                </div>
                <SignalsForm />
              </Form>
            );
          }}
        </Formik>
      )}
    </div>
  );
};

EditRangeModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
  onZoom: () => {
    return null;
  },
};

export default EditRangeModal;
