import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as Table from '../table';

describe('Table', () => {
  it('renders without crashing', () => {
    render(<Table.Table />);
  });
});
