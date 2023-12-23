import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Form from './Form';

jest.mock('../utils/HttpClient', () => ({
  get: jest.fn(() => Promise.resolve({data: {data: {}}})),
}));

describe('Form Component', () => {
  it('renders the form with main category and sub-category dropdowns', () => {
    render(<Form />);

    const mainCategoryDropdown = screen.getByLabelText(/Main Category/i);
    expect(mainCategoryDropdown).toBeInTheDocument();

    const subCategoryDropdown = screen.getByLabelText(/Sub Category/i);
    expect(subCategoryDropdown).toBeInTheDocument();
  });

  it('handles changes in main category dropdown', async () => {
    render(<Form />);

    const mockApiResponse = {
      data: {
        data: {
          categories: [{id: '1', name: 'Category 1'}],
        },
      },
    };

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(mockApiResponse),
    });

    const mainCategoryDropdown = screen.getByLabelText(/Main Category/i);
    fireEvent.change(mainCategoryDropdown, {target: {value: '1'}});

    const selectedCategory = screen.getByDisplayValue(/Category 1/i);
    expect(selectedCategory).toBeInTheDocument();
  });
});
