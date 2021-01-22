import { useCallback, useEffect, useState } from 'react';

/**
 *
 * @param {string} key
 * @param {Array} data
 */

let oldId = null;

function useToggleStatus(key, data) {
  const [status, setStatus] = useState({});

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
      if (oldId) {
        newStatus[oldId] = false;
      }
      if (id != null) {
        oldId = id;
        newStatus[id] = true;
      }
      setStatus(newStatus);
    },
    [status],
  );

  return [status, toggle];
}

export default useToggleStatus;
