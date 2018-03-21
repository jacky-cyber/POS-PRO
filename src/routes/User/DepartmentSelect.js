import React, { PureComponent } from 'react'
import { Select } from 'antd'
import { DEPARTMENT } from '../../constant'

const { Option } = Select

const getOptions = (CUSTOMER_TYPE) => {
  const optionArray = Array.isArray(DEPARTMENT) ? DEPARTMENT : []
  return optionArray.map(item => (
    <Option value={item.value} key={item.value}>{item.label}</Option>
  ))
}

export default class DepartmentSelect extends PureComponent {
  render() {
  const { onChange, value, ...restProps } = this.props
   return (
    <Select onChange={onChange} value={value} {...restProps}>
    {getOptions(DEPARTMENT)}
    </Select>
  )
}
}
