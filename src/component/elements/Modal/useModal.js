import { useContext } from 'react';

import DefaultConetxt from './Context';

const useModal = (context) => {
  const modalConetxt = useContext(context || DefaultConetxt);
  return modalConetxt.current;
};

export default useModal;
