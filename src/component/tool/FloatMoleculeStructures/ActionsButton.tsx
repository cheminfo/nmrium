import { BsArrowsMove } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';

import Button from '../../elements/Button';

export default function ActionsButton({ onFloatBtnClick }) {
  return (
    <div data-no-export="true" style={{ display: 'flex', zIndex: 0 }}>
      <Button.Action
        style={{ fontSize: '14px' }}
        fill="clear"
        className="handle"
      >
        <BsArrowsMove />
      </Button.Action>
      <Button.Danger
        style={{ fontSize: '14px' }}
        fill="clear"
        onClick={onFloatBtnClick}
      >
        <FaTimes />
      </Button.Danger>
    </div>
  );
}
