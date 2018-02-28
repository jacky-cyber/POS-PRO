import React, { PureComponent } from 'react'
import { Select } from 'antd'
import { CUSTOMER_TYPE } from '../../../constant'

const { Option } = Select

const getOptions = (CUSTOMER_TYPE) => {
  const optionArray = Array.isArray(CUSTOMER_TYPE) ? CUSTOMER_TYPE : []
  return optionArray.map(item => (
    <Option value={item.value} key={item.value}>{item.label}</Option>
  ))
}

export default class TypeSelect extends PureComponent {
  render() {
  const { onChange, value } = this.props
   return (
    <Select onChange={onChange} value={value}>
    {getOptions(CUSTOMER_TYPE)}
    </Select>
  )
}
}
