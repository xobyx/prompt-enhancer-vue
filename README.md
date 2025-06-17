# Vue.js 3 Prompt Engineering Assistant

This project has been successfully converted from React to Vue.js 3, maintaining all the original functionality while leveraging Vue's modern composition API and ecosystem.

## Project Overview

The Prompt Engineering Assistant is a comprehensive web application that helps users enhance their prompts using Google's Gemini AI. It includes features for:

- **Prompt Enhancement**: Multiple enhancement approaches (comprehensive, creative, technical)
- **Project Management**: Organize prompts into projects with history tracking
- **Workflow Builder**: Create complex multi-step prompt workflows with conditional logic
- **Comparison Tools**: Compare different prompt variants side-by-side
- **Dark Mode**: Full dark/light theme support
- **Export Functionality**: Export results in various formats

## Key Conversion Changes

### Architecture
- **Framework**: React → Vue.js 3 with Composition API
- **State Management**: React useState/useEffect → Pinia store
- **Styling**: Maintained Tailwind CSS with Vue-compatible configuration
- **TypeScript**: Preserved full TypeScript support with Vue-specific types

### Component Structure
- **App.vue**: Main application component with routing logic
- **Pinia Store**: Centralized state management for all application data
- **Vue Components**: All React components converted to Vue SFC format
- **Composition API**: Modern Vue 3 patterns with `<script setup>` syntax

### Dependencies
- **Vue 3**: Core framework with TypeScript support
- **Pinia**: State management (replaces React state)
- **Lucide Vue Next**: Icon library (Vue version of Lucide React)
- **Marked**: Markdown rendering (replaces react-markdown)
- **@google/generative-ai**: Maintained for Gemini API integration
- **@vueuse/core**: Vue composition utilities

## Project Structure

```
src/
├── components/           # Vue components
│   ├── App.vue          # Main application component
│   ├── ComparisonPanel.vue
│   ├── HistoryPanel.vue
│   ├── LoadingSkeleton.vue
│   ├── MarkdownRenderer.vue
│   ├── ProjectSidebar.vue
│   ├── PromptCard.vue
│   ├── WorkflowBuilder.vue
│   ├── WorkflowHistoryView.vue
│   └── WorkflowRunner.vue
├── stores/              # Pinia stores
│   └── app.ts          # Main application store
├── types/               # TypeScript type definitions
│   └── appTypes.ts
├── utils/               # Utility functions
│   ├── apiUtils.ts
│   ├── exportUtils.ts
│   ├── storageUtils.ts
│   └── workflowUtils.ts
├── constants/           # Application constants
│   ├── appConstants.ts
│   └── conditionTemplates.ts
├── main.ts             # Application entry point
└── style.css           # Global styles
```

## Features Preserved

All original React functionality has been preserved:

1. **Prompt Enhancement**: Three enhancement modes with customizable parameters
2. **Project Management**: Create, switch between, and manage multiple projects
3. **History Tracking**: Full prompt history with ability to reload previous sessions
4. **Workflow System**: Visual workflow builder with conditional logic
5. **Comparison Tools**: Side-by-side comparison of prompt variants
6. **Export Options**: JSON export functionality
7. **Dark Mode**: Persistent theme switching
8. **Responsive Design**: Mobile-friendly interface

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## Configuration

- **Environment Variables**: Place your Gemini API key in `.env.local`
- **Tailwind CSS**: Configured for Vue 3 with dark mode support
- **TypeScript**: Strict mode enabled with Vue-specific configurations
- **Vite**: Modern build tool with hot module replacement

## Key Vue 3 Features Used

- **Composition API**: Modern reactive programming model
- **Script Setup**: Simplified component syntax
- **Pinia**: Official Vue state management
- **TypeScript Integration**: Full type safety
- **Reactive References**: Vue's reactivity system
- **Computed Properties**: Efficient derived state
- **Watchers**: Side effect management

## Migration Notes

The conversion maintains 100% feature parity with the original React version while taking advantage of Vue 3's modern features:

- State management is now centralized in Pinia stores
- Components use Vue's Composition API for better code organization
- Template syntax provides cleaner component structure
- Vue's reactivity system offers more efficient updates
- TypeScript integration is seamless with Vue 3

This Vue.js 3 version provides the same powerful prompt engineering capabilities with improved performance and developer experience.

