import React, { PureComponent } from 'react';
import { Cascader } from 'antd';
import cascaderAddressOptions from '../../../../utils/cascader-address-options';

export default class CascaderInFormItem extends PureComponent {
    changeHandler = (value, selectedOptions) => {
      this.props.onChange && this.props.onChange({
        Province: selectedOptions[0] && selectedOptions[0].label,
        City: selectedOptions[1] && selectedOptions[1].label,
        District: selectedOptions[2] && selectedOptions[2].label,
      })
    }
  render() {
    return (
      <Cascader
        onChange={this.changeHandler}
        options={cascaderAddressOptions}
        showSearch
        placeholder="请选择"
      />
    )
  }
}
