import { useEffect, useState } from 'react';

const useFocus = (parentRef) => {
  const [isFoucs, setFoucs] = useState(false);

  useEffect(() => {
    function focusHandler() {
      setFoucs(true);
    }
    function focusOutHandler() {
      setFoucs(false);
    }

    const element = parentRef.current;
    if (element) {
      element.addEventListener('mouseenter', focusHandler);
      element.addEventListener('mouseleave', focusOutHandler);
    }

    return () => {
      if (element) {
        element.removeEventListener('mouseenter', focusHandler);
        element.removeEventListener('mouseleave', focusOutHandler);
      }
    };
  }, [parentRef]);

  return isFoucs;
};

export default useFocus;
