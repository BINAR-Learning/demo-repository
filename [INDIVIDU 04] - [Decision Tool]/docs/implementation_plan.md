# Implementation Plan: Decision Tool (Revised Development Phases)

## Project Description
This project is a web-based decision support tool that helps users make better choices using various decision-making frameworks. The app supports multiple languages/locales, allowing users to interact with the tool in their preferred language. The [locale] folder contains all locale-specific pages and logic for the app. The components/ folder contains reusable UI and utility components that power the user interface and experience.

## Features Overview
- **Locale System**: Dynamic routing, locale-aware SEO, language switching
- **Decision Tools**: 9 different decision-making frameworks with AI-powered suggestions
- **API Integration**: OpenAI GPT-4o for intelligent decision analysis
- **Component Library**: Reusable UI components with accessibility and responsiveness
- **Data Management**: State persistence, export capabilities, and sharing features

---

## Phase 1: Foundation & Core Infrastructure

### 1.1 Base Configuration & Utilities
**Goal**: Establish core utilities, constants, and configuration that everything else depends on.

#### Lib Foundation (lib/)
- [x] Implement `consts.ts` - App-wide constants and default values
- [x] Implement `utils.ts` - General utility functions (formatting, parsing, helpers)
- [x] Implement `cookies.ts` - Cookie management for locale and preferences
- [x] Implement `toolsConfig.ts` & `toolsConfigType.ts` - Decision tool configurations and types
- [x] Write unit tests for all utility functions and configurations
- [x] Add codecov

#### Translation System (messages/ & i18n/)
- [x] Create translation files (`en.json`, `id.json`) with base structure
- [x] Implement `i18n/settings.ts` - Locale configuration and supported languages
- [x] Implement `i18n/request.ts` - Locale detection and translation loading utilities
- [x] Write unit tests for translation file structure and locale detection
- [x] Write validation tests for missing/unused translation keys

### 1.2 Core Hooks & State Management
**Goal**: Build the foundational hooks that will be used throughout the application.

#### Essential Hooks (hooks/)
- [x] Implement `useLocalStorage.ts` - Browser storage persistence
- [x] Implement `useBreakpoint.ts` - Responsive design utilities
- [x] Implement `useToast.ts` - Notification system state management
- [x] Implement `useDecisionTool.ts` - Central state management for all decision tools
- [x] Write comprehensive unit tests for all hooks

---

## Phase 2: UI Component Library

### 2.1 Base UI Components
**Goal**: Create the fundamental UI building blocks with proper accessibility and responsiveness.

#### Core UI Components (components/ui/)
- [x] Implement `button.tsx` - Reusable button component
- [x] Implement `card.tsx` - Content grouping and layout
- [x] Implement `input.tsx`, `textarea.tsx`, `label.tsx` - Form elements
- [x] Implement `dropdown-menu.tsx`, `slider.tsx` - Interactive form controls
- [x] Implement `table.tsx` - Tabular data display
- [x] Implement `tabs.tsx` - Tab navigation system
- [x] Implement `progress.tsx`, `separator.tsx` - Layout and progress indicators
- [x] Implement `tooltip.tsx` - Contextual help system
- [x] Write unit tests for all UI components
- [ ] Ensure accessibility (ARIA, keyboard navigation) for all components
- [x] Ensure responsiveness (mobile/desktop) for all components

### 2.2 Advanced UI Components
**Goal**: Build complex interactive components and notification systems.

#### Modal & Overlay Components (components/)
- [x] Implement `confirmation-dialog.tsx` - User action confirmation
- [x] Implement `alert-dialog.tsx` - Warning and error alerts
- [x] Implement `loading-overlay.tsx` - Loading state management
- [x] Implement `toast.tsx` & `toaster.tsx` - Toast notification system
- [x] Write unit tests for all dialog and overlay components

#### Feature-Specific Components (components/)
- [x] Implement `tool-card.tsx` - Decision tool selection cards
- [x] Implement `textarea-with-button.tsx` - Combined input and action component
- [x] Write unit tests for feature-specific components

---

## Phase 3: API & AI Integration

### 3.1 AI-Powered Decision Support
**Goal**: Implement the backend API and AI integration before building decision tools.

#### API Development (api/)
- [x] Implement POST `/api/ai` endpoint
- [x] Integrate with OpenAI GPT-4o API
- [x] Implement request validation and parsing
- [x] Implement response formatting and error handling
- [x] Secure API key management (environment variables)
- [x] Add comprehensive logging for errors and events
- [x] Write unit tests for API endpoint (valid/invalid requests)
- [x] Write unit tests for OpenAI integration (mocked)
- [x] Write unit tests for error handling and edge cases

#### AI Integration Hook (hooks/)
- [x] Implement `useAiGeneration.ts` - API communication and state management
- [x] Handle loading states, results, and error scenarios
- [x] Write unit tests for AI generation hook (with mocked API)

### AI Prompt System (lib/)
- [x] Implement `prompts.ts` - AI prompt templates for each decision tool
- [x] Create context-aware prompts for better AI responses
- [x] Write unit tests for prompt generation and templates

### Home Page Chatbox AI Recommendation (New Feature)
- [x] Add chatbox UI to home page using `TextareaWithButton` component
- [ ] Implement chat submit handler to call AI generation API with user input
- [ ] Design AI prompt to recommend the best decision tool and generate options for user's context
- [ ] Parse AI response to extract recommended tool and generated options
- [ ] Redirect user to the recommended tool's page with options pre-filled/applied
- [ ] Ensure options are rendered/applied on the tool page after redirect
- [ ] Write unit tests for chatbox interaction and AI integration

