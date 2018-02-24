import React, { PureComponent } from 'react';
import { Table } from 'antd';

export default class TableForm extends PureComponent {
  render() {
    const columns = [{
      title: '产品名称',
      dataIndex: 'EN',
    }, {
      title: 'SKU',
      dataIndex: 'Sku',
    }, {
      title: '数量',
      dataIndex: 'Count',
    }, {
      title: '运单号',
      dataIndex: 'InvoiceNo',
    }];

    return (
      <div>
        <Table
          columns={columns}
          dataSource={this.props.value}
          pagination={false}
          rowKey={record => record.Key}
          size="small"
        />
      </div>
    );
  }
}
