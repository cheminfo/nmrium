import { CSSProperties, useEffect, useRef, useState } from 'react';

import * as Filters from '../../data/Filters';
import { Data1D } from '../../data/types/data1d';
import generateNumbersPowerOfX from '../../data/utilities/generateNumbersPowerOfX';
import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Select from '../elements/Select';
import { useFilter } from '../hooks/useFilter';
import {
  APPLY_ZERO_FILLING_FILTER,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';

const styles: Record<'container' | 'input' | 'label', CSSProperties> = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },

  input: {
    height: '100%',
    width: '80px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },

  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
};

const Sizes = generateNumbersPowerOfX(8, 21);

function ZeroFillingOptionsPanel() {
  const dispatch = useDispatch();
  const { data, activeSpectrum } = useChartData();
  const sizeTextInputRef = useRef<any>();
  const [size, setSize] = useState<number>();
  const filter = useFilter(Filters.zeroFilling.id);

  const handleApplyFilter = () => {
    dispatch({
      type: APPLY_ZERO_FILLING_FILTER,
      payload: {
        size: Number(sizeTextInputRef.current.value),
      },
    });
  };

  const handleCancelFilter = () => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  };

  useEffect(() => {
    if (filter) {
      setSize(filter.value);
    } else if (data && activeSpectrum?.id) {
      const spectraSize =
        2 **
        Math.round(
          Math.log2((data[activeSpectrum.index].data as Data1D).x.length),
        );

      setSize(spectraSize || 256);
    }
  }, [activeSpectrum, data, filter]);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Size: </span>
      <Select
        ref={sizeTextInputRef}
        data={Sizes}
        style={{ marginLeft: 10, marginRight: 10 }}
        value={size}
        onChange={(value) => setSize(Number(value))}
      />
      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </div>
  );
}

export default ZeroFillingOptionsPanel;
