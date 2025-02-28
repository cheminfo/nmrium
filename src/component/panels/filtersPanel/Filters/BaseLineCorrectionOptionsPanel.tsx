import { Button, Switch } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import Label from '../../../elements/Label.js';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from './hooks/useBaselineCorrection.js';

import type { BaseFilterOptionsPanelProps } from './index.js';
import { formLabelStyle } from './index.js';

export default function BaseLineCorrectionOptionsPanel(
  props: BaseFilterOptionsPanelProps<ExtractFilterEntry<'baselineCorrection'>>,
) {
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;

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

  function handleConfirm(event) {
    void handleSubmit((values) => handleApplyFilter(values))();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    handleCancelFilter();
    onCancel?.(event);
  }

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  const disabledAction =
    filter.value &&
    !isDirty &&
    filter.value?.algorithm === getValues()?.algorithm;
  return (
    <ReadOnly enabled={!enableEdit} onClick={onEditStart}>
      {enableEdit && (
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
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={disabledAction}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
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
                endIcon="double-caret-vertical"
                variant="outlined"
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
    </ReadOnly>
  );
}
