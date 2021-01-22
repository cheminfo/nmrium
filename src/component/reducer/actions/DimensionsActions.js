function setWidth(state, width) {
  return { ...state, width };
}

function handleSetDimensions(state, width, height) {
  return { ...state, width, height };
}

export { setWidth, handleSetDimensions };
