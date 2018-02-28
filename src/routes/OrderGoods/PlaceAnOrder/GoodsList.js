import React, { PureComponent } from 'react';
import { Table, InputNumber } from 'antd';
import SearchSelect from './SearchSelect';

export default class GoodsList extends PureComponent {
  render() {
    const { goodsList, loading, countChangeHandler } = this.props;

    const columns = [
      {
        title: 'SKU',
        dataIndex: 'Sku',
      },
      {
        title: '英文名',
        dataIndex: 'EN',
      },
      {
        title: '中文名',
        dataIndex: 'CN',
      },
      {
        title: '规格',
        dataIndex: 'Specification',
      },
      {
        title: '订货数量',
        dataIndex: 'Count',
        render: (text, record, index) => (
          <InputNumber defaultValue={0} min={0} max={record.Stock || 0} onChange={value => countChangeHandler(value, record)} />
        ),
      },
      {
        title: '库存量',
        dataIndex: 'Stock',
      },
    ];


    return (
      <div>
        <SearchSelect />
        <Table
          rowKey={record => record.Sku}
          columns={columns}
          dataSource={goodsList}
        />
      </div>
    );
  }
}
