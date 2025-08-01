import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as Progress from '../progress';

describe('Progress', () => {
  it('renders without crashing', () => {
    render(<Progress.Progress value={50} />);
  });
});
