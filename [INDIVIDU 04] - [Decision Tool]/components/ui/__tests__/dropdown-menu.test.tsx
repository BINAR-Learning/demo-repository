import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as DropdownMenu from '../dropdown-menu';

describe('DropdownMenu', () => {
  it('renders without crashing', () => {
    render(<DropdownMenu.DropdownMenu>Dropdown</DropdownMenu.DropdownMenu>);
  });
});
