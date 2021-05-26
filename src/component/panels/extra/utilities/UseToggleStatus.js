import { useCallback, useEffect, useRef, useState } from 'react';

/**
 *
 * @param {string} key
 * @param {Array} data
 */

function useToggleStatus(key, data) {
  const [status, setStatus] = useState({});
  const oldIdRef = useRef();

  useEffect(() => {
    let statusflags = {};
    if (data && Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        statusflags[data[i][key]] = false;
      }
      setStatus(statusflags);
    }
  }, [data, key]);

  const toggle = useCallback(
    (id) => {
      const newStatus = { ...status };
      if (oldIdRef.current) {
        newStatus[oldIdRef.current] = false;
      }
      if (id != null) {
        oldIdRef.current = id;
        newStatus[id] = true;
      }
      setStatus(newStatus);
    },
    [status],
  );

  return [status, toggle];
}

export default useToggleStatus;
