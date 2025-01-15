import { useForm } from 'react-hook-form';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import Label from '../../../elements/Label.js';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';

import type { BaseFilterOptionsPanelProps } from './index.js';
import { formLabelStyle } from './index.js';

type ShiftFilterPanelOptions =
  | ExtractFilterEntry<'shiftX'>
  | ExtractFilterEntry<'shift2DX'>
  | ExtractFilterEntry<'shift2DY'>;

export default function ShiftOptionsPanel(
  props: BaseFilterOptionsPanelProps<ShiftFilterPanelOptions>,
) {
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;

  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm({ defaultValues: filter.value });

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  function handleApplyFilter(values) {
    const { shift } = values;
    switch (filter.name) {
      case 'shiftX': {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shift },
        });
        break;
      }

      case 'shift2DX': {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shiftX: shift },
        });
        break;
      }

      case 'shift2DY': {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shiftY: shift },
        });
        break;
      }

      default:
        break;
    }
  }

  function handleConfirm(event) {
    void handleSubmit(handleApplyFilter)();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    handleCancelFilter();
    onCancel?.(event);
  }

  return (
    <ReadOnly enabled={!enableEdit} onClick={onEditStart}>
      {enableEdit && (
        <StickyHeader>
          <HeaderContainer>
            <div />
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={!isDirty}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
      <Sections.Body>
        <Label title="Shift:" style={formLabelStyle}>
          <NumberInput2Controller
            control={control}
            name="shift"
            min={0}
            stepSize={1}
            debounceTime={250}
          />
        </Label>
      </Sections.Body>
    </ReadOnly>
  );
}
