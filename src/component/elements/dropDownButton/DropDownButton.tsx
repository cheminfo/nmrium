/** @jsxImportSource @emotion/react */
import { css, CSSObject } from '@emotion/react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import DropDownList from './DropDownList';

const arrowDownIcon = `url('data:image/svg+xml;utf8,<svg  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="960px" height="560px" viewBox="0 0 960 560" enable-background="new 0 0 960 560" xml:space="preserve"><g id="Rounded_Rectangle_33_copy_4_1_"><path d="M480,344.181L268.869,131.889c-15.756-15.859-41.3-15.859-57.054,0c-15.754,15.857-15.754,41.57,0,57.431l237.632,238.937c8.395,8.451,19.562,12.254,30.553,11.698c10.993,0.556,22.159-3.247,30.555-11.698l237.631-238.937c15.756-15.86,15.756-41.571,0-57.431s-41.299-15.859-57.051,0L480,344.181z"/></g></svg>')`;

const styles = {
  container: css`
    position: relative;
    border-radius: 10px;
    width: max-content;
    display: inline-block;
    border: 0.55px solid lightgray;
    font-size: 0.9em;
    background: ${arrowDownIcon} no-repeat right white;
    appearance: none;
    background-position-x: calc(100% - 0.5em);
    background-size: 1em 1em;
  `,
  button: css`
    width: 100%;
    padding: 0.3em 2em 0.3em 1em;
  `,
};

export interface DropDownListItem {
  key: string;
  label: string;
}

export interface ItemProps {
  itemKey?: string;
  labelKey?: string;
  visibleKey?: string;
}

export interface DropDownListProps<T> {
  data: T[];
  renderItem?: ((item: DropDownListItem) => ReactNode) | null;
}

interface DropDownButtonProps<T> extends DropDownListProps<T>, ItemProps {
  selectedKey?: string;
  onSelect?: (item: DropDownListItem) => void;
  formatSelectedValue?: (Item: DropDownListItem) => string;
  style?: CSSObject;
  className?: string;
}

function DropDownButton<T extends DropDownListItem>(
  props: DropDownButtonProps<T>,
) {
  const {
    data,
    selectedKey,
    onSelect,
    formatSelectedValue = (item) => item.label,
    renderItem = null,
    style,
    itemKey = 'key',
    labelKey = 'label',
    visibleKey = 'visible',
    className = '',
  } = props;
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<DropDownListItem | null>();

  const drop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedKey) {
      const item = data.find((i) => i[itemKey] === selectedKey) || null;
      setItem(item);
    }
  }, [selectedKey, data, itemKey]);

  useEffect(() => {
    function handleClick() {
      setOpen(false);
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const selectHandler = useCallback(
    (index) => {
      setItem(data[index]);
      onSelect?.(data[index]);
      setOpen(false);
    },
    [data, onSelect],
  );

  return (
    <div
      className={`dropdown ${className}`}
      ref={drop}
      css={[styles.container, style]}
    >
      <button
        css={styles.button}
        type="button"
        onClick={(event) => {
          setOpen((open) => !open);
          event.stopPropagation();
        }}
      >
        {!item ? <FaEllipsisH /> : formatSelectedValue(item)}
      </button>
      {open && (
        <DropDownList
          data={data}
          onSelect={selectHandler}
          renderItem={renderItem}
          itemKey={itemKey}
          labelKey={labelKey}
          visibleKey={visibleKey}
        />
      )}
    </div>
  );
}

export default DropDownButton;
