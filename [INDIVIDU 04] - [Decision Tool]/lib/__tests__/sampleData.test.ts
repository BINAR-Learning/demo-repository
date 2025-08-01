import {
  getDecisionMatrixData,
  getProsConsData,
  getCostBenefitData,
  getDecisionTreeData,
  getEisenhowerMatrixData,
  getRandomDecisionData,
  getScenarioPlanningData,
  getSwotAnalysisData,
  getWeightedRandomData,
} from '../sampleData';

describe('sampleData', () => {
  const t = (key: string) => key; // mock translation function

  it('should return valid decision matrix data', () => {
    const data = getDecisionMatrixData(t);
    expect(data.options.length).toBeGreaterThan(0);
    expect(data.criteria.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid pros/cons data', () => {
    const data = getProsConsData(t);
    expect(data.pros.length).toBeGreaterThan(0);
    expect(data.cons.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid cost/benefit data', () => {
    const data = getCostBenefitData(t);
    expect(data.costs.length).toBeGreaterThan(0);
    expect(data.benefits.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid decision tree data', () => {
    const data = getDecisionTreeData(t);
    expect(data.rootNode).toBeDefined();
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid Eisenhower matrix data', () => {
    const data = getEisenhowerMatrixData(t);
    expect(data.tasks.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid random decision data', () => {
    const data = getRandomDecisionData(t);
    expect(data.options.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid scenario planning data', () => {
    const data = getScenarioPlanningData(t);
    expect(data.scenarios.length).toBeGreaterThan(0);
    expect(data.options.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid SWOT analysis data', () => {
    const data = getSwotAnalysisData(t);
    expect(data.strengths.length).toBeGreaterThan(0);
    expect(data.weaknesses.length).toBeGreaterThan(0);
    expect(data.opportunities.length).toBeGreaterThan(0);
    expect(data.threats.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });

  it('should return valid weighted random data', () => {
    const data = getWeightedRandomData(t);
    expect(data.options.length).toBeGreaterThan(0);
    expect(typeof data.decisionContext).toBe('string');
  });
});
