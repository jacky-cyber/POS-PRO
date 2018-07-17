import React, { PureComponent } from 'react';
import { Table, Button, Popconfirm, Divider, Input, InputNumber, Popover, Icon } from 'antd';
import styles from './index.less';
import SearchableSelect from '../ShippingHandler/SearchableSelect';
import { calculateExpressOrShippingCost } from '../../../../utils/utils';

export default class TableForm extends PureComponent {
  remove(key) {
    const data = this.props.value;
    const newData = data.filter(item => (item.ID !== key));
    this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: newData });
  }

  nameChangeHandler = (e, fieldName, key) => {
    const { value: data } = this.props;
    const value = e && (e.target ? e.target.value : e);
    const Name = { Name: value.Name, ID: value.ID };
    const UnitPrice = value.Price;
    const newData = data.map((item) => {
      if (item.ID === key) {
        return {
          ...item,
          Name,
          UnitPrice,
        };
      }
      return item;
    });
    const expressData = newData.map(item => ({
      ...item,
      RealPrice: calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight, item.FreeWeight),
    }));
    this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: expressData });
  }
  handleFieldChange = (e, fieldName, key) => {
    const { value: data } = this.props;
    const value = e && (e.target ? e.target.value : e);
    const newData = data.map((item) => {
      if (item.ID === key) {
        return { ...item, [fieldName]: value };
      }
      return item;
    });
    const expressData = newData.map(item => ({
      ...item,
      RealPrice: calculateExpressOrShippingCost(item.UnitPrice, item.Weight, item.WeightedWeight, item.FreeWeight),
    }));
    this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: expressData });
  }
  render() {
    const { value, dispatch, express } = this.props;
    const { expressList = [], loading } = express;
    const getCompany = () => dispatch({ type: 'express/getCompany' });
    const content = (
      <p style={{ width: 400 }}>
        包裹与商品的总重量不足 1kg 时，快递金额为该快递公司的单价，超过 1kg 时快递金额 = 总重量 * 快递单价
      </p>
    );
    const columns = [{
      title: '包裹序号',
      dataIndex: 'BoxIndex',
      align: 'center',
      render: (text, record, index) => <span>{index + 1}</span>,
    }, {
      title: '快递公司',
      dataIndex: 'Name',
      align: 'center',
      render: (text, record) => (
        <SearchableSelect
          fetchData={getCompany}
          onChange={e => this.nameChangeHandler(e, 'Name', record.ID)}
          data={expressList}
          label="Name"
          value={text.ID}
          dispatch={dispatch}
          disabled={loading}
        />
      ),
    }, {
      title: '重量',
      dataIndex: 'Weight',
      align: 'center',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'Weight', record.ID)} />,
    }, {
      title: '加权重量',
      dataIndex: 'WeightedWeight',
      align: 'center',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'WeightedWeight', record.ID)} />,
    }, {
      title: '免邮重量',
      dataIndex: 'FreeWeight',
      align: 'center',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'FreeWeight', record.ID)} />,
    }, {
      title: '运单号',
      dataIndex: 'InvoiceNo',
      align: 'center',
      render: (text, record) => <Input style={{ width: 200 }} value={text} onChange={e => this.handleFieldChange(e, 'InvoiceNo', record.ID)} />,
    }, {
      title: '快递单价',
      dataIndex: 'UnitPrice',
      align: 'center',
      render: (text, record) => <InputNumber value={text} min={0} precision={2} onChange={e => this.handleFieldChange(e, 'UnitPrice', record.ID)} />,
    }, {
      title: (
        <span>
          包裹快递金额
          <Divider type="vertical" />
          <Popover
            title="包裹快递金额规则"
            content={content}
            trigger="hover"
            placement="top"
          >
            <Icon type="question-circle-o" />
          </Popover>
        </span>
      ),
      dataIndex: 'RealPrice',
      align: 'center',
      render: (text, record) => (
        <span>
          {text}
        </span>
      ),
    }, {
      title: '操作',
      dataIndex: 'action',
      align: 'center',
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
