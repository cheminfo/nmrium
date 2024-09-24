import { Checkbox } from '@blueprintjs/core';
import { Filters } from 'nmr-processing';

import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import { Select2Controller } from '../elements/Select2Controller';
import { useFilter } from '../hooks/useFilter';
import {
  useZeroFilling,
  zeroFillingSizes,
} from '../panels/filtersPanel/Filters/hooks/useZeroFilling';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

export function SimpleZeroFillingOptionsPanel() {
  const filter = useFilter(Filters.zeroFilling.id);
  const { control, submitHandler, register, handleCancelFilter } =
    useZeroFilling(filter, { applyFilterOnload: true });

  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register('livePreview');
  return (
    <HeaderContainer>
      <Label title="Size:" style={headerLabelStyle}>
        <Select2Controller
          control={control}
          name="nbPoints"
          items={zeroFillingSizes}
          onItemSelect={() => {
            submitHandler('onChange');
          }}
        />
      </Label>
      <Label title="Live preview" style={{ label: { padding: '0 5px' } }}>
        <Checkbox
          style={{ margin: 0 }}
          {...otherLivePreviewRegisterOptions}
          onChange={(event) => {
            void onLivePreviewChange(event);
            submitHandler('onChange');
          }}
        />
      </Label>

      <ActionButtons
        onDone={() => submitHandler()}
        onCancel={handleCancelFilter}
      />
    </HeaderContainer>
  );
}
