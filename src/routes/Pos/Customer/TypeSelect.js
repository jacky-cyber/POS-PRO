import React, { PureComponent } from 'react'
import { Select } from 'antd'

const { Option } = Select

export default class TypeSelect extends PureComponent {
  render() {
  const { onChange, value } = this.props
   return (
    <Select onChange={onChange} value={value}>
      <Option value={1}>普通</Option>
      <Option value={2}>白金</Option>
      <Option value={3}>钻石</Option>
      <Option value={4}>SVIP</Option>
    </Select>
  )
}
}
