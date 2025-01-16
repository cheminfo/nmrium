import { Switch } from '@blueprintjs/core';

import { HeaderContainer } from '../../../../elements/HeaderContainer.js';
import Label from '../../../../elements/Label.js';
import { ReadOnly } from '../../../../elements/ReadOnly.js';
import { Sections } from '../../../../elements/Sections.js';
import { Select2Controller } from '../../../../elements/Select2Controller.js';
import { FilterActionButtons } from '../FilterActionButtons.js';
import { StickyHeader } from '../InnerFilterHeader.js';
import {
  getZeroFillingNbPoints,
  useZeroFilling,
} from '../hooks/useZeroFilling.js';
import type { ZeroFillingEntry } from '../hooks/useZeroFilling.js';
import type { BaseFilterOptionsPanelProps } from '../index.js';

export function BaseZeroFillingOptions(
  props: BaseFilterOptionsPanelProps<ZeroFillingEntry>,
) {
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;

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

  const nbPointsList = getZeroFillingNbPoints(filter);
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
                submitHandler('onChange');
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
          <Label title="Size:">
            <Select2Controller
              control={control}
              name="nbPoints"
              items={nbPointsList}
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
