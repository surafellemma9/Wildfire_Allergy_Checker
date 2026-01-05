import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllergyChecker } from '../AllergyChecker';

// Mock the menu items to avoid loading the full dataset
vi.mock('../../data/menu-items', () => ({
  menuItems: [
    {
      id: 'test-steak',
      dish_name: 'New York Strip Steak',
      ticket_code: 'NY STRIP',
      category: 'Steaks And Chops',
      menu: 'D',
      description: '14 oz. New York strip brushed with melted butter and seasoned with salt and pepper',
      allergy_raw: 'Dairy, shellfish',
      contains_dairy: true,
      contains_egg: false,
      contains_gluten: false,
      contains_shellfish: true,
      contains_fish: false,
      contains_soy: false,
      contains_nuts: false,
      contains_sesame: false,
      contains_msg: false,
      contains_peanuts: false,
      contains_tree_nuts: false,
      notes: '',
      mod_notes: '',
      cannot_be_made_safe_notes: '',
    },
    {
      id: 'test-side',
      dish_name: 'Roasted Market Vegetables',
      ticket_code: 'ROASTED VEG',
      category: 'Sides',
      menu: 'L & D',
      description: 'A blend of red onion, red pepper, Brussels sprouts, cauliflower and butternut squash',
      allergy_raw: '',
      contains_dairy: false,
      contains_egg: false,
      contains_gluten: false,
      contains_shellfish: false,
      contains_fish: false,
      contains_soy: false,
      contains_nuts: false,
      contains_sesame: false,
      contains_msg: false,
      contains_peanuts: false,
      contains_tree_nuts: false,
      notes: '',
      mod_notes: '',
      cannot_be_made_safe_notes: '',
    },
    {
      id: 'classic-breakfast',
      dish_name: 'Classic Breakfast',
      ticket_code: 'CLASSIC BREAKFAST',
      category: 'Brunch',
      menu: 'Weekend Brunch',
      description: 'Three eggs cooked to guest desired style, choice of three slices of bacon or two turkey sausage patties',
      allergy_raw: 'Dairy, egg',
      contains_dairy: true,
      contains_egg: true,
      contains_gluten: true,
      contains_shellfish: false,
      contains_fish: false,
      contains_soy: false,
      contains_nuts: false,
      contains_sesame: false,
      contains_msg: false,
      contains_peanuts: false,
      contains_tree_nuts: false,
      notes: '',
      mod_notes: '',
      cannot_be_made_safe_notes: '',
    },
  ],
}));

describe('AllergyChecker Component', () => {
  it('should render the component', () => {
    render(<AllergyChecker />);
    expect(screen.getByText('Allergy Safety Checker')).toBeInTheDocument();
  });

  it('should allow selecting a dish', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'New York');
    
    await waitFor(() => {
      expect(screen.getByText(/New York Strip Steak/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/New York Strip Steak/i));
    
    expect(screen.getByText(/New York Strip Steak/i)).toBeInTheDocument();
  });

  it('should allow selecting allergens', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    const allergenInput = screen.getByPlaceholderText(/Start typing allergen name/i);
    await user.type(allergenInput, 'dairy');
    
    await waitFor(() => {
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Dairy'));
    
    expect(screen.getByText('Dairy')).toBeInTheDocument();
  });

  it('should show side dish selection for entrees', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'New York');
    
    await waitFor(() => {
      expect(screen.getByText(/New York Strip Steak/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/New York Strip Steak/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Select Side Dish/i)).toBeInTheDocument();
    });
  });

  it('should show crust selection for steaks', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'New York');
    
    await waitFor(() => {
      expect(screen.getByText(/New York Strip Steak/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/New York Strip Steak/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Select Crusts/i)).toBeInTheDocument();
    });
  });

  it('should show protein selection for Classic Breakfast', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'Classic');
    
    await waitFor(() => {
      expect(screen.getByText(/Classic Breakfast/i)).toBeInTheDocument();
    });
    
    await user.click(screen.getByText(/Classic Breakfast/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Select Protein/i)).toBeInTheDocument();
    });
  });

  it('should require protein selection for Classic Breakfast before checking', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    // Select dish
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'Classic');
    await waitFor(() => {
      expect(screen.getByText(/Classic Breakfast/i)).toBeInTheDocument();
    });
    await user.click(screen.getByText(/Classic Breakfast/i));
    
    // Select allergen
    const allergenInput = screen.getByPlaceholderText(/Start typing allergen name/i);
    await user.type(allergenInput, 'dairy');
    await waitFor(() => {
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Dairy'));
    
    // Try to check safety without selecting protein
    const checkButton = screen.getByText('Check Safety');
    expect(checkButton).toBeDisabled();
  });

  it('should allow checking safety after selecting protein', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    // Select dish
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'Classic');
    await waitFor(() => {
      expect(screen.getByText(/Classic Breakfast/i)).toBeInTheDocument();
    });
    await user.click(screen.getByText(/Classic Breakfast/i));
    
    // Select allergen
    const allergenInput = screen.getByPlaceholderText(/Start typing allergen name/i);
    await user.type(allergenInput, 'dairy');
    await waitFor(() => {
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Dairy'));
    
    // Select protein
    await waitFor(() => {
      const proteinSelect = screen.getByText(/Select Protein/i).closest('div')?.querySelector('select');
      expect(proteinSelect).toBeInTheDocument();
    });
    
    const proteinSelect = screen.getByText(/Select Protein/i).closest('div')?.querySelector('select') as HTMLSelectElement;
    await user.selectOptions(proteinSelect, 'bacon');
    
    // Now check button should be enabled
    const checkButton = screen.getByText('Check Safety');
    expect(checkButton).not.toBeDisabled();
  });

  it('should display results after checking safety', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    // Select dish
    const dishInput = screen.getByPlaceholderText(/Start typing dish name/i);
    await user.type(dishInput, 'New York');
    await waitFor(() => {
      expect(screen.getByText(/New York Strip Steak/i)).toBeInTheDocument();
    });
    await user.click(screen.getByText(/New York Strip Steak/i));
    
    // Select allergen
    const allergenInput = screen.getByPlaceholderText(/Start typing allergen name/i);
    await user.type(allergenInput, 'dairy');
    await waitFor(() => {
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Dairy'));
    
    // Click check safety
    const checkButton = screen.getByText('Check Safety');
    await user.click(checkButton);
    
    // Should show results
    await waitFor(() => {
      expect(screen.getByText(/SAFE|UNSAFE/i)).toBeInTheDocument();
    });
  });

  it('should allow removing selected allergens', async () => {
    const user = userEvent.setup();
    render(<AllergyChecker />);
    
    // Select allergen
    const allergenInput = screen.getByPlaceholderText(/Start typing allergen name/i);
    await user.type(allergenInput, 'dairy');
    await waitFor(() => {
      expect(screen.getByText('Dairy')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Dairy'));
    
    // Should see the selected allergen badge
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    
    // Click remove button (×)
    const removeButton = screen.getByLabelText(/Remove Dairy/i);
    await user.click(removeButton);
    
    // Allergen should be removed
    await waitFor(() => {
      const badges = screen.queryAllByText('Dairy');
      expect(badges.length).toBe(0);
    });
  });
});


