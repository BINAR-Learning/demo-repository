import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as Slider from '../slider';

describe('Slider', () => {
  it('renders without crashing', () => {
    render(<Slider.Slider />);
  });
});
