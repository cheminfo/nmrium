import { useCallback, useRef } from 'react';
import { DropZone } from 'react-science/ui';

import { NMRium, NMRiumRefAPI } from '../../component/main';

export default function RefAPI() {
  const nmriumRef = useRef<NMRiumRefAPI>(null);
  const dropFileHandler = useCallback((dropFiles: File[]) => {
    nmriumRef.current?.loadFiles(dropFiles);
  }, []);

  return (
    <div
      style={{
        height: '100%',
        marginLeft: 30,
      }}
    >
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          padding: '20px 0',
        }}
      >
        <div style={{ flex: 9 }}>
          <NMRium ref={nmriumRef} />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px',
            flex: 3,
          }}
        >
          <div style={{ flex: 3 }}>
            <DropZone onDrop={dropFileHandler} emptyTitle="Drop data files" />
          </div>
        </div>
      </div>
    </div>
  );
}
