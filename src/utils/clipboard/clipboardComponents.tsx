import styled from '@emotion/styled';
import { FormEvent, useCallback, useEffect, useMemo, useRef } from 'react';

import Button from '../../component/elements/Button';

import { ClipboardMode } from './types';

const ClipboardForm = styled.form`
  padding: 0.5rem;

  & > label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

export interface CFBP {
  mode: ClipboardMode;

  onDismiss: () => void; // it's used; I don't know why it's not detected
}

export interface ClipboardFallbackProps
  extends CFBP,
    Partial<Omit<ClipboardFallbackReadProps, 'mode' | 'onDismiss'>>,
    Partial<Omit<ClipboardFallbackReadTextProps, 'mode' | 'onDismiss'>>,
    Partial<Omit<ClipboardFallbackWriteProps, 'mode' | 'onDismiss'>>,
    Partial<Omit<ClipboardFallbackWriteTextProps, 'mode' | 'onDismiss'>> {}

function throwError(props: ClipboardFallbackProps, prop: string) {
  throw new Error(`props.${prop} is mandatory with ${props.mode} mode`);
}

function assertReadProps(
  props: ClipboardFallbackProps,
): asserts props is ClipboardFallbackReadProps {
  if (typeof props.onRead !== 'function') throwError(props, 'onRead');
}

function assertReadTextProps(
  props: ClipboardFallbackProps,
): asserts props is ClipboardFallbackReadTextProps {
  if (typeof props.onReadText !== 'function') throwError(props, 'onReadText');
}

function assertWriteProps(
  props: ClipboardFallbackProps,
): asserts props is ClipboardFallbackWriteProps {
  if (!props.file) throwError(props, 'file');
  if (typeof props.onDismiss !== 'function') throwError(props, 'onDismiss');
}

function assertWriteTextProps(
  props: ClipboardFallbackProps,
): asserts props is ClipboardFallbackWriteTextProps {
  if (typeof props.text !== 'string') throwError(props, 'text');
  if (typeof props.onDismiss !== 'function') throwError(props, 'onDismiss');
}

export function ClipboardFallback(props: ClipboardFallbackProps) {
  switch (props.mode) {
    case 'read':
      assertReadProps(props);
      return <ClipboardFallbackRead {...props} />;
    case 'readText':
      assertReadTextProps(props);
      return <ClipboardFallbackReadText {...props} />;
    case 'write': {
      assertWriteProps(props);
      return <ClipboardFallbackWrite {...props} />;
    }
    case 'writeText':
      assertWriteTextProps(props);
      return <ClipboardFallbackWriteText {...props} />;
    default:
      return null;
  }
}

interface ClipboardFallbackReadProps extends CFBP {
  onRead: (file: File) => void;
  mode: 'read';
}
function ClipboardFallbackRead(props: ClipboardFallbackReadProps) {
  const onFileRef = useRef(props.onRead);
  onFileRef.current = props.onRead;

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const file = data.get('file');
    if (!(file instanceof File)) return;

    onFileRef.current(file);
  }, []);

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <label>
        <span>File</span>
        <input name="file" type="file" />
        <span>
          clipboard {props.mode} is not supported, please provide your data in a
          file
        </span>
      </label>

      <Actions>
        <Button.Done type="submit">Submit</Button.Done>
        <Button.Secondary type="reset" onClick={props.onDismiss}>
          Cancel
        </Button.Secondary>
      </Actions>
    </ClipboardForm>
  );
}

interface ClipboardFallbackReadTextProps extends CFBP {
  onReadText: (text: string) => void;
  mode: 'readText';
}
function ClipboardFallbackReadText(props: ClipboardFallbackReadTextProps) {
  const onTextRef = useRef(props.onReadText);
  onTextRef.current = props.onReadText;

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const text = data.get('text');
    if (typeof text !== 'string') return;

    onTextRef.current(text);
  }, []);

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <label>
        <span>Text</span>
        <textarea name="text" cols={50} rows={10} />
        <span>
          clipboard {props.mode} is not supported, please provide your data in
          textarea
        </span>
      </label>

      <Actions>
        <Button.Done type="submit">Submit</Button.Done>
        <Button.Secondary type="reset" onClick={props.onDismiss}>
          Cancel
        </Button.Secondary>
      </Actions>
    </ClipboardForm>
  );
}

interface ClipboardFallbackWriteProps extends CFBP {
  file: File;
  mode: 'write';
}
function ClipboardFallbackWrite(props: ClipboardFallbackWriteProps) {
  const onDismissRef = useRef(props.onDismiss);
  onDismissRef.current = props.onDismiss;

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onDismissRef.current();
  }, []);

  const downloadLink = useMemo(
    () => URL.createObjectURL(props.file),
    [props.file],
  );

  useEffect(() => {
    return () => URL.revokeObjectURL(downloadLink);
  }, [downloadLink]);

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <a href={downloadLink} download={props.file.name}>
        clipboard {props.mode} is not supported, please download your data with
        this link
      </a>

      <Actions>
        <Button.Secondary type="submit">Dismiss</Button.Secondary>
      </Actions>
    </ClipboardForm>
  );
}

interface ClipboardFallbackWriteTextProps extends CFBP {
  text: string;
  mode: 'writeText';
}
function ClipboardFallbackWriteText(props: ClipboardFallbackWriteTextProps) {
  const onDismissRef = useRef(props.onDismiss);
  onDismissRef.current = props.onDismiss;

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onDismissRef.current();
  }, []);

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <textarea name="text" cols={30} rows={10}>
        {props.text}
      </textarea>
      <span>
        clipboard {props.mode} is not supported, please get your data in
        textarea
      </span>

      <Actions>
        <Button.Secondary type="submit">Dismiss</Button.Secondary>
      </Actions>
    </ClipboardForm>
  );
}
