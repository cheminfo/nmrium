import { useShareData } from '../context/ShareDataContext';

export function useTriggerNewAssignmentLabel(id) {
  const { data: rangeKey, setData } = useShareData<string | null>();

  function dismissNewLabel() {
    setData(null);
  }

  return { isNewAssignment: rangeKey === id, dismissNewLabel };
}
