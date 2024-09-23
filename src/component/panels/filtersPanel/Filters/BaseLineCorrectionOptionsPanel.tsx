import { Button, Switch } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { Filter } from 'nmr-processing';

import Label from '../../../elements/Label';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import { Sections } from '../../../elements/Sections';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from './useBaselineCorrection';

import { formLabelStyle } from '.';

interface BaseLineCorrectionOptionsPanelProps {
  filter: Filter;
}

export default function BaseLineCorrectionOptionsPanel(
  props: BaseLineCorrectionOptionsPanelProps,
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
    formState: { isDirty },
    getValues,
  } = useBaselineCorrection(filter);

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  const disabledAction =
    filter.value &&
    !isDirty &&
    filter.value?.algorithm === getValues()?.algorithm;
  return (
    <>
      <StickyHeader>
        <HeaderContainer>
          <Switch
            style={{ margin: 0, marginLeft: '5px' }}
            innerLabelChecked="On"
            innerLabel="Off"
            {...livePreviewFieldOptions}
            onChange={(event) => {
              void onLivePreviewFieldChange(event);
              submitHandler();
            }}
            label="Live preview"
          />
          <FilterActionButtons
            onConfirm={() =>
              handleSubmit((values) => handleApplyFilter(values))()
            }
            onCancel={handleCancelFilter}
            disabledConfirm={disabledAction}
            disabledCancel={disabledAction}
          />
        </HeaderContainer>
      </StickyHeader>
      <Sections.Body>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Label title="Algorithm: " style={formLabelStyle}>
            <Select
              items={baselineCorrectionsAlgorithms}
              filterable={false}
              itemsEqual="value"
              onItemSelect={(item) => {
                onAlgorithmChange(item);
                const { values } = getBaselineData(
                  item.value,
                  props?.filter?.value || {},
                );
                reset(values);
                setTimeout(() => {
                  submitHandler();
                }, 0);
              }}
              {...defaultAlgorithmSelectProps}
            >
              <Button
                text={algorithm?.label}
                rightIcon="double-caret-vertical"
                outlined
              />
            </Select>
          </Label>

          {algorithm && algorithm?.value === 'airpls' && (
            <>
              <Label title="Max iterations:" style={formLabelStyle}>
                <NumberInput2Controller
                  control={control}
                  name="maxIterations"
                  min={0}
                  stepSize={1}
                  debounceTime={250}
                  onValueChange={() => {
                    submitHandler();
                  }}
                />
              </Label>
              <Label title="Tolerance:" style={formLabelStyle}>
                <NumberInput2Controller
                  control={control}
                  name="tolerance"
                  min={0}
                  stepSize={0.001}
                  majorStepSize={0.001}
                  minorStepSize={0.001}
                  debounceTime={250}
                  onValueChange={() => {
                    submitHandler();
                  }}
                />
              </Label>
            </>
          )}

          {algorithm &&
            ['autoPolynomial', 'polynomial'].includes(algorithm?.value) && (
              <Label
                title="Degree [1 - 6]:"
                shortTitle="Degree:"
                style={formLabelStyle}
              >
                <NumberInput2Controller
                  control={control}
                  name="degree"
                  min={1}
                  max={6}
                  debounceTime={250}
                  onValueChange={() => {
                    submitHandler();
                  }}
                />
              </Label>
            )}
        </div>
      </Sections.Body>
    </>
  );
}
