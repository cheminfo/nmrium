const setWidth = (state, width) => {
  return { ...state, width };
};

const handleSetDimensions = (state, width, height) => {
  return { ...state, width, height };
};

export { setWidth, handleSetDimensions };
