import { Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { autoLabelDatabase } from 'openchemlib-utils';
import { MF } from 'react-mf';
import { IdcodeSvgRenderer } from 'react-ocl';

import { StyledDialogBody } from '../elements/StyledDialogBody.js';

const ChemicalGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: flex-start;
  padding: 0 1rem;
`;

const ChemicalCard = styled.div`
  flex: 0 0 calc((100% - 2.5rem) / 3);
  min-width: 200px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const CardLabel = styled.div`
  padding: 0.75rem 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #f0f2f5 40%, #e2e6eb 100%);
  border-bottom: 1px solid #d1d5db;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);

  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
    text-align: center;
    text-transform: capitalize;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
  }
`;

const StructureContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: #fafafa;
  border-bottom: 1px solid #eee;
`;

const CardInfo = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
`;

const MolecularFormula = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
`;

interface MoleculeAutoLabelsDatabaseModalProps {
  onClose?: (element?: string) => void;
}

export function MoleculeAutoLabelsDatabaseModal({
  onClose = () => null,
}: MoleculeAutoLabelsDatabaseModalProps) {
  return (
    <Dialog
      isOpen
      onClose={() => onClose()}
      style={{ width: '90vw', maxWidth: 1000 }}
      title="Auto label database"
    >
      <StyledDialogBody>
        <ChemicalGrid>
          {autoLabelDatabase.map((compound) => (
            <ChemicalCard key={compound.label}>
              <CardLabel>
                <h3>{compound.label}</h3>
              </CardLabel>

              <StructureContainer>
                <IdcodeSvgRenderer
                  idcode={compound.idCode}
                  coordinates={compound.coordinates}
                  width={300}
                  height={200}
                />
              </StructureContainer>

              <CardInfo>
                <MolecularFormula>
                  <MF mf={compound.mf} /> -
                  <span> {compound.mw.toFixed(2)}</span>
                </MolecularFormula>
              </CardInfo>
            </ChemicalCard>
          ))}
        </ChemicalGrid>
      </StyledDialogBody>
      <DialogFooter />
    </Dialog>
  );
}
