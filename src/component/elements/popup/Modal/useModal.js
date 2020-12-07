import { useContext, useMemo } from 'react';

import DefaultContext from './Context';

const useModal = (context) => {
  const modalContext = useContext(context || DefaultContext);
  const modal = useMemo(() => {
    return modalContext.current;
  }, [modalContext]);
  return modal;
};

export default useModal;
