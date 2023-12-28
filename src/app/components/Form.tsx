'use client';
import Image from 'next/image';
import {MouseEvent, useEffect, useRef, useState} from 'react';
import HttpClient from '../utils/HttpClient';
import CustomSelect from './CustomSelect';
import SubCategoryOptionComp from './SubCategoryOptionComp';
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
}

export default function Form() {
  const [finalOptions, setFinalOptions] = useState<any>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subcategoryOptions, setSubCategoryOptions] = useState<
    SubCategoryOption[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
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
      setLoading(true);
      const result = await HttpClient.get('/get_all_cats');
      setCategories([
        ...result?.data?.data?.categories,
        {id: 'other-category', name: 'Other'},
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCategory = (selectedOption: Category | undefined) => {
    setSelectedCategory(selectedOption);
    setFinalOptions([{name: 'Main Category', value: selectedOption?.name}]);
    if (selectedOption?.id === 'other-category') {
      setOtherCategoryInput('');
      setSubCategories([]);
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
    setFinalOptions((prev: any) => [
      ...prev,
      {name: 'Sub Category', value: selectedOption?.name},
    ]);

    if (selectedOption?.id === 'other-sub-category') {
      setOtherSubCategoryInput('');
      setSubCategoryOptions([]);
    } else {
      getSubCategoryChildren(selectedOption);
    }
  };
  const getSubCategoryChildren = async (
    selectedOption: SubCategory | undefined,
  ) => {
    try {
      setLoading(true);
      const result = await HttpClient.get(
        `/properties?cat=${selectedOption?.id}`,
      );
      setSubCategoryOptions(
        result?.data?.data?.map((option: SubCategoryOption) => {
          let optionsWithOther = [
            ...option.options,
            {id: `other-${option.name}-${option.id}`, name: 'Other'},
          ];
          return {...option, options: optionsWithOther};
        }),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    setFinalOptions((prev: any[]) => [
      ...prev.filter(option => option.value !== 'Other'),
      ...Object.values(formRef?.current || {})
        .filter((input: any) => input.className === 'other-input')
        .map((e: any) => ({
          value: e?.value,
          name: e?.placeholder?.replace('Enter other ', ''),
        })),
    ]);
  };
  useEffect(() => {
    getCategories();
  }, []);
  return submitted ? (
    <table>
      <tbody>
        {finalOptions.map(
          (item: {name: string; value: string}, index: number) => (
            <tr key={index}>
              <td>{item?.name || ''}</td>
              <td>{item?.value || ''}</td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  ) : (
    <form className="form-container" onSubmit={onSubmit} ref={formRef}>
      {loading && (
        <div className="loading">
          <Image
            src={'/assets/loading.gif'}
            alt="loading ..."
            width={300}
            height={300}
            priority
            quality={30}
          />
        </div>
      )}
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
          className="other-input"
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
          className="other-input"
          type="text"
          value={otherSubCategoryInput}
          onChange={e => setOtherSubCategoryInput(e.target.value)}
          placeholder="Enter other subcategory"
        />
      )}
      {selectedSubCategory && (
        <>
          {subcategoryOptions?.length &&
            subcategoryOptions.map(option => (
              <SubCategoryOptionComp
                key={option.id}
                {...{option, setLoading, setFinalOptions}}
              />
            ))}
        </>
      )}

      <button className="submit-button" type="submit">
        Submit
      </button>
    </form>
  );
}
