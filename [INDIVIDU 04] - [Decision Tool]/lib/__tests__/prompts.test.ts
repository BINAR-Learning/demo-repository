import { prompts } from '../prompts';
import { describe, it, expect } from 'vitest';

// List of expected tool keys (update if you add more tools)
const expectedTools = [
  'decisionMatrix',
  'eisenhowerMatrix',
  'prosCons',
  'swotAnalysis',
  'costBenefit',
  'decisionTree',
  'scenarioPlanning',
  'randomDecision',
  'weightedRandom',
];

describe('prompts', () => {
  it('should export a prompt for each tool', () => {
    for (const tool of expectedTools) {
      expect(prompts).toHaveProperty(tool);
      expect(typeof prompts[tool]).toBe('string');
      expect(prompts[tool].length).toBeGreaterThan(20);
    }
  });

  it('should not contain markdown or code block delimiters', () => {
    for (const key in prompts) {
      expect(prompts[key]).not.toMatch(/```/);
      expect(prompts[key]).not.toMatch(/\n#/);
    }
  });

  it('should mention JSON output in every prompt', () => {
    for (const key in prompts) {
      expect(prompts[key].toLowerCase()).toContain('json');
    }
  });
});
