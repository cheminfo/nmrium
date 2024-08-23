import { RefObject, useImperativeHandle } from 'react';
import { UseFormReturn } from 'react-hook-form';

export interface SettingsRef {
  saveSetting: () => Promise<boolean>;
}

export function saveSetting(
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
