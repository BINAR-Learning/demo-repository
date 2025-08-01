
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeightedRandomPage from '../[locale]/weighted-random/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('WeightedRandomPage', () => {
  it('renders the Weighted Random page header', () => {
    renderWithProviders(<WeightedRandomPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
