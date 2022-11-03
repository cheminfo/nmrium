import { setDomain, getDomain } from './DomainActions';

function handleHistoryUndo(draft) {
  const { past, present, future } = draft.history;
  const previous = past[past.length - 1];
  const newPast = past.slice(0, -1);
  const newfuture = [present, ...future];

  const hasRedo = newfuture.length > 0;
  const hasUndo = past.length > 0;

  const domain = getDomain(draft.data);
  const history = {
    past: newPast,
    present: previous,
    future: newfuture,
    hasRedo,
    hasUndo,
  };

  draft.xDomain = domain.xDomain;
  draft.yDomain = domain.yDomain;
  draft.originDomain = domain;
  draft.history = history;
}

function handleHistoryRedo(draft) {
  const { history, data } = draft;
  const newPresent = history.future.shift();
  history.past.push(history.present);
  history.present = newPresent;
  history.hasUndo = true;
  history.hasRedo = history.future.length > 0;

  setDomain(data);
}

function handleHistoryReset(draft, action) {
  draft.history = {
    past: [],
    present: action,
    future: [],
    hasRedo: false,
    hasUndo: false,
  };
}

export { handleHistoryUndo, handleHistoryRedo, handleHistoryReset };
