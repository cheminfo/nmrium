import { Select } from '@blueprintjs/select';
import { memo, useCallback } from 'react';
import type { Control } from 'react-hook-form';
import { Button } from 'react-science/ui';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import { useFilterSyncOptions } from '../context/FilterSyncOptionsContext.tsx';
import ActionButtons from '../elements/ActionButtons.js';
import Label from '../elements/Label.js';
import { NumberInputField } from '../elements/NumberInputField.js';
import { useFilter } from '../hooks/useFilter.js';
import type {
  AirplsOptions,
  AlgorithmFieldProps,
  AlgorithmOptions,
  BaselineAlgorithmFieldsMap,
  BernsteinOptions,
  CubicOptions,
  PolynomialOptions,
  WhittakerOptions,
} from '../panels/filtersPanel/Filters/base/baselineCorrectionFields.ts';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from '../panels/filtersPanel/Filters/hooks/useBaselineCorrection.js';

import { headerLabelStyle } from './Header.js';
import { HeaderWrapper } from './HeaderWrapper.js';

const BaselineAlgorithmFields: BaselineAlgorithmFieldsMap = {
  airpls: AirplsFields,
  polynomial: PolynomialFields,
  whittaker: WhittakerFields,
  bernstein: BernsteinFields,
  cubic: CubicFields,
};

interface BaseLineCorrectionInnerPanelProps {
  filter: ExtractFilterEntry<'baselineCorrection'> | null;
}

function BaseLineCorrectionInnerPanel({
  filter,
}: BaseLineCorrectionInnerPanelProps) {
  const {
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

  const { sharedFilterOptions } = useFilterSyncOptions<AlgorithmOptions>();

  const handleAlgorithmSelect = useCallback(
    (item: (typeof baselineCorrectionsAlgorithms)[number]) => {
      onAlgorithmChange(item);
      const { values } = getBaselineData(item.value, filter?.value);
      const { anchors = [] } = sharedFilterOptions || {};
      const options = { ...values, anchors };
      reset(options);
      setTimeout(() => handleApplyFilter(options, 'onChange'), 0);
    },
    [
      onAlgorithmChange,
      filter?.value,
      sharedFilterOptions,
      reset,
      handleApplyFilter,
    ],
  );

  const handleDone = useCallback(
    () => handleSubmit((values) => handleApplyFilter(values))(),
    [handleSubmit, handleApplyFilter],
  );

  const AlgorithmFields = algorithm?.value
    ? BaselineAlgorithmFields[algorithm.value]
    : null;

  return (
    <HeaderWrapper>
      <Label title="Algorithm: " style={headerLabelStyle}>
        <Select
          items={baselineCorrectionsAlgorithms}
          filterable={false}
          itemsEqual="value"
          onItemSelect={handleAlgorithmSelect}
          {...defaultAlgorithmSelectProps}
        >
          <Button text={algorithm?.label} endIcon="double-caret-vertical" />
        </Select>
      </Label>

      {AlgorithmFields && (
        <AlgorithmFields
          control={control as Control<any>}
          onValueChange={submitHandler}
        />
      )}
      <ActionButtons onDone={handleDone} onCancel={handleCancelFilter} />
    </HeaderWrapper>
  );
}

function AirplsFields({
  control,
  onValueChange,
}: AlgorithmFieldProps<AirplsOptions>) {
  return (
    <div style={{ display: 'flex' }}>
      <NumberInputField
        labelProps={{ title: 'Lambda:', style: headerLabelStyle }}
        name="lambda"
        control={control}
        min={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Tolerance:', style: headerLabelStyle }}
        name="tolerance"
        control={control}
        min={0}
        stepSize={0.001}
        majorStepSize={0.001}
        minorStepSize={0.001}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
    </div>
  );
}

function PolynomialFields({
  control,
  onValueChange,
}: AlgorithmFieldProps<PolynomialOptions>) {
  return (
    <NumberInputField
      labelProps={{ title: 'Degree [1 - 20]:', style: headerLabelStyle }}
      name="degree"
      control={control}
      min={1}
      max={20}
      onValueChange={onValueChange}
      style={{ width: '60px' }}
      debounceTime={250}
    />
  );
}

function WhittakerFields({
  control,
  onValueChange,
}: AlgorithmFieldProps<WhittakerOptions>) {
  return (
    <NumberInputField
      labelProps={{ title: 'Lambda:', style: headerLabelStyle }}
      name="lambda"
      control={control}
      min={1}
      onValueChange={onValueChange}
      style={{ width: '60px' }}
      debounceTime={250}
    />
  );
}

function CubicFields({
  control,
  onValueChange,
}: AlgorithmFieldProps<CubicOptions>) {
  return (
    <div style={{ display: 'flex' }}>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: headerLabelStyle }}
        name="maxIterations"
        control={control}
        min={0}
        stepSize={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
    </div>
  );
}

function BernsteinFields({
  control,
  onValueChange,
}: AlgorithmFieldProps<BernsteinOptions>) {
  return (
    <NumberInputField
      labelProps={{ title: 'Degree:', style: headerLabelStyle }}
      name="degree"
      control={control}
      min={1}
      onValueChange={onValueChange}
      style={{ width: '60px' }}
      debounceTime={250}
    />
  );
}

const MemoizedBaseLineCorrectionPanel = memo(BaseLineCorrectionInnerPanel);

export function SimpleBaseLineCorrectionOptionsPanel() {
  const filter = useFilter('baselineCorrection');
  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
