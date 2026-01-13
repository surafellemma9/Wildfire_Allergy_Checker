# Testing Documentation

This project uses **Vitest** for unit testing, which is a fast and modern testing framework that works seamlessly with Vite.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Test Files

1. **`src/utils/__tests__/allergy-checker.test.ts`**
   - Tests the core allergy checking logic
   - Tests allergen detection (dairy, egg, gluten, shellfish, etc.)
   - Tests composite ingredient detection
   - Tests substitution generation
   - Tests edge cases and custom allergens

2. **`src/components/__tests__/AllergyChecker.test.tsx`**
   - Tests the React component functionality
   - Tests user interactions (selecting dishes, allergens)
   - Tests UI state management
   - Tests form validation

3. **`src/data/__tests__/menu-items.test.ts`**
   - Tests menu data integrity
   - Validates data structure
   - Checks for required fields
   - Ensures data consistency

## Test Coverage

Current test coverage includes:

- ✅ Allergen detection for all 12 allergen types
- ✅ Composite ingredient checking (sauces, marinades, etc.)
- ✅ Substitution generation logic
- ✅ Custom allergen detection
- ✅ Edge cases (empty descriptions, no allergens, etc.)
- ✅ Menu data validation
- ✅ Component rendering and interactions

## Writing New Tests

### Example: Testing Allergen Detection

```typescript
import { describe, it, expect } from 'vitest';
import { checkDishSafety } from '../allergy-checker';

describe('My Test Suite', () => {
  it('should detect allergen correctly', () => {
    const dish = createMenuItem({
      description: 'Dish with butter',
      contains_dairy: 'Y',
    });
    const result = checkDishSafety(dish, ['dairy'], []);
    
    expect(result.overallStatus).toBe('unsafe');
    expect(result.perAllergy[0].status).toBe('unsafe');
  });
});
```

### Example: Testing Component

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle user interaction', async () => {
  const user = userEvent.setup();
  render(<AllergyChecker />);
  
  const input = screen.getByPlaceholderText(/search/i);
  await user.type(input, 'test');
  
  expect(screen.getByText('test')).toBeInTheDocument();
});
```

## Best Practices

1. **Test one thing at a time** - Each test should verify a single behavior
2. **Use descriptive test names** - Test names should clearly describe what they test
3. **Arrange-Act-Assert** - Structure tests with clear setup, action, and verification
4. **Test edge cases** - Include tests for empty inputs, null values, etc.
5. **Keep tests independent** - Tests should not depend on each other
6. **Mock external dependencies** - Use mocks for API calls, file system, etc.

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipeline
- Before deploying to production

## Current Status

- **Total Tests**: 49
- **Passing**: 37
- **Failing**: 12 (mostly component integration tests that need UI library setup)

The core allergy checking logic is well-tested and reliable. Component tests may need additional setup for UI components.



