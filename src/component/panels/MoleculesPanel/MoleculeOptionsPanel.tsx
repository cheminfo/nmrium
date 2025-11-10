import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { BoundingBox, MoleculeView } from '@zakodium/nmrium-core';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { usePreferences } from '../../context/PreferencesContext.tsx';
import { CheckController } from '../../elements/CheckController.js';
import { GroupPane } from '../../elements/GroupPane.js';
import type { LabelStyle } from '../../elements/Label.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { Select2Controller } from '../../elements/Select2Controller.js';
import PreferencesHeader from '../header/PreferencesHeader.tsx';

const atomAnnotations: Array<{
  value: MoleculeView['atomAnnotation'];
  label: string;
}> = [
  { value: 'none', label: 'None' },
  { value: 'atom-numbers', label: 'Atoms number' },
  { value: 'custom-labels', label: 'Custom labels' },
];
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;
const InnerContainer = styled.div`
  overflow: auto;
  height: 100%;
  display: block;
  background-color: white;
`;
const boundingBoxSchema: Yup.ObjectSchema<BoundingBox> = Yup.object({
  width: Yup.number().required().min(0, 'Width must be positive'),
  height: Yup.number().required().min(0, 'Height must be positive'),
  x: Yup.number().required(),
  y: Yup.number().required(),
}).defined();

export const moleculeViewSchema: Yup.ObjectSchema<MoleculeView> = Yup.object({
  floating: Yup.object({
    visible: Yup.boolean().required(),
    bounding: boundingBoxSchema.required(),
  }),
  showLabel: Yup.boolean().required(),
  atomAnnotation: Yup.mixed<'none' | 'atom-numbers' | 'custom-labels'>()
    .oneOf(['none', 'atom-numbers', 'custom-labels'])
    .required()
    .default('none'),
}).defined();

const labelStyle: LabelStyle = {
  label: { flex: 4, fontWeight: '500' },
  wrapper: { flex: 8, display: 'flex', alignItems: 'center' },
  container: { padding: '5px 0' },
};

const styles = {
  select: {
    width: '100%',
    minWidth: '100px',
    maxWidth: '280px',
    height: 30,
    margin: 0,
  },
  groupHeader: {
    borderBottom: '1px solid #efefef',
    paddingBottom: '5px',
    fontWeight: '600',
    color: '#005d9e',
  },
};

interface MoleculeOptionsPanelProps {
  onClose: () => void;
}

export function MoleculeOptionsPanel(props: MoleculeOptionsPanelProps) {
  const { onClose } = props;
  const {
    current: { defaultMoleculeSettings },
  } = usePreferences();
  const { handleSubmit, control } = useForm<MoleculeView>({
    defaultValues: defaultMoleculeSettings,
    resolver: yupResolver(moleculeViewSchema),
  });
  const { dispatch } = usePreferences();

  function handleSave() {
    void handleSubmit((values) => {
      dispatch({ type: 'CHANGE_DEFAULT_MOLECULE_SETTINGS', payload: values });
      onClose();
    })();
  }
  return (
    <Container>
      <PreferencesHeader onSave={handleSave} onClose={onClose} />
      <InnerContainer>
        <GroupPane
          text="General"
          style={{
            header: styles.groupHeader,
          }}
        >
          <Label title="Show label" style={labelStyle}>
            <CheckController control={control} name="showLabel" />
          </Label>
          <Label title="Atom annotation" style={labelStyle}>
            <Select2Controller
              control={control}
              items={atomAnnotations}
              name="atomAnnotation"
            />
          </Label>
        </GroupPane>
        <GroupPane
          text="Size & position"
          style={{
            header: styles.groupHeader,
          }}
        >
          <Label title="Floating molecule" style={labelStyle}>
            <CheckController control={control} name="floating.visible" />
          </Label>
          <Label title="X (%)" style={labelStyle}>
            <NumberInput2Controller
              control={control}
              name="floating.bounding.x"
              fill
            />
          </Label>
          <Label title="Y (%)" style={labelStyle}>
            <NumberInput2Controller
              control={control}
              name="floating.bounding.y"
              fill
            />
          </Label>
          <Label title="Width" style={labelStyle}>
            <NumberInput2Controller
              control={control}
              name="floating.bounding.width"
              fill
            />
          </Label>
          <Label title="Height" style={labelStyle}>
            <NumberInput2Controller
              control={control}
              name="floating.bounding.height"
              fill
            />
          </Label>
        </GroupPane>
      </InnerContainer>
    </Container>
  );
}
