import { useDispatch } from '../context/DispatchContext';
import { getModifiers } from '../context/KeyModifierContext';

export function useSetActiveSpectrumAction() {
  const dispatch = useDispatch();

  function setActiveSpectrum(e: MouseEvent, id: string) {
    setTimeout(() => {
      const { ctrlKey, shiftKey } = getModifiers(e);
      const modifier = `shift[${shiftKey ? 'true' : 'false'}]_ctrl[${
        ctrlKey ? 'true' : 'false'
      }]`;
      dispatch({
        type: 'CHANGE_ACTIVE_SPECTRUM',
        payload: { modifier, id },
      });
    }, 0);
  }

  return { setActiveSpectrum };
}
