
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SwotAnalysisPage from '../[locale]/swot-analysis/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('SwotAnalysisPage', () => {
  it('renders the SWOT Analysis page header', () => {
    renderWithProviders(<SwotAnalysisPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
