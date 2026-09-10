import type { InputGroupProps } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import {
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
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

const style: CSSProperties = { minWidth: 60 };
const className = 'editable-column';
const CloseEditContext = createContext<(() => void) | undefined>(undefined);

export function CloseEditOnClick(props: { children: ReactNode }) {
  const { children } = props;
  const closeEdit = useContext(CloseEditContext);

  return <span onClick={() => closeEdit?.()}>{children}</span>;
}

interface BaseEditableColumnProps {
  type: 'number' | 'text';
  value: number | string;
  validate?: (value: string | number) => boolean;
}

export interface EditableColumnProps
  extends BaseEditableColumnProps, Pick<InputGroupProps, 'rightElement'> {
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
    rightElement,
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

  function startEditHandler() {
    onEditStart?.(true);
    enableEdit(true);
  }

  function onConfirm(value: string | number) {
    onSave?.(value);
    enableEdit(false);
  }

  function onCancel() {
    enableEdit(false);
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
            rightElement={rightElement}
          />
        </div>
      )}
    </Container>
  );
});

interface EditFieldProps extends BaseEditableColumnProps {
  onConfirm: (value: string | number) => void;
  onCancel: (event?: KeyboardEvent<HTMLInputElement>) => void;
  rightElement?: ReactNode;
}

function EditField(props: EditFieldProps) {
  const {
    value: externalValue,
    type,
    onConfirm,
    onCancel,
    validate,
    rightElement,
  } = props;

  const [isValid, setValid] = useState<boolean>(true);
  const [value, setVal] = useState(() => extractNumber(externalValue, type));
  const editFieldRef = useRef<HTMLDivElement>(null);
  const closeEdit = useCallback(() => onCancel(), [onCancel]);

  const confirmValue = useCallback(() => {
    const valid = typeof validate === 'function' ? validate(value) : true;
    setValid(valid);
    if (valid) {
      onConfirm(value);
    }
  }, [onConfirm, validate, value]);

  useEffect(() => {
    function handleOutsideMouseDown(event: globalThis.MouseEvent) {
      if (
        !(event.target instanceof Node) ||
        !editFieldRef.current?.contains(event.target)
      ) {
        confirmValue();
      }
    }

    globalThis.addEventListener('mousedown', handleOutsideMouseDown);
    return () =>
      globalThis.removeEventListener('mousedown', handleOutsideMouseDown);
  }, [confirmValue]);

  function handleKeydown(event: KeyboardEvent<HTMLInputElement>) {
    // when press Enter or Tab
    if (['Enter', 'Tab'].includes(event.key)) {
      confirmValue();
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
  const inputRightElement = isValidElement(rightElement)
    ? rightElement
    : undefined;

  if (type === 'number') {
    return (
      <CloseEditContext.Provider value={closeEdit}>
        <div ref={editFieldRef}>
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
            size="small"
            fill
            buttonPosition="none"
            stepSize={0.1}
            minorStepSize={0.01}
            majorStepSize={1}
            rightElement={inputRightElement}
          />
        </div>
      </CloseEditContext.Provider>
    );
  }

  return (
    <CloseEditContext.Provider value={closeEdit}>
      <div ref={editFieldRef}>
        <Input2
          intent={intent}
          style={style}
          autoSelect
          className={className}
          value={value as string}
          onChange={(value) => handleChange(value)}
          onKeyDown={handleKeydown}
          size="small"
          rightElement={inputRightElement}
        />
      </div>
    </CloseEditContext.Provider>
  );
}
