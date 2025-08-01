// Mock window.matchMedia for tests (jsdom does not implement it)
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function matchMedia() {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
      media: '',
    };
  };
}
import React, { PropsWithChildren } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { render } from '@testing-library/react';


// Provide a minimal translation messages object
const messages = {
  tools: {
    eisenhowerMatrix: { title: 'Eisenhower Matrix' },
    prosCons: { title: 'Pros & Cons' },
    decisionMatrix: { title: 'Decision Matrix' },
    swotAnalysis: { title: 'SWOT Analysis' },
    costBenefit: { title: 'Cost-Benefit' },
    decisionTree: { title: 'Decision Tree' },
    scenarioPlanning: { title: 'Scenario Planning' },
    randomDecision: { title: 'Random Decision' },
    weightedRandom: { title: 'Weighted Random' },
  },
  prosCons: {
    title: 'Pros & Cons',
    decisionContext: 'Decision Context',
    contextPlaceholder: 'Enter your context...',
    generateAi: 'Generate with AI',
    pros: {
      title: 'Pros',
      description: 'List the advantages.',
      placeholder: 'Add a pro...',
      addPro: 'Add Pro',
    },
    cons: {
      title: 'Cons',
      description: 'List the disadvantages.',
      placeholder: 'Add a con...',
      addCon: 'Add Con',
    },
  },
  decisionMatrix: {
    title: 'Decision Matrix',
    context: {
      title: 'Context',
      description: 'Describe your decision context.',
      placeholder: 'Enter your context...'
    },
    generateAi: 'Generate with AI',
    options: {
      title: 'Options',
      description: 'List your options.',
      placeholder: 'Add an option...',
      add: 'Add Option',
    },
    criteria: {
      title: 'Criteria',
      description: 'List your criteria.',
      placeholder: 'Add a criterion...',
      add: 'Add Criterion',
    },
  },
  swotAnalysis: {
    title: 'SWOT Analysis',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    opportunities: 'Opportunities',
    threats: 'Threats',
  },
  costBenefit: {
    title: 'Cost-Benefit',
    context: {
      title: 'Context',
      description: 'Describe your decision context.',
      placeholder: 'Enter your context...'
    },
    analysisContext: 'Analysis Context',
    analysisContextPlaceholder: 'Enter analysis context...',
    generateAi: 'Generate with AI',
    costs: {
      title: 'Costs',
      description: 'List the costs.',
      placeholder: 'Add a cost...',
      valueLabel: 'Value',
      timeframeLabel: 'Timeframe',
      shortTerm: 'Short Term',
      mediumTerm: 'Medium Term',
      longTerm: 'Long Term',
      monetaryCostLabel: 'Monetary Cost',
      addCost: 'Add Cost',
    },
    benefits: {
      title: 'Benefits',
      description: 'List the benefits.',
      placeholder: 'Add a benefit...',
      addBenefit: 'Add Benefit',
    },
  },
  decisionTree: {
    title: 'Decision Tree',
    context: {
      title: 'Context',
      description: 'Describe your decision context.',
      placeholder: 'Enter your context...'
    },
    generateAi: 'Generate with AI',
    tree: {
      title: 'Decision Tree',
      description: 'Build your tree.',
      addOption: 'Add Option',
    },
    node: {
      valueLabel: 'Value',
    },
    analysis: {
      expectedValue: 'Expected Value',
    },
  },
  scenarioPlanning: {
    title: 'Scenario Planning',
    context: {
      title: 'Context',
      description: 'Describe your decision context.',
      placeholder: 'Enter your context...'
    },
    analysisContext: 'Analysis Context',
    analysisContextPlaceholder: 'Enter analysis context...',
    generateAi: 'Generate with AI',
    futureScenarios: {
      title: 'Future Scenarios',
      description: 'Describe possible futures.',
      probabilityWarning: 'Probabilities must sum to 100%.',
      namePlaceholder: 'Scenario name...',
      descriptionPlaceholder: 'Scenario description...',
      probabilityLabel: 'Probability',
      addScenario: 'Add Scenario',
    },
    strategicOptions: {
      title: 'Strategic Options',
      description: 'List your options.',
      namePlaceholder: 'Option name...',
      descriptionPlaceholder: 'Option description...',
      addOption: 'Add Option',
    },
  },
  randomDecision: {
    title: 'Random Decision',
    decisionContext: 'Decision Context',
    contextPlaceholder: 'Enter your context...',
    generateAi: 'Generate with AI',
    options: {
      title: 'Options',
      description: 'List your options.',
      placeholder: 'Add an option...',
      add: 'Add Option',
    },
    decisionMethod: {
      simpleRandom: 'Simple Random',
    },
  },
  weightedRandom: {
    title: 'Weighted Random',
    decisionContext: 'Decision Context',
    contextPlaceholder: 'Enter your context...',
    generateAi: 'Generate with AI',
    options: {
      title: 'Options',
      description: 'List your options.',
      showProbabilities: 'Show Probabilities',
      placeholder: 'Add an option...',
      add: 'Add Option',
    },
    decisionMethod: {
      pickWeighted: 'Pick Weighted',
    },
  },
  common: {
    back: 'Back',
    or: 'or',
    showSample: 'Show sample',
    seeResultButton: 'See Result',
    shareNote: 'Share this page',
    add: 'Add',
    resetConfirmation: {
      title: 'Reset Confirmation',
      description: 'Are you sure you want to reset?',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
    exampleConfirmation: {
      title: 'Example Confirmation',
      description: 'Are you sure you want to show an example?',
      cancel: 'Cancel',
      confirm: 'Confirm',
    },
  },
  eisenhowerMatrix: {
    context: {
      title: 'Context',
      description: 'Describe your decision context.',
      placeholder: 'Enter your context here...'
    },
    generateAi: 'Generate with AI',
    quadrants: {
      q1: {
        title: 'Urgent & Important',
        description: 'Do these tasks first.',
        action: 'Act now',
      },
      q2: {
        title: 'Not Urgent & Important',
        description: 'Schedule these tasks.',
        action: 'Plan',
      },
      q3: {
        title: 'Urgent & Not Important',
        description: 'Delegate these tasks.',
        action: 'Delegate',
      },
      q4: {
        title: 'Not Urgent & Not Important',
        description: 'Eliminate these tasks.',
        action: 'Eliminate',
      },
    },
    tasks: {
      title: 'Tasks',
      description: 'List your tasks.',
      placeholder: 'Add a new task...',
      add: 'Add',
    },
  },
};

export function renderWithProviders(ui: React.ReactElement, { locale = 'en' } = {}) {
  return render(
    <TooltipProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {ui}
      </NextIntlClientProvider>
    </TooltipProvider>
  );
}
