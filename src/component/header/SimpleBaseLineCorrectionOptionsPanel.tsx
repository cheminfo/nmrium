import { Checkbox } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { memo } from 'react';
import { Button } from 'react-science/ui';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import ActionButtons from '../elements/ActionButtons.js';
import Label from '../elements/Label.js';
import { NumberInput2Controller } from '../elements/NumberInput2Controller.js';
import { useFilter } from '../hooks/useFilter.js';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from '../panels/filtersPanel/Filters/hooks/useBaselineCorrection.js';

import { headerLabelStyle } from './Header.js';
import { HeaderWrapper } from './HeaderWrapper.js';

interface BaseLineCorrectionInnerPanelProps {
  filter: ExtractFilterEntry<'baselineCorrection'> | null;
}
function BaseLineCorrectionInnerPanel(
  props: BaseLineCorrectionInnerPanelProps,
) {
  const { filter } = props;
  const {
    register,
    reset,
    onAlgorithmChange,
    submitHandler,
    handleSubmit,
    handleApplyFilter,
    handleCancelFilter,
    control,
    algorithm,
    defaultAlgorithmSelectProps,
  } = useBaselineCorrection(filter);
  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register(`livePreview`);

  return (
    <HeaderWrapper>
      <Label title="Algorithm: " style={headerLabelStyle}>
        <Select
          items={baselineCorrectionsAlgorithms}
          filterable={false}
          itemsEqual="value"
          onItemSelect={(item) => {
            onAlgorithmChange(item);
            const { values } = getBaselineData(item.value, filter?.value);
            reset(values);
            setTimeout(() => {
              submitHandler();
            }, 0);
          }}
          {...defaultAlgorithmSelectProps}
        >
          <Button text={algorithm?.label} endIcon="double-caret-vertical" />
        </Select>
      </Label>

      {algorithm?.value === 'airpls' && (
        <div style={{ display: 'flex' }}>
          <Label title="Max iterations:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="maxIterations"
              min={0}
              stepSize={1}
              style={{ width: '60px' }}
              debounceTime={250}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Tolerance:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="tolerance"
              min={0}
              stepSize={0.001}
              majorStepSize={0.001}
              minorStepSize={0.001}
              style={{ width: '60px' }}
              debounceTime={250}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
        </div>
      )}

      {algorithm?.value === 'polynomial' && (
        <Label
          title="Degree [1 - 6]:"
          shortTitle="Degree:"
          style={headerLabelStyle}
        >
          <NumberInput2Controller
            control={control}
            name="degree"
            min={1}
            max={6}
            style={{ width: '60px' }}
            debounceTime={250}
            onValueChange={() => {
              submitHandler();
            }}
          />
        </Label>
      )}
      {algorithm?.value === 'whittaker' && (
        <>
          <Label title="Max iterations:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="maxIterations"
              min={1}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Lambda:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="lambda"
              min={1}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>

          <Label title="Scale:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="scale"
              min={1}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
        </>
      )}

      {algorithm?.value === 'bernstein' && (
        <>
          <Label title="Max iterations:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="maxIterations"
              min={1}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Tolerance:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="tolerance"
              min={0}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Factor Std:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="factorStd"
              min={0}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Learning Rate:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="learningRate"
              min={0}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Min Weight:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="minWeight"
              min={0}
              debounceTime={250}
              style={{ width: '60px' }}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
        </>
      )}

      <Label title="Live preview" style={headerLabelStyle}>
        <Checkbox
          style={{ margin: 0 }}
          {...otherLivePreviewRegisterOptions}
          onChange={(event) => {
            void onLivePreviewChange(event);
            submitHandler();
          }}
        />
      </Label>
      <ActionButtons
        onDone={() => handleSubmit((values) => handleApplyFilter(values))()}
        onCancel={handleCancelFilter}
      />
    </HeaderWrapper>
  );
}

const MemoizedBaseLineCorrectionPanel = memo(BaseLineCorrectionInnerPanel);

export function SimpleBaseLineCorrectionOptionsPanel() {
  const filter = useFilter('baselineCorrection');

  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
