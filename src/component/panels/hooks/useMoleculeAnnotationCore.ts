import type { MoleculeView } from '@zakodium/nmrium-core';

import { useDispatch } from '../../context/DispatchContext.js';

type Annotation = MoleculeView['atomAnnotation'];

export function useMoleculeAnnotationCore(
  id: string,
  moleculeView: MoleculeView,
) {
  const dispatch = useDispatch();
  const { atomAnnotation: baseAtomAnnotation } = moleculeView || {};
  function isAnnotation(annotation: Annotation) {
    return baseAtomAnnotation === annotation;
  }

  function handleChangeAtomAnnotation(annotation: Annotation) {
    const atomAnnotation =
      baseAtomAnnotation === annotation ? 'none' : annotation;
    dispatch({
      type: 'CHANGE_MOLECULE_ANNOTATION',
      payload: { id, atomAnnotation },
    });
  }
  function handleToggleMoleculeLabel() {
    dispatch({
      type: 'TOGGLE_MOLECULE_LABEL',
      payload: { id },
    });
  }
  return {
    handleToggleMoleculeLabel,
    isAnnotation,
    handleChangeAtomAnnotation,
  };
}
