import type { ComponentType, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

interface DialogItem {
  isOpen: boolean;
  data: any;
}

type DialogStates = Record<string, DialogItem>;

type ComponentIdentifier = string | ComponentType<any>;

export interface DialogProps<T> {
  dialogData: T;
  onCloseDialog: () => void;
  onOpenDialog: () => void;
}

interface DialogContextType {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  openDialog: <T>(identifier: ComponentIdentifier, data?: T) => void;
  closeDialog: (identifier: ComponentIdentifier) => void;
}

interface DialogDataContextType {
  dialogStates: DialogStates;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  getDialogData: <T>(identifier: ComponentIdentifier) => T | null;
  isDialogOpen: (identifier: ComponentIdentifier) => boolean;
  getDialog: (identifier: ComponentIdentifier) => DialogItem;
}

const DialogContext = createContext<DialogContextType | null>(null);
const DialogDataContext = createContext<DialogDataContextType | null>(null);

function getDialogIdentifier(componentIdentifier: ComponentIdentifier): string {
  if (typeof componentIdentifier === 'string') {
    return componentIdentifier;
  } else {
    const name = componentIdentifier.displayName || componentIdentifier.name;

    if (!name) {
      throw new Error('Dialog identifier should be defined');
    }
    return name;
  }
}

export function DialogProvider({ children }: Required<PropsWithChildren>) {
  const [dialogStates, setDialog] = useState<DialogStates>({});

  const state = useMemo(() => {
    function closeDialog(componentIdentifier: ComponentIdentifier) {
      const identifier = getDialogIdentifier(componentIdentifier);
      setDialog((prevDialogState) => {
        return {
          ...prevDialogState,
          [identifier]: { isOpen: false, data: null },
        };
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    function openDialog<T>(componentIdentifier: ComponentIdentifier, data?: T) {
      const identifier = getDialogIdentifier(componentIdentifier);
      setDialog((prevDialogState) => ({
        ...prevDialogState,
        [identifier]: { isOpen: true, data },
      }));
    }

    return { openDialog, closeDialog };
  }, []);

  const dataState = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    function getDialogData<T>(
      componentIdentifier: ComponentIdentifier,
    ): T | null {
      const identifier = getDialogIdentifier(componentIdentifier);
      return dialogStates?.[identifier]?.data;
    }
    function isDialogOpen(componentIdentifier: ComponentIdentifier) {
      const identifier = getDialogIdentifier(componentIdentifier);
      return dialogStates?.[identifier]?.isOpen || false;
    }
    function getDialog(componentIdentifier: ComponentIdentifier) {
      const identifier = getDialogIdentifier(componentIdentifier);
      return dialogStates?.[identifier];
    }

    return { dialogStates, getDialog, getDialogData, isDialogOpen };
  }, [dialogStates]);

  return (
    <DialogContext.Provider value={state}>
      <DialogDataContext.Provider value={dataState}>
        {children}
      </DialogDataContext.Provider>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

export function useDialogData() {
  const context = useContext(DialogDataContext);
  if (!context) {
    throw new Error('useDialogData must be used within a DialogProvider');
  }
  return context;
}

type WrapperParameters<P> = Omit<P, keyof DialogProps<any>>;

interface WithDialogOptions {
  dialogName?: string;
  /** force re-render the dialog */
  force?: boolean;
}

export function withDialog<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithDialogOptions = {},
) {
  const { dialogName, force = false } = options;
  return (props: WrapperParameters<P>) => {
    const { closeDialog, openDialog } = useDialog();
    const { getDialog } = useDialogData();
    const dialogIdentifier =
      dialogName || getDialogIdentifier(WrappedComponent);

    const { isOpen, data } = getDialog(dialogIdentifier) || {
      isOpen: false,
      data: null,
    };
    function handleCloseDialog() {
      closeDialog(dialogIdentifier);
    }

    function handleOpenDialog() {
      openDialog(dialogIdentifier);
    }

    if (!isOpen) {
      return null;
    }

    // Generate a unique key based on dialogIdentifier and data to force re-render the dialog
    const key = force
      ? `${dialogIdentifier}-${JSON.stringify(data)}`
      : undefined;

    return (
      <WrappedComponent
        key={key}
        onCloseDialog={handleCloseDialog}
        onOpenDialog={handleOpenDialog}
        dialogData={data}
        {...(props as P)}
      />
    );
  };
}
