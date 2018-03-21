import React, { PureComponent } from 'react';
import { Table, Input, InputNumber, Icon, Popover, Divider } from 'antd';
import { calculateExpressOrShippingCost } from '../../../../utils/utils';
import SearchableSelect from './SearchableSelect';


export default class TableForm extends PureComponent {
  // componentDidMount() {
  //   this.props.dispatch({type: 'express/getCompany'})
  // }
  handleFieldChange = (e, fieldName, key) => {
    const { setFieldsValue } = this.props
    const data = this.props.value
    const value = e && (e.target ? e.target.value : e);
    let newData = []
    if (fieldName === 'Name') {
      const Name = { ID: value.ID, Name: value.Name }
      const UnitPrice = value.Price
      newData = data.map(item => {
        if (item.ID === key) {
          return { ...item, Name, UnitPrice };
        }
        return item;
      });
    } else {
    newData = data.map(item => {
      if (item.ID === key) {
        return { ...item, [fieldName]: value };
      }
      return item;
    });
    }
    const shippingData = newData.map(item => ({
      ...item,
       RealPrice: calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight, ),
    }))
    // const setFieldsValueCallabck = this.props.from.setFieldsValue
    this.props.dispatch({ type: 'commodity/changeShippingDataAndSumCost', payload: shippingData })
    setFieldsValue({ shippingData })
  }
  render() {
    const { express, dispatch } = this.props
    const { expressList=[], loading } = express
    const getCompany = () => dispatch({type: 'express/getCompany'})
    const content = "包裹与商品的总重量不足 1kg 时，快递金额为该快递公司的单价，超过 1kg 时快递金额 = 总重量 * 快递单价"
    const columns = [{
      title: '快递公司',
      dataIndex: 'Name',
      render: (text, record) => (
        <SearchableSelect
        fetchData={getCompany}
        onChange={e => this.handleFieldChange(e, 'Name', record.ID)}
        data={expressList}
        label='Name'
        value={text['ID']}
        dispatch={dispatch}
        disabled={loading}
         />
      //  <Input value={text} onChange={e => this.handleFieldChange(e, 'Name', record.ID)} />
      ),
    }, {
      title: '重量(kg)',
      dataIndex: 'Weight',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'Weight', record.ID)} />,
    }, {
      title: '加权重量(kg)',
      dataIndex: 'WeightedWeight',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'WeightedWeight', record.ID)} />,
    }, {
      title: '快递单价（元）',
      dataIndex: 'UnitPrice',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'UnitPrice', record.ID)} />,
    }, {
      title: '包裹快递金额（元）',
      dataIndex: 'RealPrice',
      render: (text, record) => (
      <span>{text}
      <Popover title="包裹快递金额规则" content={content} trigger="hover" placement="top">
      <Divider type="vertical" />
       <Icon type="question-circle-o" />
      </Popover>
       </span>
      )
    }];

    return (
      <div>
        <Table
          columns={columns}
          dataSource={this.props.value}
          pagination={false}
          rowKey={record => record.ID}
          size="small"
        />
      </div>
    );
  }
}
