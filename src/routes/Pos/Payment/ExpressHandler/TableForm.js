import React, { PureComponent } from 'react';
import { Table, Button, message, Popconfirm, Divider, Input, InputNumber, Popover, Icon } from 'antd';
import styles from './index.less';
import SearchableSelect from '../ShippingHandler/SearchableSelect'
import { calculateExpressOrShippingCost } from '../../../../utils/utils';

export default class TableForm extends PureComponent {
  remove(key) {
    const data = this.props.value;
    const newData = data.filter(item => (item.ID !== key));
    this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: newData })
    //   const target = this.getRowByKey(key);
    //   if (!target.ID) { return; }
    //   if (!target.isNew) {
    //     this.props.onDelete(target.ID);
    //     return;
    //   }
    //   const newData = this.state.data.filter(item => item.ID !== key);
    //   this.setState({ data: newData });
  }

  handleFieldChange = (e, fieldName, key) => {
    const { setFieldsValue, express } = this.props
    const { expressList = [] } = express
    const data = this.props.value
    const value = e && (e.target ? e.target.value : e);
    let newData = []
    if (fieldName === 'Name') {
      const Name = { Name: value.Name, ID: value.ID }
      const UnitPrice = value.Price
      newData = data.map(item => {
        if (item.ID === key) {
          return {
            ...item,
            Name,
            UnitPrice,
          }
        }
      })
      const expressData = newData.map(item => ({
        ...item,
        RealPrice: calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight, ),
      }))
      // const expressDataToForm = newData.map(item => ({
      //   ...item,
      //   RealPrice: calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight, ),
      //   Name: value.ID,
      // }))
      this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: expressData })
      setFieldsValue({ expressData: expressData })
    } else {
      newData = data.map(item => {
        if (item.ID === key) {
          return { ...item, [fieldName]: value };
        }
        return item;
      });
      const expressData = newData.map(item => ({
        ...item,
        RealPrice: calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight, ),
      }))
      this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: expressData })
      setFieldsValue({ expressData: expressData })
    }
  }
  render() {
    const { value, dispatch, express } = this.props;
    const { expressList = [], loading } = express
    const getCompany = () => dispatch({ type: 'express/getCompany' })
    const content = "包裹与商品的总重量不足 1kg 时，快递金额为该快递公司的单价，超过 1kg 时快递金额 = 总重量 * 快递单价"
    const columns = [{
      title: '包裹序号',
      dataIndex: 'BoxIndex',
      render: (text, record, index) => <span>{index + 1}</span>,
    }, {
      title: '快递公司',
      dataIndex: 'Name',
      // render: (text, record) => <Input value={text} onChange={e => this.handleFieldChange(e, 'Name', record.ID)} />,
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
      ),
    }, {
      title: '重量',
      dataIndex: 'Weight',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'Weight', record.ID)} />,
    }, {
      title: '加权重量',
      dataIndex: 'WeightedWeight',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'WeightedWeight', record.ID)} />,
    }, {
      title: '运单号',
      dataIndex: 'InvoiceNo',
      render: (text, record) => <InputNumber value={text} min={0} onChange={e => this.handleFieldChange(e, 'InvoiceNo', record.ID)} />,
    }, {
      title: '快递单价',
      dataIndex: 'UnitPrice',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'UnitPrice', record.ID)} />,
    }, {
      title: '包裹快递金额',
      dataIndex: 'RealPrice',
      render: (text, record) => (
        <span>{text}
          <Popover title="包裹快递金额规则" content={content} trigger="hover" placement="top">
            <Divider type="vertical" />
            <Icon type="question-circle-o" />
          </Popover>
        </span>
      )
    }, {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => (
        <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
          <a>删除</a>
        </Popconfirm>
      ),
    }];
    return (
      <div>
        <Button
          style={{ marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={() => dispatch({ type: 'commodity/clickAddBoxButton' })}
          icon="plus"
        >
          增加包裹
        </Button>
        <Table
          bordered
          columns={columns}
          dataSource={value}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
          rowKey={record => record.ID}
          size="small"
        />
      </div>
    );
  }
}
