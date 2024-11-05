import { Switch } from '@blueprintjs/core';

import Label from '../../../elements/Label.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';
import { Select2Controller } from '../../../elements/Select2Controller.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';
import { useZeroFilling, zeroFillingSizes } from './hooks/useZeroFilling.js';

import type { BaseFilterOptionsPanelProps } from './index.js';
import type { Filter1DOptions } from 'nmr-processing';

export default function ZeroFillingOptionsPanel(
  props: BaseFilterOptionsPanelProps<
    Extract<Filter1DOptions, { name: 'zeroFilling' }>
  >,
) {
  const { filter, enableEdit = true, onCancel, onConfirm } = props;
  const {
    control,
    submitHandler,
    register,
    handleCancelFilter,
    formState: { isDirty },
  } = useZeroFilling(filter);

  function handleConfirm(event) {
    submitHandler();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    handleCancelFilter();
    onCancel?.(event);
  }

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  const disabledAction = filter.value && !isDirty;
  return (
    <ReadOnly enabled={!enableEdit}>
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
                submitHandler('onChange');
              }}
              label="Live preview"
            />
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={disabledAction}
              disabledCancel={disabledAction}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
      <Sections.Body>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Label title="Size:">
            <Select2Controller
              control={control}
              name="nbPoints"
              items={zeroFillingSizes}
              onItemSelect={() => {
                submitHandler('onChange');
              }}
            />
          </Label>
        </div>
      </Sections.Body>
    </ReadOnly>
  );
}
