import { Switch } from '@blueprintjs/core';
import { Filter } from 'nmr-processing';

import Label from '../../../elements/Label';
import { Sections } from '../../../elements/Sections';
import { Select2Controller } from '../../../elements/Select2Controller';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';
import { useZeroFilling, zeroFillingSizes } from './useZeroFilling';

interface ZeroFillingOptionsPanelProps {
  filter: Filter;
}

export default function ZeroFillingOptionsPanel(
  props: ZeroFillingOptionsPanelProps,
) {
  const { filter } = props;
  const {
    control,
    submitHandler,
    register,
    handleCancelFilter,
    formState: { isDirty },
  } = useZeroFilling(filter);

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  const disabledAction = filter.value && !isDirty;
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
              submitHandler('onChange');
            }}
            label="Live preview"
          />
          <FilterActionButtons
            onConfirm={() => submitHandler()}
            onCancel={handleCancelFilter}
            disabledConfirm={disabledAction}
            disabledCancel={disabledAction}
          />
        </HeaderContainer>
      </StickyHeader>
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
    </>
  );
}
