/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { memo } from 'react';

import CloseButton from '../../elements/CloseButton';
import SaveButton from '../../elements/SaveButton';

const styles = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;
`;
const PreferencesHeader = memo(({ onClose, onSave }) => {
  return (
    <div css={styles}>
      <CloseButton onClick={onClose} popupTitle="close Preferences" />
      <SaveButton onClick={onSave} popupTitle="save Preferences" />
    </div>
  );
});

export default PreferencesHeader;
