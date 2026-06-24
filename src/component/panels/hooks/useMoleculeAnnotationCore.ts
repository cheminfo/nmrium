import type { MoleculeView } from '@zakodium/nmrium-core';

import { useDispatch } from '../../context/DispatchContext.js';

type Annotation = MoleculeView['atomAnnotation'];

export function useMoleculeAnnotationCore(
  id: string,
  moleculeView: MoleculeView,
) {
  const dispatch = useDispatch();
  const { atomAnnotation: activeAnnotation } = moleculeView || {};
  function isActiveAnnotation(annotation: Annotation) {
    return activeAnnotation === annotation;
  }

  function setAtomAnnotation(annotation: Annotation) {
    if (activeAnnotation === annotation) {
      return;
    }

    dispatch({
      type: 'CHANGE_MOLECULE_ANNOTATION',
      payload: { id, atomAnnotation: annotation },
    });
  }

  function toggleAtomAnnotation(annotation: Annotation) {
    setAtomAnnotation(activeAnnotation === annotation ? 'none' : annotation);
  }

  function handleToggleMoleculeLabel() {
    dispatch({
      type: 'TOGGLE_MOLECULE_LABEL',
      payload: { id },
    });
  }
  return {
    handleToggleMoleculeLabel,
    isActiveAnnotation,
    setAtomAnnotation,
    toggleAtomAnnotation,
  };
}
