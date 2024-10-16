/** @jsxImportSource @emotion/react */
import { Select } from '@blueprintjs/select';
import { Filters } from 'nmr-processing';
import { FaRulerHorizontal, FaRulerVertical } from 'react-icons/fa';
import { MdLooksTwo } from 'react-icons/md';
import { Button, Toolbar } from 'react-science/ui';

import ActionButtons from '../elements/ActionButtons';
import InputRange from '../elements/InputRange';
import Label from '../elements/Label';
import { useFilter } from '../hooks/useFilter';
import {
  phaseCorrectionalAlgorithms,
  usePhaseCorrectionTwoDimensions,
  AlgorithmItem,
} from '../panels/filtersPanel/Filters/hooks/usePhaseCorrectionTwoDimensions';

import { headerLabelStyle } from './Header';
import { HeaderWrapper } from './HeaderWrapper';

export function SimplePhaseCorrectionTwoDimensionsPanel() {
  const filter = useFilter(Filters.phaseCorrectionTwoDimensions.id);
  const {
    ph0Ref,
    ph1Ref,
    phaseCorrectionSelectItem,
    defaultPhaseCorrectionSelectProps,
    activeTraceDirection,
    addTracesToBothDirections,
    handleRangeChange,
    handleApplyFilter,
    handleCancelFilter,
    handleToggleAddTraceToBothDirections,
    onChangeHandler,
  } = usePhaseCorrectionTwoDimensions(filter);

  return (
    <HeaderWrapper style={{ padding: '0 5px' }}>
      <div style={{ padding: '0 5px' }}>
        <Select<AlgorithmItem>
          items={phaseCorrectionalAlgorithms}
          filterable={false}
          itemsEqual="value"
          {...defaultPhaseCorrectionSelectProps}
        >
          <Button
            text={phaseCorrectionSelectItem?.label}
            rightIcon="double-caret-vertical"
          />
        </Select>
      </div>
      {phaseCorrectionSelectItem?.value === 'manual' && (
        <>
          <Label title="Direction:" style={headerLabelStyle}>
            <Toolbar minimal>
              <Toolbar.Item
                tooltip="Horizontal"
                icon={<FaRulerHorizontal />}
                active={activeTraceDirection === 'horizontal'}
                onClick={() => onChangeHandler('horizontal')}
              />
              <Toolbar.Item
                tooltip="Vertical"
                icon={<FaRulerVertical />}
                active={activeTraceDirection === 'vertical'}
                onClick={() => onChangeHandler('vertical')}
              />
            </Toolbar>
          </Label>
          <div style={{ paddingRight: '5px' }}>
            <Toolbar minimal>
              <Toolbar.Item
                tooltip="Add the trace in both directions"
                icon={<MdLooksTwo />}
                active={addTracesToBothDirections}
                onClick={handleToggleAddTraceToBothDirections}
              />
            </Toolbar>
          </div>
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
