import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import Form from './Form';
import '@testing-library/jest-dom';

test('renders the form and handles submission', async () => {
  render(<Form />);

  // Mocking API response for the initial categories request
  await waitFor(() => screen.getByLabelText('Main Category:'));
  expect(screen.getByLabelText('Main Category:')).toBeInTheDocument();

  // Select 'Category 1' from the Main Category dropdown
  fireEvent.change(screen.getByLabelText('Main Category:'), {
    target: {value: '1'},
  });
  await waitFor(() => screen.getByLabelText('Sub Category:'));
  expect(screen.getByLabelText('Sub Category:')).toBeInTheDocument();

  // Select 'SubCategory 1' from the Sub Category dropdown
  fireEvent.change(screen.getByLabelText('Sub Category:'), {
    target: {value: '1'},
  });

  // Fill in the "Other SubCategory" input
  fireEvent.change(screen.getByPlaceholderText('Enter other subcategory'), {
    target: {value: 'Other SubCategory'},
  });

  // Mocking API response for the subcategoryOptions request
  await waitFor(() => screen.getByText('Option 1'));
  expect(screen.getByText('Option 1')).toBeInTheDocument();

  // Submit the form
  fireEvent.submit(screen.getByRole('button', {name: 'Submit'}));
  // Wait for the result table to be rendered
  await waitFor(() => screen.getByText('Main Category'));
  it('renders the form with main category and sub-category dropdowns', () => {
    render(<Form />);

    const mainCategoryDropdown = screen.getByLabelText(/Main Category/i);
    expect(mainCategoryDropdown).toBeInTheDocument();

    const subCategoryDropdown = screen.getByLabelText(/Sub Category/i);
    expect(subCategoryDropdown).toBeInTheDocument();
  });

  it('handles changes in main category dropdown', async () => {
    render(<Form />);

    const mainCategoryDropdown = screen.getByLabelText(/Main Category/i);
    fireEvent.change(mainCategoryDropdown, {target: {value: '1'}});

    const selectedCategory = screen.getByDisplayValue(/Category 1/i);
    expect(selectedCategory).toBeInTheDocument();
  });
});
