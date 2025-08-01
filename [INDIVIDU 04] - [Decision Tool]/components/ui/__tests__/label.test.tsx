import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from '../label';

describe('Label', () => {
  it('renders label element', () => {
    render(<Label htmlFor="test-input">Label text</Label>);
    expect(screen.getByText('Label text')).toBeInTheDocument();
  });
});
