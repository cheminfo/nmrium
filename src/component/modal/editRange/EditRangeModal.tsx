/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { v4 } from '@lukeed/uuid';
import { Formik } from 'formik';
import { Spectrum1D } from 'nmr-load-save';
import { Range, splitPatterns, translateMultiplet } from 'nmr-processing';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { FaSearchPlus } from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/Button';
import CloseButton from '../../elements/CloseButton';
import SaveButton from '../../elements/SaveButton';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { hasCouplingConstant } from '../../panels/extra/utilities/MultiplicityUtilities';
import { formatNumber } from '../../utility/formatNumber';

import SignalsForm from './forms/components/SignalsForm';
import editRangeFormValidation from './forms/validation/EditRangeValidation';

const styles = css`
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
    align-items: center;

    .title {
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
`;

interface EditRangeModalProps {
  onSave: (value: any) => Promise<void> | null | void;
  onClose?: () => void;
  onRest: (originalRange: Range) => void;
  onZoom: (value: any) => void;
  rangeId: string;
}

interface Coupling {
  multiplicity: any;
  coupling: string | number;
}

function EditRangeModal({
  onSave,
  onClose,
  onZoom,
  onRest,
  rangeId,
}: EditRangeModalProps) {
  const formRef = useRef<any>(null);
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const dispatch = useDispatch();
  const range = useRange(rangeId);
  const originalRangeRef = useRef(range);
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  const handleOnZoom = useCallback(() => {
    onZoom(range);
  }, [onZoom, range]);

  useEffect(() => {
    dispatch({
      type: 'SET_SELECTED_TOOL',
      payload: {
        selectedTool: 'zoom',
      },
    });
    if (!range) {
      onClose?.();
    }
  }, [activeTab, dispatch, onClose, range]);

  const handleOnClose = useCallback(() => {
    dispatch({
      type: 'SET_SELECTED_TOOL',
      payload: {
        selectedTool: 'zoom',
      },
    });
    onRest(originalRangeRef.current);
  }, [dispatch, onRest]);

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
      return signals.map((signal) => {
        return {
          id: v4(),
          ...signal,
          multiplicity: signal.js
            .map((_coupling) => translateMultiplet(_coupling.multiplicity))
            .join(''),
          js: getCouplings(signal?.js || []),
        };
      });
    },
    [getCouplings],
  );

  const handleOnSave = useCallback(
    (formValues) => {
      void (async () => {
        const _range = { ...range };
        _range.signals = getSignals(formValues.signals);
        await onSave(_range);
      })();
    },
    [getSignals, onSave, range],
  );

  const data = useMemo(() => {
    const signals = range?.signals.map((signal) => {
      // counter within j array to access to right j values

      let counterJ = 0;
      const couplings: Coupling[] = [];
      if (signal.multiplicity) {
        for (const multiplicity of splitPatterns(signal.multiplicity)) {
          let js: Coupling = {
            multiplicity,
            coupling: '',
          };
          if (hasCouplingConstant(multiplicity) && signal?.js.length > 0) {
            js = { ...signal.js[counterJ] } as Coupling;
            js.coupling = Number(
              formatNumber(js.coupling, rangesPreferences.coupling.format),
            );
            counterJ++;
          }
          js.multiplicity = translateMultiplet(js.multiplicity || multiplicity);
          couplings.push(js);
        }
      }
      return { ...signal, js: couplings };
    });
    return { activeTab: '0', signals };
  }, [range?.signals, rangesPreferences]);

  const changeHandler = useCallback(
    (values) => {
      const signals = getSignals(values.signals);

      if (
        JSON.stringify(range?.signals, (key, value) => {
          if (key !== 'id') return value;
        }) !==
        JSON.stringify(signals, (key, value) => {
          if (key !== 'id') return value;
        })
      ) {
        dispatch({
          type: 'UPDATE_RANGE',
          payload: { range: { ...range, signals } },
        });
      }
    },
    [dispatch, getSignals, range],
  );

  if (!rangesPreferences || !range) {
    return;
  }

  return (
    <div css={styles}>
      <div className="header handle">
        <Button.Action
          onClick={handleOnZoom}
          fill="outline"
          style={{ fontSize: '14' }}
          color={{ base: '#5f5f5f', hover: 'white' }}
        >
          <FaSearchPlus title="Set to default view on range in spectrum" />
        </Button.Action>
        <span className="title">
          {` Range and Signal edition: ${formatNumber(
            range?.from,
            rangesPreferences.from.format,
          )} ppm to ${formatNumber(
            range?.to,
            rangesPreferences.to.format,
          )} ppm`}
        </span>
        <SaveButton
          onClick={() => formRef.current.submitForm()}
          popupTitle="Save and Exit"
        />

        <CloseButton onClick={handleOnClose} />
      </div>
      <Formik
        innerRef={formRef}
        initialValues={data}
        validationSchema={editRangeFormValidation}
        onSubmit={handleOnSave}
      >
        <>
          <SignalsForm range={range} preferences={rangesPreferences} />
          <FormikOnChange onChange={changeHandler} />
        </>
      </Formik>
    </div>
  );
}

function useRange(rangeId: string) {
  const { ranges } = useSpectrum({
    ranges: { values: [] },
  }) as Spectrum1D;

  const index = ranges.values.findIndex(
    (rangeRecord) => rangeRecord.id === rangeId,
  );
  return ranges.values[index];
}

export default EditRangeModal;
