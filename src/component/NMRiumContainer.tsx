/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { ReactNode, forwardRef, useEffect } from 'react';

import checkModifierKeyActivated from '../data/utilities/checkModifierKeyActivated';

import useCombinedRefs from './hooks/useCombinedRefs';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const containerStyles = css`
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 100%;
  height: 100%;
  // outline:none;

  * {
    -webkit-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`;

interface NMRiumContainerProps {
  children: ReactNode;
}

function preventContextMenuHandler(e) {
  if (!checkModifierKeyActivated(e)) {
    e.preventDefault();
  }
}

const NMRiumContainer = forwardRef<HTMLDivElement, NMRiumContainerProps>(
  function NMRiumContainer(props, ref) {
    const shortcutProps = useKeyboardShortcuts();
    const divRef = useCombinedRefs([ref]);

    useEffect(() => {
      const div = divRef.current as HTMLDivElement;
      if (!div) {
        return;
      }
      function mouseEnterHandler() {
        div.focus();
      }
      function mouseLeaveHandler() {
        div.blur();
      }

      div.addEventListener('mouseenter', mouseEnterHandler);
      div.addEventListener('mouseleave', mouseLeaveHandler);
      return () => {
        div.removeEventListener('mouseenter', mouseEnterHandler);
        div.removeEventListener('mouseleave', mouseLeaveHandler);
      };
    }, [divRef]);

    return (
      <div
        {...shortcutProps}
        className="nmrium-container"
        ref={divRef}
        css={containerStyles}
        onContextMenu={preventContextMenuHandler}
      >
        {props.children}
      </div>
    );
  },
);

export { NMRiumContainer };
