import { Select } from '@blueprintjs/select';
import { Filters } from 'nmr-processing';
import { Button } from 'react-science/ui';

import ActionButtons from '../elements/ActionButtons.js';
import InputRange from '../elements/InputRange.js';
import { useFilter } from '../hooks/useFilter.js';
import {
  AlgorithmItem,
  algorithms,
  usePhaseCorrection,
} from '../panels/filtersPanel/Filters/hooks/usePhaseCorrection.js';

import { HeaderWrapper } from './HeaderWrapper.js';

export function SimplePhaseCorrectionOptionsPanel() {
  const filter = useFilter(Filters.phaseCorrection.id);

  const {
    handleApplyFilter,
    handleCancelFilter,
    handleRangeChange,
    defaultSelectProps,
    phaseCorrectionTypeItem,
    ph0Ref,
    ph1Ref,
  } = usePhaseCorrection(filter);

  return (
    <HeaderWrapper>
      <div style={{ padding: '0 5px' }}>
        <Select<AlgorithmItem>
          items={algorithms}
          filterable={false}
          itemsEqual="value"
          {...defaultSelectProps}
        >
          <Button
            text={phaseCorrectionTypeItem?.label}
            rightIcon="double-caret-vertical"
          />
        </Select>
      </div>
      {phaseCorrectionTypeItem?.value === 'manual' && (
        <>
          <InputRange
            ref={ph0Ref}
            name="ph0"
            label="Change PH0 (click and drag)"
            shortLabel="Ph0"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
          <InputRange
            ref={ph1Ref}
            name="ph1"
            label="Change PH1 (click and drag)"
            shortLabel="Ph1"
            style={{ width: '20%' }}
            onChange={handleRangeChange}
          />
        </>
      )}

      <ActionButtons onDone={handleApplyFilter} onCancel={handleCancelFilter} />
    </HeaderWrapper>
  );
}
