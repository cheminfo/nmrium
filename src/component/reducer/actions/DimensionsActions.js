function setWidth(draft, width) {
  draft.width = width;
}

function handleSetDimensions(draft, width, height) {
  draft.width = width;
  draft.height = height;
}

export { setWidth, handleSetDimensions };
