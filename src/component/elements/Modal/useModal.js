import { useContext } from 'react';

import DefaultContext from './Context';

const useModal = (context) => {
  const modalContext = useContext(context || DefaultContext);
  return modalContext.current;
};

export default useModal;
