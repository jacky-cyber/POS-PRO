import React, { PureComponent } from 'react';
import { Form, Card } from 'antd';
import { connect } from 'dva';
import TableForm from './TableForm';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

@connect(({ putaway, loading }) => ({
  goodsForPutaway: putaway.goodsForPutaway,
  pagination: putaway.pagination,
  loading: loading.effects['putaway/getGoodsForPutaway'],
}))
@Form.create()
export default class Putaway extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'putaway/changeSearchCondition',
      payload: '',
    });
    this.props.dispatch({
      type: 'putaway/getGoodsForPutaway',
      payload: {
        pagination: this.props.pagination,
      },
    });
  }
  render() {
    const {
      goodsForPutaway,
      dispatch,
      pagination,
      loading,
    } = this.props;
    const addOrUpdate = (payload) => {
      dispatch({
        type: 'putaway/addOrUpdateGoodsForPutaway',
        payload,
      });
    };
    const { getFieldDecorator } = this.props.form;

    return (

      <PageHeaderLayout title="商品上架管理">
        <Card bordered={false}>
          {
            getFieldDecorator('tableForm', {
              initialValue: goodsForPutaway || [],
            })(
              <TableForm
                onAddOrUpdate={addOrUpdate}
                dispatch={dispatch}
                pagination={pagination}
                loading={loading}
              />
            )
          }
        </Card>
      </PageHeaderLayout>
    );
  }
}
