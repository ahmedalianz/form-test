'use client';
import {useEffect, useState} from 'react';
import HttpClient from '../utils/HttpClient';
import CustomSelect from './CustomSelect';
export interface Category {
  id: string;
  name: string;
  children?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}
export interface SubCategoryOption {
  id: string;
  name: string;
  options: Array<{id: string; name: string}>;
  value: string;
  other_value: string;
}

export default function Form() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subcategoryOptions, setSubCategoryOptions] = useState<
    SubCategoryOption[]
  >([]);

  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    SubCategory | undefined
  >();
  const [otherCategoryInput, setOtherCategoryInput] = useState<string>('');
  const [otherSubCategoryInput, setOtherSubCategoryInput] =
    useState<string>('');
  const getCategories = async () => {
    try {
      const result = await HttpClient.get('/get_all_cats');
      setCategories([
        ...result?.data?.data?.categories,
        {id: 'other-category', name: 'Other'},
      ]);
    } catch (error) {
      console.log(error);
    }
  };
  const getSubCategoryChildren = async (
    selectedOption: SubCategory | undefined,
  ) => {
    try {
      const result = await HttpClient.get(
        `/properties?cat=${selectedOption?.id}}`,
      );
      setSubCategoryOptions(
        result?.data?.data?.map((option: SubCategoryOption) => {
          let optionsWithOther = [
            ...option.options,
            {id: `other-${option.id}`, name: 'Other'},
          ];
          return {...option, options: optionsWithOther};
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangeCategory = (selectedOption: Category | undefined) => {
    setSelectedCategory(selectedOption);
    if (selectedOption?.id === 'other-category') {
      setOtherCategoryInput('');
    } else {
      selectedOption?.children &&
        setSubCategories([
          ...selectedOption.children,
          {id: 'other-sub-category', name: 'Other'},
        ]);
    }
  };

  const handleChangeSubCategory = (selectedOption: SubCategory | undefined) => {
    setSelectedSubCategory(selectedOption);
    getSubCategoryChildren(selectedOption);
    if (selectedOption?.id === 'other-sub-category') {
      setOtherSubCategoryInput('');
    }
  };

  const handleSubOptionChange = async (
    selectedOption: SubCategoryOption | undefined,
    id: string,
  ) => {
    let newArr = [...subcategoryOptions];
    if (newArr.find(element => element.id === id)) {
      try {
        const result = await HttpClient.get(`/get-options-child/${id}}`);
        newArr.find(element => element.id === id).value = selectedOption?.name;
        newArr.find(element => element.id === id).list =
          result?.data?.data || [];
      } catch (error) {
        console.log(error);
      }
    }
    setSubCategoryOptions(newArr);
  };
  const handleSubOptionNestedChange = (
    selectedOption: SubCategoryOption | undefined,
    id: string,
  ) => {
    let newArr = [...subcategoryOptions];
    if (newArr.find(element => element.id === id)) {
      if (
        newArr
          .find(element => element.id === id)
          .list.find(element => element.id === id)
      ) {
        newArr
          .find(element => element.id === id)
          .list.find(element => element.id === id).value = selectedOption?.name;
      }
    }
    setSubCategoryOptions(newArr);
  };

  useEffect(() => {
    getCategories();
  }, []);
  return categories?.length > 0 ? (
    <form className="form-container">
      <label htmlFor="dropdown1">Main Category:</label>
      <CustomSelect
        id="dropdown1"
        options={categories?.map(cate => ({
          value: cate?.id,
          label: cate?.name,
          ...cate,
        }))}
        onChange={handleChangeCategory}
        placeholder="Select Category"
        value={selectedCategory}
      />

      {selectedCategory?.id === 'other-category' && (
        <input
          type="text"
          value={otherCategoryInput}
          onChange={e => setOtherCategoryInput(e.target.value)}
          placeholder="Enter other category"
        />
      )}
      <label htmlFor="dropdown2">Sub Category:</label>
      <CustomSelect
        id="dropdown2"
        options={subcategories?.map(subcategory => ({
          value: subcategory?.id,
          label: subcategory?.name,
          ...subcategory,
        }))}
        value={selectedSubCategory}
        onChange={handleChangeSubCategory}
        placeholder="Select Sub Category"
      />
      {selectedSubCategory?.id === 'other-sub-category' && (
        <input
          type="text"
          value={otherSubCategoryInput}
          onChange={e => setOtherSubCategoryInput(e.target.value)}
          placeholder="Enter other subcategory"
        />
      )}
      {selectedSubCategory && (
        <>
          {subcategoryOptions?.length ? (
            <>
              {subcategoryOptions.map(option => (
                <div key={option.id} className="sub-option-container">
                  <label
                    htmlFor={`dropdown-${option.id}`}
                    className="sub-option-label">
                    {option.name}:
                  </label>
                  <CustomSelect
                    key={option.id}
                    id={`dropdown-${option.id}`}
                    options={option?.options?.map(subOption => ({
                      value: subOption?.id,
                      label: subOption?.name,
                      ...subOption,
                    }))}
                    value={{value: option.id, label: option?.value}}
                    onChange={selectedOption =>
                      handleSubOptionChange(selectedOption, option.id)
                    }
                    placeholder={`Select ${option.name}`}
                  />

                  {option?.value && (
                    <>
                      {option?.list?.length > 0 && (
                        <>
                          {option?.list.map(optionNested => (
                            <div
                              key={optionNested.id}
                              className="sub-option-container">
                              <label
                                htmlFor={`dropdown-${optionNested.id}`}
                                className="sub-option-label">
                                {optionNested.name}:
                              </label>
                              <CustomSelect
                                key={optionNested.id}
                                id={`dropdown-${optionNested.id}`}
                                options={optionNested?.options?.map(
                                  subOption => ({
                                    value: subOption?.id,
                                    label: subOption?.name,
                                    ...subOption,
                                  }),
                                )}
                                value={{
                                  value: optionNested.id,
                                  label: optionNested?.value,
                                }}
                                onChange={selectedOption =>
                                  handleSubOptionNestedChange(
                                    selectedOption,
                                    optionNested.id,
                                  )
                                }
                                placeholder={`Select ${optionNested.name}`}
                              />
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </>
          ) : (
            <p>loading ....</p>
          )}
        </>
      )}

      <button className="submit-button" type="submit">
        Submit
      </button>
    </form>
  ) : (
    <p>loading ...</p>
  );
}
