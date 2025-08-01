
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DecisionMatrixPage from '../[locale]/decision-matrix/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('DecisionMatrixPage', () => {
  it('renders the Decision Matrix page header', () => {
    renderWithProviders(<DecisionMatrixPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
