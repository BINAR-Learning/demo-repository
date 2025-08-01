import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as Tabs from '../tabs';

describe('Tabs', () => {
  it('renders without crashing', () => {
    render(<Tabs.Tabs />);
  });
});
