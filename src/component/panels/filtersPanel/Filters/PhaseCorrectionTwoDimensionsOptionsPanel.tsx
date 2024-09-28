/** @jsxImportSource @emotion/react */
import { Select } from '@blueprintjs/select';
import { css } from '@emotion/react';
import { Filters } from 'nmr-processing';
import { CSSProperties } from 'react';
import { FaRulerHorizontal, FaRulerVertical } from 'react-icons/fa';
import { MdLooksTwo } from 'react-icons/md';
import { Button, Toolbar } from 'react-science/ui';

import InputRange from '../../../elements/InputRange';
import Label, { LabelStyle } from '../../../elements/Label';
import { NumberInput2 } from '../../../elements/NumberInput2';
import { Sections } from '../../../elements/Sections';
import { useFilter } from '../../../hooks/useFilter';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';
import {
  phaseCorrectionalAlgorithms,
  usePhaseCorrectionTwoDimensions,
  AlgorithmItem,
} from './hooks/usePhaseCorrectionTwoDimensions';

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

export default function PhaseCorrectionTwoDimensionsOptionsPanel() {
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
    handleInputValueChange,
    value,
  } = usePhaseCorrectionTwoDimensions(filter);

  return (
    <>
      <StickyHeader>
        <HeaderContainer>
          <div style={{ display: 'flex' }}>
            {phaseCorrectionSelectItem?.value === 'manual' && (
              <>
                <Label title="Direction:">
                  <Toolbar>
                    <Toolbar.Item
                      css={css`
                        border: 1px solid #f7f7f7;
                      `}
                      tooltip="Horizontal"
                      icon={<FaRulerHorizontal />}
                      active={activeTraceDirection === 'horizontal'}
                      onClick={() => onChangeHandler('horizontal')}
                    />
                    <Toolbar.Item
                      css={css`
                        border: 1px solid #f7f7f7;
                      `}
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
            onConfirm={handleApplyFilter}
            onCancel={handleCancelFilter}
          />
        </HeaderContainer>
      </StickyHeader>
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
                rightIcon="double-caret-vertical"
                outlined
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
    </>
  );
}
