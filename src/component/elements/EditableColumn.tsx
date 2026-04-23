import { Button } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { Input2 } from './Input2.js';
import { NumberInput2 } from './NumberInput2.js';

interface OverflowProps {
  textOverflowEllipses: boolean;
}

const Text = styled.span<OverflowProps>`
  display: table-cell;
  height: 100%;
  vertical-align: middle;
  width: 100%;
  ${({ textOverflowEllipses }) =>
    textOverflowEllipses &&
    `
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    `}
`;
const Container = styled.span<OverflowProps>`
  display: table;
  height: 100%;
  min-height: 22px;
  width: 100%;
  ${({ textOverflowEllipses }) =>
    textOverflowEllipses &&
    `
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      display: inline-flex;
      align-items:end;
    `}
`;

function extractNumber(val: string | number, type: string) {
  if (type === 'number' && typeof val !== 'number') {
    return Number(val.replaceAll(/[^\d.-]/g, ''));
  }

  return val;
}

function handleMousedown(event: MouseEvent) {
  event.stopPropagation();
}

const style: CSSProperties = { minWidth: 60 };
const className = 'editable-column';

interface BaseEditableColumnProps {
  type: 'number' | 'text';
  value: number | string;
  validate?: (value: string | number) => boolean;
}

export interface EditableColumnProps extends BaseEditableColumnProps {
  onSave?: (value: string | number) => void;
  onEditStart?: (element: boolean) => void;
  editStatus?: boolean;
  style?: CSSProperties;
  textOverflowEllipses?: boolean;
  /**
   * What kind of click is needed to trigger the edition.
   * Use "none" to conditionally disable the behaviour.
   */
  clickType?: 'single' | 'double' | 'none';
}

export const EditableColumn = forwardRef(function EditableColumn(
  props: EditableColumnProps,
  ref: any,
) {
  const {
    onSave,
    value,
    type,
    style,
    onEditStart,
    editStatus = false,
    validate,
    textOverflowEllipses = false,
    clickType = 'single',
  } = props;

  const [enabled, enableEdit] = useState<boolean | undefined>();
  useEffect(() => {
    enableEdit(editStatus);
  }, [editStatus]);

  useImperativeHandle(ref, () => ({
    startEdit: () => {
      enableEdit(true);
    },
    closeEdit: () => {
      enableEdit(false);
    },
  }));

  const mouseClickCallback = useCallback((e: globalThis.MouseEvent) => {
    if (!(e.target as HTMLInputElement).classList.contains('editable-column')) {
      enableEdit(false);
      // TODO: refactor this
      // eslint-disable-next-line react-hooks/immutability
      globalThis.removeEventListener('mousedown', mouseClickCallback);
    }
  }, []);

  function startEditHandler() {
    globalThis.addEventListener('mousedown', mouseClickCallback);
    onEditStart?.(true);
    enableEdit(true);
  }

  function onConfirm(value: string | number) {
    onSave?.(value);
    enableEdit(false);
    globalThis.removeEventListener('mousedown', mouseClickCallback);
  }

  function onCancel() {
    enableEdit(false);
    globalThis.removeEventListener('mousedown', mouseClickCallback);
  }

  let clickHandler = {};

  if (clickType === 'single' && !enabled) {
    clickHandler = { onClick: startEditHandler };
  }

  if (clickType === 'double' && !enabled) {
    clickHandler = { onDoubleClick: startEditHandler };
  }

  return (
    <Container
      style={style}
      textOverflowEllipses={textOverflowEllipses}
      className="editable-column-input"
      {...clickHandler}
    >
      {!enabled && (
        <Text textOverflowEllipses={textOverflowEllipses}>
          {value ?? '&nbsp;'}
        </Text>
      )}
      {enabled && (
        <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
          <EditField
            value={value}
            type={type}
            onConfirm={onConfirm}
            onCancel={onCancel}
            validate={validate}
          />
        </div>
      )}
    </Container>
  );
});

interface EditFieldProps extends BaseEditableColumnProps {
  onConfirm: (value: string | number) => void;
  onCancel: (event?: KeyboardEvent<HTMLInputElement>) => void;
}

function EditField(props: EditFieldProps) {
  const { value: externalValue, type, onConfirm, onCancel, validate } = props;

  const [isValid, setValid] = useState<boolean>(true);
  const [value, setVal] = useState(() => extractNumber(externalValue, type));

  function handleKeydown(event: KeyboardEvent<HTMLInputElement>) {
    const valid = typeof validate === 'function' ? validate(value) : true;
    setValid(valid);
    // when press Enter or Tab
    if (valid && ['Enter', 'Tab'].includes(event.key)) {
      onConfirm(value);
    }
    // close edit mode if press Enter, Tab or Escape
    if (['Escape'].includes(event.key)) {
      onCancel(event);
    }
  }

  function handleChange(value: string | number) {
    setVal(value);
  }

  const intent = !isValid ? 'danger' : 'none';

  const rightElement = (
    <Button
      variant="minimal"
      icon="cross"
      onMouseDown={handleMousedown}
      onClick={() => onCancel()}
    />
  );

  if (type === 'number') {
    return (
      <NumberInput2
        intent={intent}
        style={style}
        autoSelect
        className={className}
        value={value}
        onValueChange={(valueAsNumber, valueString) =>
          handleChange(valueString ?? Number(valueString))
        }
        onKeyDown={handleKeydown}
        onMouseDown={handleMousedown}
        size="small"
        fill
        buttonPosition="none"
        stepSize={0.1}
        minorStepSize={0.01}
        majorStepSize={1}
        rightElement={rightElement}
      />
    );
  }

  return (
    <Input2
      intent={intent}
      style={style}
      autoSelect
      className={className}
      value={value as string}
      onChange={(value) => handleChange(value)}
      onKeyDown={handleKeydown}
      onMouseDown={handleMousedown}
      size="small"
      rightElement={rightElement}
    />
  );
}
