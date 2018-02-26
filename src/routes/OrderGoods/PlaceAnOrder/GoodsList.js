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
        dataIndex: 'EnglishName',
      },
      {
        title: '中文名',
        dataIndex: 'Name',
      },
      {
        title: '规格',
        dataIndex: 'Specification',
      },
      {
        title: '订货数量',
        dataIndex: 'Count',
        render: (text, record, index) => (
          <InputNumber defaultValue={0} min={0} max={record.Storage || 0} onChange={value => countChangeHandler(value, record)} />
        ),
      },
      {
        title: '库存量',
        dataIndex: 'Storage',
      },
    ];


    return (
      <div>
        <SearchSelect />
        <Table
          rowKey={record => record.key}
          columns={columns}
          dataSource={goodsList}
        />
      </div>
    );
  }
}
