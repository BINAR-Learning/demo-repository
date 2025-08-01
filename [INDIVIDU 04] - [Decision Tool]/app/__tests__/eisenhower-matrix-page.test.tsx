import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EisenhowerMatrixPage from '../[locale]/eisenhower-matrix/page';


vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('EisenhowerMatrixPage', () => {
  it('renders the Eisenhower Matrix page header', () => {
    renderWithProviders(<EisenhowerMatrixPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
