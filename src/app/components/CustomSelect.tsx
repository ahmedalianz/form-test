import React, {FC} from 'react';
import Select from 'react-select';
interface CustomSelectProps {
  options: Array<any>;
  onChange: (item: any) => void;
  value: any;
  placeholder: string;
  id: string;
}
const CustomSelect: FC<CustomSelectProps> = ({
  options,
  onChange,
  value,
  placeholder,
  ...rest
}) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      className="basic-single"
      isSearchable
      classNamePrefix="select"
      {...rest}
    />
  );
};

export default CustomSelect;
