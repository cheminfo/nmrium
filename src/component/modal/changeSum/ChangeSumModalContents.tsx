/** @jsxImportSource @emotion/react */
import { Button, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { SumOptions } from 'nmr-load-save';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import Tab from '../../elements/Tab/Tab';
import Tabs from '../../elements/Tab/Tabs';

import SelectMolecule from './SelectMolecule';

function getValidationSchema(option: SumSetOption) {
  if (option === 'auto') {
    return Yup.object({
      molecule: Yup.object().required(),
    });
  }

  return Yup.object({
    sum: Yup.number().required(),
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

  function onTabChangeHandler(tab) {
    setActiveOption(tab.tabid);
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
      <DialogBody
        css={css`
          padding: 0;
          background-color: white;
        `}
      >
        <Tabs activeTab={setOption} onClick={onTabChangeHandler}>
          {isStructurePanelVisible && (
            <Tab title="Auto" tabid="auto">
              <SelectMolecule control={control} name="molecule" />
            </Tab>
          )}

          <Tab title="Manual" tabid="manual">
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
              />
            </ManualContainer>
          </Tab>
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
