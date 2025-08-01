
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CostBenefitPage from '../[locale]/cost-benefit/page';
vi.mock('next/navigation', () => require('./__mocks__/next-navigation.js'));
import { renderWithProviders } from './test-utils';

describe('CostBenefitPage', () => {
  it('renders the Cost-Benefit page header', () => {
    renderWithProviders(<CostBenefitPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
