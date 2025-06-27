# AI Hackathon 2025 - React TypeScript Project

## Project Overview
This is a React + TypeScript + Vite project for the AI Hackathon 2025. The project uses modern React 18 with TypeScript for type safety and Vite for fast development and building.

## Development Guidelines

### Code Style
- Use functional components with TypeScript
- Prefer `const` with arrow functions for component definitions
- Use descriptive, meaningful variable and function names
- Keep components small and focused on a single responsibility
- Extract custom hooks for reusable logic

### TypeScript Conventions
- Always define proper types for props, state, and function parameters
- Avoid using `any` type - use `unknown` if type is truly unknown
- Create interface definitions for complex objects
- Use type inference where possible to reduce verbosity
- Place type definitions close to where they're used

### React Best Practices
- Use React hooks appropriately (useState, useEffect, useMemo, useCallback)
- Minimize useEffect usage - prefer derived state and event handlers
- Memoize expensive computations with useMemo
- Wrap callbacks in useCallback when passing to child components
- Handle loading, error, and success states explicitly

### Component Structure
```typescript
interface ComponentProps {
  // Define props here
}

export const ComponentName: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState<Type>(initialValue);
  
  // Event handlers and logic
  const handleEvent = useCallback(() => {
    // Handle event
  }, [dependencies]);
  
  // Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};
```

### File Organization
- Components go in `src/components/`
- Custom hooks in `src/hooks/`
- Utility functions in `src/utils/`
- Type definitions in `src/types/` or colocated with components
- Keep related files close together

### Testing Approach
- Write tests for critical business logic
- Test user interactions and edge cases
- Use React Testing Library for component tests
- Mock external dependencies appropriately

### State Management
- Use local state for component-specific data
- Consider Context API for cross-component state
- Keep state as close to where it's used as possible
- Lift state up only when necessary

### Performance Considerations
- Use React.memo for expensive pure components
- Implement proper key props for lists
- Lazy load components and routes when appropriate
- Optimize re-renders by proper dependency management

### Styling
- Use CSS modules or styled-components for component styling
- Follow mobile-first responsive design
- Maintain consistent spacing and color schemes
- Use CSS variables for theme values

### Error Handling
- Implement error boundaries for component trees
- Provide meaningful error messages to users
- Log errors appropriately for debugging
- Handle async errors in try-catch blocks

### Accessibility
- Use semantic HTML elements
- Add proper ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast ratios

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Key Dependencies
- React 18.3.1 - UI library
- TypeScript 5.5.3 - Type safety
- Vite 5.4.1 - Build tool and dev server
- ESLint - Code linting

## AI Assistant Instructions
When working on this project:
1. Always check existing patterns before implementing new features
2. Maintain TypeScript type safety throughout
3. Follow React best practices and hooks rules
4. Keep components testable and maintainable
5. Consider performance implications of changes
6. Ensure accessibility standards are met
7. Write clear, self-documenting code
8. Update types when modifying data structures
9. Test changes thoroughly before marking complete
10. Follow the established project structure

## Hackathon Specific Notes
- Focus on rapid prototyping while maintaining code quality
- Prioritize core functionality over perfect polish
- Document any shortcuts taken for time constraints
- Keep the UI intuitive and user-friendly
- Consider demo-ability of features
- Ensure the project runs smoothly for presentation

## Changelog Management
- Add a changelog file after each main step in completed format Step {no} title.md