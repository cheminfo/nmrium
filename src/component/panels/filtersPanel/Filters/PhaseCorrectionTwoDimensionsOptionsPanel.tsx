import { Select } from '@blueprintjs/select';
import type { CSSProperties } from 'react';
import { FaRulerHorizontal, FaRulerVertical } from 'react-icons/fa';
import { MdLooksTwo } from 'react-icons/md';
import { Button, Toolbar } from 'react-science/ui';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import InputRange from '../../../elements/InputRange.js';
import type { LabelStyle } from '../../../elements/Label.js';
import Label from '../../../elements/Label.js';
import { NumberInput2 } from '../../../elements/NumberInput2.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';
import { useFilter } from '../../../hooks/useFilter.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';
import type { AlgorithmItem } from './hooks/usePhaseCorrectionTwoDimensions.js';
import {
  phaseCorrectionalAlgorithms,
  usePhaseCorrectionTwoDimensions,
} from './hooks/usePhaseCorrectionTwoDimensions.js';

import type { BaseFilterOptionsPanelProps } from './index.js';

const inputRangeStyle: CSSProperties = {
  padding: '5px 10px',
};

const formLabelStyle: LabelStyle = {
  label: {
    flex: 2,
  },
  wrapper: {
    flex: 10,
    display: 'flex',
  },
  container: {
    marginBottom: '5px',
  },
};

export default function PhaseCorrectionTwoDimensionsOptionsPanel(
  props: BaseFilterOptionsPanelProps<
    ExtractFilterEntry<'phaseCorrectionTwoDimensions'>
  >,
) {
  const { enableEdit = true, onCancel, onConfirm, onEditStart } = props;

  const filter = useFilter('phaseCorrectionTwoDimensions');

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
    handleInputValueChange,
    value,
  } = usePhaseCorrectionTwoDimensions(filter);

  function handleConfirm(event) {
    handleApplyFilter();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    handleCancelFilter();
    onCancel?.(event);
  }

  return (
    <ReadOnly enabled={!enableEdit} onClick={onEditStart}>
      {enableEdit && (
        <StickyHeader>
          <HeaderContainer>
            <div style={{ display: 'flex' }}>
              {phaseCorrectionSelectItem?.value === 'manual' && (
                <>
                  <Label title="Direction:">
                    <Toolbar>
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
                    <Toolbar>
                      <Toolbar.Item
                        tooltip="Add the trace in both directions"
                        icon={<MdLooksTwo />}
                        active={addTracesToBothDirections}
                        onClick={handleToggleAddTraceToBothDirections}
                      />
                    </Toolbar>
                  </div>
                </>
              )}
            </div>
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
      <Sections.Body>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Label title="Algorithm:" style={formLabelStyle}>
            <Select<AlgorithmItem>
              items={phaseCorrectionalAlgorithms}
              filterable={false}
              itemsEqual="value"
              {...defaultPhaseCorrectionSelectProps}
            >
              <Button
                text={phaseCorrectionSelectItem?.label}
                endIcon="double-caret-vertical"
                variant="outlined"
              />
            </Select>
          </Label>
          {phaseCorrectionSelectItem?.value === 'manual' && (
            <>
              <Label title="PH0:" style={formLabelStyle}>
                <NumberInput2
                  name="ph0"
                  onValueChange={handleInputValueChange}
                  value={value[activeTraceDirection].ph0}
                  debounceTime={250}
                  style={{ width: '100px' }}
                />
                <InputRange
                  ref={ph0Ref}
                  name="ph0"
                  label="Change PH0 (click and drag)"
                  shortLabel="Ph0"
                  onChange={handleRangeChange}
                />
              </Label>

              <Label title="PH1:" style={formLabelStyle}>
                <NumberInput2
                  name="ph1"
                  onValueChange={handleInputValueChange}
                  value={value[activeTraceDirection].ph1}
                  debounceTime={250}
                  style={{ width: '100px' }}
                />
                <InputRange
                  ref={ph1Ref}
                  name="ph1"
                  label="Change PH1 (click and drag)"
                  shortLabel="Ph1"
                  onChange={handleRangeChange}
                  style={inputRangeStyle}
                />
              </Label>
            </>
          )}
        </div>
      </Sections.Body>
    </ReadOnly>
  );
}
