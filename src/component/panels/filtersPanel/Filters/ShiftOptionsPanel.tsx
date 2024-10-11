import { Filters } from 'nmr-processing';
import { useForm } from 'react-hook-form';

import { useDispatch } from '../../../context/DispatchContext';
import Label from '../../../elements/Label';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import { ReadOnly } from '../../../elements/ReadOnly';
import { Sections } from '../../../elements/Sections';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';

import { BaseFilterOptionsPanelProps, formLabelStyle } from '.';

const { shiftX, shift2DX, shift2DY } = Filters;

export default function ShiftOptionsPanel(props: BaseFilterOptionsPanelProps) {
  const { filter, enableEdit = true, onCancel, onConfirm } = props;

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
      case shiftX.id: {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shift },
        });
        break;
      }

      case shift2DX.id: {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shiftX: shift },
        });
        break;
      }

      case shift2DY.id: {
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
    <ReadOnly enabled={!enableEdit}>
      {enableEdit && (
        <StickyHeader>
          <HeaderContainer>
            <div />
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={!isDirty}
              disabledCancel={!isDirty}
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
