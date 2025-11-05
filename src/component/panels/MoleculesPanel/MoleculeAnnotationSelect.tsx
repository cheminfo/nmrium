import type { MoleculeView } from '@zakodium/nmrium-core';

import { useDispatch } from '../../context/DispatchContext.tsx';
import { Select2 } from '../../elements/Select2.tsx';

type AtomAnnotation = MoleculeView['atomAnnotation'];

const atomAnnotations: Array<{ value: AtomAnnotation; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'atom-numbers', label: 'Atoms number' },
  { value: 'custom-labels', label: 'Custom labels' },
];

interface MoleculeAnnotationSelectProps
  extends Pick<MoleculeView, 'atomAnnotation'> {
  moleculeKey: string;
}

export function MoleculeAnnotationSelect(props: MoleculeAnnotationSelectProps) {
  const { moleculeKey, atomAnnotation } = props;

  const dispatch = useDispatch();

  function handleMoleculeAnnotation(item: { value: AtomAnnotation }) {
    const { value } = item;
    dispatch({
      type: 'CHANGE_MOLECULE_ANNOTATION',
      payload: { id: moleculeKey, atomAnnotation: value },
    });
  }

  return (
    <Select2
      items={atomAnnotations}
      selectedItemValue={atomAnnotation}
      selectedButtonProps={{ variant: 'minimal', size: 'small' }}
      onItemSelect={handleMoleculeAnnotation}
    />
  );
}