---

## Phase 4: Locale System & Routing

### 4.1 Internationalization Infrastructure
**Goal**: Implement the complete locale system before building locale-specific pages.

#### Locale Routing & Layout ([locale]/)
- [x] Implement dynamic locale routing (e.g., /en, /id, etc.)
- [x] Create shared layout component for locale pages
- [x] Implement locale detection and redirection logic
- [x] Write unit tests for locale routing and layout

#### Language Switching (components/)
- [x] Implement `language-switcher.tsx` - Language selection component
- [x] Integrate with i18n system for locale updates
- [x] Ensure state preservation during language switches
- [x] Add language switcher to main layout
- [x] Write unit tests for language switcher and integration

### 4.2 SEO & Metadata
**Goal**: Implement locale-aware SEO features.

#### SEO Implementation ([locale]/)
- [ ] Generate `robots.txt` per locale
- [ ] Generate `sitemap.xml` per locale
- [ ] Implement locale-specific meta tags and structured data
- [ ] Write unit tests for SEO file generation

---

## Phase 5: Decision Tools Implementation

### 5.1 Sample Data & Export System
**Goal**: Prepare supporting systems before building individual tools.


#### Supporting Systems (lib/)
- [x] Implement `sampleData.ts` - Example data for each decision tool
- [x] Implement `export-utils.ts` - Data export functionality (CSV, JSON)
- [x] Write unit tests for sample data and export utilities


#### Sharing & Export Components (components/)
- [x] Implement `share-url-button.tsx` - URL-based state sharing
- [x] Implement `see-result-button.tsx` - Result navigation and display
- [x] Create hook for URL state serialization (`useShareUrl`)
- [x] Write unit tests for sharing components and URL serialization

### 5.2 Decision Tool Pages
**Goal**: Implement all decision tool pages with consistent patterns and full functionality.

#### Core Decision Tools ([locale]/)
- [x] Implement Eisenhower Matrix page (as reference implementation)
  - Context input, task management, quadrant visualization
  - Integration with `useDecisionTool` hook
  - AI suggestions, sharing, and export features
- [x] Implement Pros & Cons page
- [x] Implement Decision Matrix page
- [x] Implement SWOT Analysis page
- [x] Implement Cost-Benefit page
- [x] Implement Decision Tree page
- [x] Implement Scenario Planning page
- [x] Implement Random Decision page
- [x] Implement Weighted Random page

#### Tool Integration & Testing
- [x] Integrate all tools with AI suggestion system
- [x] Implement state persistence for all tools
- [x] Add export functionality to all tools
- [x] Add sharing capabilities to all tools
- [x] Write unit tests for each decision tool page
- [ ] Write integration tests for tool-to-tool navigation

---

## Phase 6: Quality Assurance & Polish

### 6.1 Comprehensive Testing
**Goal**: Ensure reliability and maintainability through thorough testing.

#### Test Coverage Completion
- [x] Achieve 80%+ test coverage for all hooks
- [x] Achieve 80%+ test coverage for all components
- [x] Achieve 80%+ test coverage for all API endpoints
- [x] Achieve 80%+ test coverage for all utility functions
- [ ] Write integration tests for complete user workflows
- [ ] Write end-to-end tests for critical user journeys

#### Translation & Accessibility Validation
- [ ] Validate translation completeness across all languages
- [ ] Run accessibility audits on all pages and components
- [ ] Test keyboard navigation and screen reader compatibility
- [ ] Validate responsive design across different screen sizes

### 6.2 Performance & User Experience
**Goal**: Optimize performance and refine user experience.

#### Performance Optimization
- [ ] Implement code splitting for decision tool pages
- [ ] Optimize bundle size and loading performance
- [ ] Add performance monitoring and metrics
- [ ] Implement proper caching strategies

#### User Experience Polish
- [ ] Add loading states and skeleton screens
- [ ] Implement smooth transitions and animations
- [ ] Add helpful tooltips and onboarding guidance
- [ ] Conduct user testing and iterate based on feedback

### 6.3 DevOps & Deployment
**Goal**: Establish robust CI/CD and monitoring systems.

#### CI/CD Pipeline
- [ ] Set up GitHub Actions workflow for automated testing
- [ ] Configure linting, type checking, and code quality gates
- [ ] Set up SonarCloud integration for code quality monitoring
- [ ] Implement automated deployment pipeline
- [ ] Set up error monitoring and alerting

---

## Development Guidelines

### Recommended Development Order
1. **Start with Phase 1** - Build the foundation that everything depends on
2. **Complete Phase 2** - Ensure UI components are solid before using them
3. **Implement Phase 3** - Get AI integration working before building tools that use it
4. **Build Phase 4** - Establish locale system before creating locale-specific pages
5. **Execute Phase 5** - Implement decision tools with all supporting systems in place
6. **Finish with Phase 6** - Polish and optimize the complete application

### Key Success Metrics
- All decision tools functional with AI integration
- Complete internationalization support
- 90%+ test coverage across all modules
- Accessibility compliance (WCAG 2.1 AA)
- Mobile-responsive design
- Sub-3-second page load times
- Zero critical security vulnerabilities

### Phase Dependencies
- **Phase 2 depends on Phase 1**: UI components need utilities and configuration
- **Phase 3 can run parallel to Phase 2**: API development is independent of UI
- **Phase 4 depends on Phase 1**: Locale system needs i18n configuration
- **Phase 5 depends on Phases 1-4**: Decision tools need all foundational systems
- **Phase 6 depends on Phase 5**: Testing and optimization require complete features
