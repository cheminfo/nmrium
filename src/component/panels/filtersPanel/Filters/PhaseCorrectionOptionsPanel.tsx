import { Button } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { Filter } from 'nmr-processing';
import { CSSProperties } from 'react';

import InputRange from '../../../elements/InputRange';
import Label, { LabelStyle } from '../../../elements/Label';
import { NumberInput2 } from '../../../elements/NumberInput2';
import { Sections } from '../../../elements/Sections';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';
import {
  algorithms,
  usePhaseCorrection,
  AlgorithmItem,
} from './hooks/usePhaseCorrection';

interface PhaseCorrectionOptionsPanelProps {
  filter: Filter;
}

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
  props: PhaseCorrectionOptionsPanelProps,
) {
  const { filter } = props;
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

  return (
    <>
      <StickyHeader>
        <HeaderContainer>
          <div />
          <FilterActionButtons
            onConfirm={handleApplyFilter}
            onCancel={handleCancelFilter}
          />
        </HeaderContainer>
      </StickyHeader>
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
    </>
  );
}