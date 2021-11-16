import {
  useMemo,
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import * as Filters from '../../data/Filters';
import { Filter } from '../../data/FiltersManager';
import { Data1D, Datum1D } from '../../data/types/data1d';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import Input from '../elements/Input';
import InputRange from '../elements/InputRange';
import Select from '../elements/Select';
import useSpectrum from '../hooks/useSpectrum';
import {
  APPLY_MANUAL_PHASE_CORRECTION_FILTER,
  APPLY_AUTO_PHASE_CORRECTION_FILTER,
  CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
  RESET_SELECTED_TOOL,
  APPLY_ABSOLUTE_FILTER,
} from '../reducer/types/Types';

const styles: Record<
  'container' | 'input' | 'actionButton' | 'select',
  CSSProperties
> = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },
  input: {
    width: '100px',
  },
  actionButton: {
    height: '100%',
    width: '60px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px',
    userSelect: 'none',
  },
  select: {
    marginLeft: '5px',
    marginRight: '10px',
    border: 'none',
    height: '20px',
  },
};

const phaseCorrectionTypes = {
  manual: 'manual',
  automatic: 'automatic',
  absolute: 'absolute',
};

const algorithms = [
  {
    key: phaseCorrectionTypes.manual,
    label: 'Manual',
    value: phaseCorrectionTypes.manual,
  },
  {
    key: phaseCorrectionTypes.automatic,
    label: 'Automatic',
    value: phaseCorrectionTypes.automatic,
  },
  {
    key: phaseCorrectionTypes.absolute,
    label: 'Absolute',
    value: phaseCorrectionTypes.absolute,
  },
];

interface ManualPhaseCorrectionPanelInnerProps {
  data: Data1D;
  pivot: { index: number };
  filter: Filter | null;
}

function ManualPhaseCorrectionPanelInner({
  data,
  pivot,
  filter,
}: ManualPhaseCorrectionPanelInnerProps) {
  const dispatch = useDispatch();
  const [value, setValue] = useState({ ph0: 0, ph1: 0 });
  const valueRef = useRef({ ph0: 0, ph1: 0 });

  const ph0Ref = useRef<any>();
  const ph1Ref = useRef<any>();

  const [phaseCorrectionType, setPhaseCorrectionType] = useState(
    phaseCorrectionTypes.manual,
  );

  useEffect(() => {
    if (filter) {
      valueRef.current = filter.value;
      setValue(filter.value);
      ph0Ref.current.setValue(filter.value.ph0);
      ph1Ref.current.setValue(filter.value.ph1);
    } else {
      ph0Ref.current.setValue(valueRef.current.ph0);
      ph1Ref.current.setValue(valueRef.current.ph1);
    }
  }, [filter]);

  const handleApplyFilter = useCallback(() => {
    switch (phaseCorrectionType) {
      case phaseCorrectionTypes.automatic: {
        dispatch({
          type: APPLY_AUTO_PHASE_CORRECTION_FILTER,
        });
        break;
      }

      case phaseCorrectionTypes.manual: {
        dispatch({
          type: APPLY_MANUAL_PHASE_CORRECTION_FILTER,
          value,
        });
        break;
      }
      case phaseCorrectionTypes.absolute: {
        dispatch({
          type: APPLY_ABSOLUTE_FILTER,
        });
        break;
      }
      default:
        break;
    }
  }, [dispatch, phaseCorrectionType, value]);

  const calcPhaseCorrectionHandler = useCallback(
    (newValues, filedName) => {
      if (filedName === 'ph1' && data.re) {
        const diff0 = newValues.ph0 - valueRef.current.ph0;
        const diff1 = newValues.ph1 - valueRef.current.ph1;
        newValues.ph0 += diff0 - (diff1 * pivot?.index) / data.re.length;
      }

      dispatch({
        type: CALCULATE_MANUAL_PHASE_CORRECTION_FILTER,
        value: newValues,
      });
    },
    [data.re, dispatch, pivot?.index],
  );

  const handleInput = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (e.target) {
        const newValue = { ...valueRef.current, [name]: value };
        if (String(value).trim() !== '-') {
          calcPhaseCorrectionHandler(newValue, name);
        }
        valueRef.current = newValue;
        setValue(valueRef.current);
      }
    },
    [calcPhaseCorrectionHandler],
  );

  const handleRangeChange = useCallback(
    (e) => {
      const newValue = { ...valueRef.current, [e.name]: e.value };
      calcPhaseCorrectionHandler(newValue, e.name);
      valueRef.current = newValue;
      setValue(valueRef.current);
    },
    [calcPhaseCorrectionHandler],
  );

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  const onChangeHandler = useCallback((val) => {
    setPhaseCorrectionType(val);
  }, []);

  return (
    <div style={styles.container}>
      <Select
        onChange={onChangeHandler}
        data={algorithms}
        defaultValue={phaseCorrectionTypes.manual}
        style={styles.select}
      />

      {phaseCorrectionType === phaseCorrectionTypes.manual && (
        <>
          <Input
            label="PH0:"
            name="ph0"
            style={{ input: styles.input }}
            onChange={handleInput}
            value={value.ph0}
            type="number"
            debounceTime={500}
          />
          <Input
            label="PH1:"
            name="ph1"
            style={{ input: styles.input }}
            onChange={handleInput}
            value={value.ph1}
            type="number"
            debounceTime={500}
          />

          <InputRange
            ref={ph0Ref}
            name="ph0"
            label="Change Ph0 By mouse click and drag"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
          <InputRange
            ref={ph1Ref}
            name="ph1"
            label="Change Ph1 By mouse click and drag"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
        </>
      )}

      <button
        type="button"
        style={styles.actionButton}
        onClick={handleApplyFilter}
      >
        Apply
      </button>
      <button
        type="button"
        style={styles.actionButton}
        onClick={handleCancelFilter}
      >
        Cancel
      </button>
      {/* <button
        type="button"
        style={styles.actionButton}
        onClick={handleAutoFilter}
      >
        Auto
      </button> */}
    </div>
  );
}

const MemoizedManualPhaseCorrectionPanel = memo(
  ManualPhaseCorrectionPanelInner,
);

const emptyData = { datum: {}, filter: null };
export default function ManualPhaseCorrectionPanel() {
  const {
    toolOptions: {
      data: { pivot },
    },
  } = useChartData();

  const { data, filters } = useSpectrum(emptyData) as Datum1D;

  const filter = useMemo(() => {
    return (
      filters.find((filter) => filter.name === Filters.phaseCorrection.id) ||
      null
    );
  }, [filters]);

  return <MemoizedManualPhaseCorrectionPanel {...{ data, filter, pivot }} />;
}
