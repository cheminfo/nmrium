import { Dialog, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { autoLabelDatabase } from 'openchemlib-utils';
import { useState } from 'react';
import { MF } from 'react-mf';
import { IdcodeSvgRenderer } from 'react-ocl';
import { filter } from 'smart-array-filter';

import { StyledDialogBody } from '../elements/StyledDialogBody.js';

const ChemicalGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  justify-content: flex-start;
  padding: 0.5rem 1rem;
  flex: 1;
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

const SearchContainer = styled.div`
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const SearchInput = styled(InputGroup)`
  input {
    background: #eceff7;

    &:focus {
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    }
  }
`;

const NoResults = styled.p`
  text-align: center;
  color: #6b7280;
  font-size: 1rem;
  padding: 3rem;
`;
interface MoleculeAutoLabelsDatabaseModalProps {
  onClose?: (element?: string) => void;
}

export function MoleculeAutoLabelsDatabaseModal({
  onClose = () => null,
}: MoleculeAutoLabelsDatabaseModalProps) {
  const [keywords, setSearch] = useState('');

  const filteredLabelDatabase = filter(autoLabelDatabase, { keywords });

  return (
    <Dialog
      isOpen
      onClose={() => onClose()}
      style={{ width: '90vw', maxWidth: 1000, height: '80vh' }}
      title="Auto label database"
    >
      <StyledDialogBody style={{ padding: 0 }}>
        <SearchContainer>
          <SearchInput
            size="large"
            placeholder="Search for a parameter"
            value={keywords}
            onChange={({ target }) => {
              if (target.value !== undefined) {
                setSearch(target.value);
              }
            }}
            leftIcon="search"
            type="search"
          />
        </SearchContainer>
        {filteredLabelDatabase.length === 0 ? (
          <NoResults>No results found for &quot;{keywords}&quot;</NoResults>
        ) : (
          <ChemicalGrid>
            {filteredLabelDatabase.map((compound) => (
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
        )}
      </StyledDialogBody>
    </Dialog>
  );
}
