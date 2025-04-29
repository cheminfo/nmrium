import { Button, DialogFooter, Tab, Tabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { SumOptions } from '@zakodium/nmrium-core';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';

import SelectMolecule from './SelectMolecule.js';

const DialogBody = styled(StyledDialogBody)`
  [role='tablist'] {
    border-bottom: 1px solid #f0f0f0;
  }
`;

function getValidationSchema(option: SumSetOption) {
  if (option === 'auto') {
    return Yup.object({
      molecule: Yup.object().required(),
    });
  }

  return Yup.object({
    sum: Yup.number().min(0).required(),
  });
}

type SumSetOption = 'auto' | 'manual';

type SaveInput =
  | {
      sum: number;
      sumAuto: false;
    }
  | {
      moleculeId: string;
      mf: string;
      sumAuto: true;
    };

const ManualContainer = styled.div`
  padding: 30px 5px;
  display: flex;
  justify-content: center;
`;

interface SumOption {
  sum: number | null;
}

interface MoleculeOption {
  molecule: { mf: string; id: string } | null;
}

type Option = SumOption | MoleculeOption;

export interface ChangeSumModalContentsProps {
  sumOptions: SumOptions;
  onSave: (saveInput: SaveInput) => void;
  onClose: () => void;
}

export function ChangeSumModalContents(props: ChangeSumModalContentsProps) {
  const { sumOptions, onSave, onClose } = props;
  const {
    current: {
      display: { panels },
    },
  } = usePreferences();

  const [setOption, setActiveOption] = useState<SumSetOption>('auto');
  const { control, handleSubmit, reset } = useForm<Option>({
    resolver: yupResolver(getValidationSchema(setOption) as any),
  });

  useEffect(() => {
    if (sumOptions?.sumAuto && panels?.structuresPanel?.display) {
      setActiveOption('auto');
      const { mf, moleculeId: id } = sumOptions;
      reset({
        molecule: id && mf ? { mf, id } : null,
      });
    } else {
      setActiveOption('manual');
      reset({
        sum: sumOptions?.sum,
      });
    }
  }, [panels?.structuresPanel, reset, sumOptions]);

  function onTabChangeHandler(tabKey) {
    setActiveOption(tabKey);
  }
  function saveHandler(values) {
    switch (setOption) {
      case 'auto': {
        const {
          molecule: { mf, id: moleculeId },
        } = values;

        onSave({ sumAuto: true, mf, moleculeId });
        break;
      }
      case 'manual': {
        const { sum } = values;
        onSave({ sum, sumAuto: false });
        break;
      }
      default:
        return;
    }
    onClose();
  }

  const isStructurePanelVisible = panels?.structuresPanel?.display || false;

  return (
    <>
      <DialogBody padding="5px">
        <Tabs
          selectedTabId={setOption}
          onChange={onTabChangeHandler}
          renderActiveTabPanelOnly
        >
          {isStructurePanelVisible && (
            <Tab
              title="Auto"
              id="auto"
              panel={<SelectMolecule control={control} name="molecule" />}
            />
          )}
          <Tab
            title="Manual"
            id="manual"
            panel={
              <ManualContainer>
                <NumberInput2Controller
                  name="sum"
                  control={control}
                  placeholder="Enter the new value"
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return;

                    void handleSubmit(saveHandler)();
                  }}
                  style={{ width: '250px' }}
                  autoFocus
                  min={0}
                />
              </ManualContainer>
            }
          />
        </Tabs>
      </DialogBody>
      <DialogFooter>
        <Button
          intent="success"
          onClick={() => {
            void handleSubmit(saveHandler)();
          }}
          style={{ width: 80 }}
        >
          Set
        </Button>
      </DialogFooter>
    </>
  );
}
