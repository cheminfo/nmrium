import styled from '@emotion/styled';
import { FormEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { Modal } from 'react-science/ui';

import Button from '../../component/elements/Button';

import { ClipboardMode } from './types';

const ClipboardForm = styled.form`
  padding: 0.5rem;

  & > label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  textarea {
    padding: 0.5rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

export interface CFBP {
  mode: ClipboardMode | undefined;
  label?: string;

  onDismiss: () => void;
}

export interface ClipboardFallbackProps
  extends CFBP,
    Partial<Omit<ClipboardFallbackReadProps, 'mode' | 'label' | 'onDismiss'>>,
    Partial<
      Omit<ClipboardFallbackReadTextProps, 'mode' | 'label' | 'onDismiss'>
    >,
    Partial<Omit<ClipboardFallbackWriteProps, 'mode' | 'label' | 'onDismiss'>>,
    Partial<
      Omit<ClipboardFallbackWriteTextProps, 'mode' | 'label' | 'onDismiss'>
    > {}

function throwError(props: ClipboardFallbackProps, prop: string) {
  throw new Error(`props.${prop} is mandatory with ${String(props.mode)} mode`);
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

/**
 * switch between ClipboardFallback variant over mode props
 * mode === read => ClipboardFallbackReadProps
 * mode === readText => ClipboardFallbackReadTextProps
 * mode === write => ClipboardFallbackWriteProps
 * mode === writeText => ClipboardFallbackWriteTextProps
 *
 * implement what you need in function what part of the clipboard api from useClipboard you use
 * props will be checked at runtime
 *
 * @param props
 */
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

/**
 * return null if !props.mode
 *
 * @param props
 * @see ClipboardFallback
 */
export function ClipboardFallbackModal(props: ClipboardFallbackProps) {
  if (!props.mode) return null;

  const titles: Record<ClipboardMode, string> = {
    read: `Import data from file`,
    readText: `Paste text from clipboard`,
    write: `Export data to file`,
    writeText: `Copy text from text area`,
  };

  return (
    <Modal hasCloseButton isOpen onRequestClose={props.onDismiss}>
      <Modal.Header>
        <h2>{titles[props.mode]}</h2>
      </Modal.Header>

      <Modal.Body>
        <ClipboardFallback {...props} />
      </Modal.Body>
    </Modal>
  );
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

  if (props.mode !== 'read') return null;

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <label>
        <span>{props.label ?? 'File'}</span>
        <input name="file" type="file" />
      </label>
      <p>
        We were not able to read from your clipboard. Please input your data in
        the file field
      </p>

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

  if (props.mode !== 'readText') return null;

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <label>
        <span>{props.label ?? 'Text'}</span>
        <textarea name="text" cols={50} rows={10} />
      </label>
      <p>
        We were not able to read text from your clipboard. Please paste your
        data in the text area.
      </p>

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

  if (props.mode !== 'write') return null;

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <p>{props.label ?? 'Download'}</p>
      <a href={downloadLink} download={props.file.name}>
        We were not able to write data to your clipboard. Please download your
        data with this link.
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

  if (props.mode !== 'writeText') return null;

  return (
    <ClipboardForm onSubmit={onSubmit}>
      <span>{props.label ?? 'Text'}</span>
      <textarea name="text" cols={30} rows={10} ref={(node) => node?.select()}>
        {props.text}
      </textarea>
      <p>
        We were not able to write text to your clipboard. Please copy your data
        in the text area.
      </p>

      <Actions>
        <Button.Secondary type="submit">Dismiss</Button.Secondary>
      </Actions>
    </ClipboardForm>
  );
}
