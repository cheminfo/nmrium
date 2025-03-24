import type { RefObject } from 'react';
import { useImperativeHandle } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export interface SettingsRef {
  saveSetting: () => Promise<boolean>;
}

function saveSetting(
  handleSubmit: UseFormReturn['handleSubmit'],
  handleSuccess: (data: any) => void,
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    void handleSubmit(
      (data) => {
        handleSuccess(data);
        resolve(true);
      },
      () => {
        resolve(false);
      },
    )();
  });
}

export function useSettingImperativeHandle(
  ref: RefObject<any>,
  handleSubmit: UseFormReturn['handleSubmit'],
  handleSuccess: (data: any) => void,
) {
  useImperativeHandle(ref, () => ({
    saveSetting: () => saveSetting(handleSubmit, handleSuccess),
  }));
}
