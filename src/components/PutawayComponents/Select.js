import React from 'react';
import { Select } from 'antd';
import { PRODUCT_LEVEL_SELECT } from 'constant';

const { Option } = Select;

export const ProductLevelSelect = ({ onChange, value }) => {
  return (
    <Select
      onChange={onChange}
      value={value}
      style={{ width: '100%' }}
    >
      {
        PRODUCT_LEVEL_SELECT.map(item => (
          <Option value={item.value} key={item.value}>{item.label}</Option>
        ))
      }
    </Select>
  );
};

export const BarcodeSelect = ({ onChange, value }) => {
  return (
    <Select
      mode="tags"
      value={value}
      style={{ width: '100%' }}
      onChange={onChange}
      tokenSeparators={[',']}
    />);
};
