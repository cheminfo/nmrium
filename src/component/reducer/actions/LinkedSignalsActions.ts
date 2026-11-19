import type { Spectrum2D } from '@zakodium/nmr-types';
import { isSpectrum2DFt } from '@zakodium/nmrium-core';
import type { Draft } from 'immer';

import type { State } from '../Reducer.js';
import { getSpectrum } from '../helper/getSpectrum.js';
import type { ActionType } from '../types/ActionType.js';

type LinkedSignal = Spectrum2D['linkedSignals'][number];

type Add2DSignalLinkAction = ActionType<
  'ADD_2D_SIGNAL_LINK',
  Pick<LinkedSignal, 'xSignalId' | 'ySignalId' | 'assignment'>
>;
type Delete2DSignalLinkAction = ActionType<
  'DELETE_2D_SIGNAL_LINK',
  { id: string }
>;
type ChangeLinkedSignalAssignmentAction = ActionType<
  'CHANGE_LINKED_SIGNAL_ASSIGNMENT_LABEL',
  { id: string; value: string; isAutoAssignment?: boolean }
>;
type SetLinkedSignalLabelCoordinationAction = ActionType<
  'SET_LINKED_SIGNAL_ASSIGNMENT_LABEL_COORDINATION',
  { spectrumId: string; id: string; coordination: { x: number; y: number } }
>;

export type LinkedSignalsActions =
  | Add2DSignalLinkAction
  | Delete2DSignalLinkAction
  | ChangeLinkedSignalAssignmentAction
  | SetLinkedSignalLabelCoordinationAction;

function getLinkedSignal(draft: Draft<State>, id: string) {
  const spectrum = getSpectrum(draft);

  if (!isSpectrum2DFt(spectrum)) {
    return;
  }

  const link = spectrum.linkedSignals?.find(
    (link) => `${link.xSignalId}:${link.ySignalId}` === id,
  );

  if (!link) {
    return;
  }

  return { spectrum, link };
}

export function handleAdd2DSignalLink(
  draft: Draft<State>,
  action: Add2DSignalLinkAction,
) {
  const spectrum = getSpectrum(draft);
  const { xSignalId, ySignalId, assignment } = action.payload;

  if (!xSignalId || !ySignalId || !isSpectrum2DFt(spectrum)) {
    return;
  }

  const isLined = spectrum.linkedSignals.some(
    (link) => link.xSignalId === xSignalId && link.ySignalId === ySignalId,
  );

  if (isLined) {
    return;
  }

  spectrum.linkedSignals.push({
    xSignalId,
    ySignalId,
    assignment,
    isAutoAssignment: true,
  });
}

export function handleChangeLinkedSignalAssignment(
  draft: Draft<State>,
  action: ChangeLinkedSignalAssignmentAction,
) {
  const { isAutoAssignment = false, value, id } = action.payload;
  const linkedSignal = getLinkedSignal(draft, id);
  if (!linkedSignal) {
    return;
  }
  const { link } = linkedSignal;
  link.assignment = value;
  link.isAutoAssignment = isAutoAssignment;
}

export function handleDelete2DSignalLink(
  draft: Draft<State>,
  action: Delete2DSignalLinkAction,
) {
  const { id } = action.payload;
  const linkedSignal = getLinkedSignal(draft, id);

  if (!linkedSignal) {
    return;
  }

  const { spectrum } = linkedSignal;
  spectrum.linkedSignals = spectrum.linkedSignals.filter(
    (signal) => `${signal.xSignalId}:${signal.ySignalId}` !== id,
  );

  delete draft.view.assignmentsLabelsCoordinates?.[spectrum.id]?.[id];
}

export function handleSetLinkedSignalLabelCoordination(
  draft: Draft<State>,
  action: SetLinkedSignalLabelCoordinationAction,
) {
  const { spectrumId, id, coordination } = action.payload;

  if (!draft.view.assignmentsLabelsCoordinates) {
    draft.view.assignmentsLabelsCoordinates = {};
  }

  const coordinates = draft.view.assignmentsLabelsCoordinates;
  if (!coordinates[spectrumId]) {
    coordinates[spectrumId] = {};
  }

  coordinates[spectrumId][id] = coordination;
}
