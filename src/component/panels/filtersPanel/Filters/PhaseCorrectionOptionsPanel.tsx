import { Button } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import type { CSSProperties } from 'react';

import InputRange from '../../../elements/InputRange.js';
import type { LabelStyle } from '../../../elements/Label.js';
import Label from '../../../elements/Label.js';
import { NumberInput2 } from '../../../elements/NumberInput2.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';
import type { AlgorithmItem } from './hooks/usePhaseCorrection.js';
import { algorithms, usePhaseCorrection } from './hooks/usePhaseCorrection.js';

import type { BaseFilterOptionsPanelProps } from './index.js';
import type { Filter1DOptions } from 'nmr-processing';

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

export default function PhaseCorrectionOptionsPanel(
  props: BaseFilterOptionsPanelProps<
    Extract<Filter1DOptions, { name: 'phaseCorrection' }>
  >,
) {
  const { filter, enableEdit = true, onCancel, onConfirm } = props;
  const {
    handleApplyFilter,
    handleCancelFilter,
    handleInput,
    handleRangeChange,
    value,
    defaultSelectProps,
    phaseCorrectionTypeItem,
    ph0Ref,
    ph1Ref,
  } = usePhaseCorrection(filter);

  function handleConfirm(event) {
    handleApplyFilter();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    handleCancelFilter();
    onCancel?.(event);
  }

  return (
    <ReadOnly enabled={!enableEdit}>
      {enableEdit && (
        <StickyHeader>
          <HeaderContainer>
            <div />
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
              items={algorithms}
              filterable={false}
              itemsEqual="value"
              {...defaultSelectProps}
            >
              <Button
                text={phaseCorrectionTypeItem?.label}
                rightIcon="double-caret-vertical"
                outlined
              />
            </Select>
          </Label>
          {phaseCorrectionTypeItem?.value === 'manual' && (
            <>
              <Label title="PH0:" style={formLabelStyle}>
                <NumberInput2
                  name="ph0"
                  onValueChange={handleInput}
                  value={value.ph0}
                  debounceTime={250}
                  style={{ width: '100px' }}
                />
                <InputRange
                  ref={ph0Ref}
                  name="ph0"
                  label="Change PH0 (click and drag)"
                  onChange={handleRangeChange}
                  style={inputRangeStyle}
                />
              </Label>
              <Label title="PH1:" style={formLabelStyle}>
                <NumberInput2
                  name="ph1"
                  onValueChange={handleInput}
                  value={value.ph1}
                  debounceTime={250}
                  style={{ width: '100px' }}
                />
                <InputRange
                  ref={ph1Ref}
                  name="ph1"
                  label="Change PH1 (click and drag)"
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
