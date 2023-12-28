'use client';

import React, {FC, useState} from 'react';
import HttpClient from '../utils/HttpClient';
import CustomSelect from './CustomSelect';
import {SubCategoryOption} from './Form';

const SubCategoryOptionComp: FC<{
  option: SubCategoryOption;
  stopRecursion?: boolean;
  setLoading?: (bol: boolean) => void;
  setFinalOptions?: any;
}> = ({option, stopRecursion, setLoading, setFinalOptions}) => {
  const [selectedOption, setSelectedOption] = useState<
    SubCategoryOption | undefined
  >();
  const [subOptionCategories, setSubOptionCategories] = useState<any[]>([]);

  const [optionInput, setOptionInput] = useState<string>('');
  const handleSubOptionChange = async (
    selectedOption: SubCategoryOption | undefined,
  ) => {
    setSelectedOption(selectedOption);
    setFinalOptions((prev: any) => [
      ...prev,
      {
        name: [`${option.name}`],
        value: selectedOption?.name,
      },
    ]);
    if (selectedOption?.id === `other-${option.name}-${option.id}`) {
      setOptionInput('');
      setSubOptionCategories([]);
    } else {
      if (stopRecursion) return;
      try {
        setLoading && setLoading(true);
        const result = await HttpClient.get(
          `/get-options-child/${selectedOption?.id}}`,
        );

        setSubOptionCategories(
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
        setLoading && setLoading(false);
      }
    }
  };

  return (
    <div className="sub-option-container">
      <label htmlFor={`dropdown-${option.id}`} className="sub-option-label">
        {option.name}:
      </label>
      <CustomSelect
        id={`dropdown-${option.id}`}
        options={option?.options?.map(subOption => ({
          value: subOption?.id,
          label: subOption?.name,
          ...subOption,
        }))}
        value={selectedOption}
        onChange={handleSubOptionChange}
        placeholder={`Select ${option.name}`}
      />
      {selectedOption?.id === `other-${option.name}-${option.id}` && (
        <input
          className="other-input"
          type="text"
          value={optionInput}
          onChange={e => setOptionInput(e.target.value)}
          placeholder={`Enter other ${option.name}`}
        />
      )}
      {selectedOption &&
        subOptionCategories?.length > 0 &&
        subOptionCategories.map(optionNested => (
          <SubCategoryOptionComp
            option={optionNested}
            key={optionNested.id}
            setFinalOptions={setFinalOptions}
            stopRecursion
          />
        ))}
    </div>
  );
};
export default SubCategoryOptionComp;
