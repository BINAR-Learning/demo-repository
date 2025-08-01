import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { Toaster } from '../toaster';

describe('Toaster', () => {
  it('renders without crashing', () => {
    render(<Toaster />);
    // No error means pass
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });
});
