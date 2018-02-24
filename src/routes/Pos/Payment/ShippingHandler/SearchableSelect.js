import React, { PureComponent } from 'react';
import { Select, Modal } from 'antd';
import PropTypes from 'prop-types';

const { Option } = Select

const generateOptions = (data = [], isSucceeded, label, init = {}) => {
  if (isSucceeded) {
    const newExtra = init && { ...init, [label]: `创造并编辑 ${init[label]}` }
    const array = (init && init[label]) ? [...data, newExtra] : data
    const options = array.map(item => {
      return <Option value={item.ID} key={item.ID}> {item[label]} </Option>
    })
    return options
  } else {
    return null
  }
}

export default class Searchable extends PureComponent {
  static propTypes = {
    fetchData: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
    data: PropTypes.array,
    label: PropTypes.string,
    CreateForm: PropTypes.func,
  }
  constructor() {
    super()
    this.state = {
      searchString: '',
      isShowModal: false,
      cacheSearchString: '',
    }
  }
  componentDidMount() {
    if (this.props.payload) {
    this.props.fetchData && this.props.fetchData(this.props.payload)
      this.props.cascadeFunc && this.props.cascadeFunc(this.props.payload)
    return
    }
    this.props.fetchData && this.props.fetchData()
  }
  toggleModal = () => {
    this.setState({ isShowModal: !this.state.isShowModal })
  }
  searchHandler = (string) => {
    this.setState({
      searchString: string,
    })
  }
  selectHandler = (value) => {
    if (value.includes('create-')) {
      this.toggleModal()
      this.setState({ cacheSearchString: value })
    } else {
      const currentData = this.props.data.filter(item => item.ID === value)[0]
      this.props.onChange(currentData)
    }
  }
  render() {
    const { value, data, label, CreateForm, onChange, disabled, fetchData, ...otherProps } = this.props
    const { isShowModal, searchString, cacheSearchString } = this.state
    const init = CreateForm && { ID: `create-${searchString}`, [label]: searchString }
    const isSucceeded = !disabled
    const modalWidth = 1600
    return (
      <div>
        <Modal
          visible={isShowModal}
          onCancel={() => this.toggleModal()}
          width={modalWidth}
          footer={null}
          closable={null}
          destroyOnClose={true}
        >
        {
          CreateForm &&
          <CreateForm
              payload={this.props.payload}
              init={cacheSearchString.replace('create-', '')}
          />
        }
        </Modal>
        <Select
          disabled={this.state.isShowModal || disabled}
          style={{ width: '100%' }}
          value={value}
          showSearch={true}
          onSearch={this.searchHandler}
          optionFilterProp="children"
          filterOption={(input, option) => {
            return option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0
          }}
          notFoundContent="无匹配结果"
          allowClear={true}
          onSelect={this.selectHandler}
          { ...otherProps }
        >
          {generateOptions(data, isSucceeded, label, init)}
        </Select>
      </div>
    )
  }
}
