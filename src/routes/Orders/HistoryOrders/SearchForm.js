import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Row, Col, DatePicker, Button } from 'antd';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;


@connect(({ orders, loading }) => ({
  pagination: orders.pagination,
  searchCondition: orders.searchCondition,
  getOrderLoading: loading.effects['orders/getHistoryOrders'],
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    console.log('changedFields', changedFields);
    const { dispatch } = props;
    const value = changedFields.PayTime.value.map(item => item.format('YYYY-MM-DD'));
    const payload = { PayTime: { value } };
    dispatch({ type: 'orders/changeSearchCondition', payload });
  },
  mapPropsToFields(props) {
    const { searchCondition } = props;
    const { PayTime } = searchCondition;
    const value = PayTime.value.map(item => moment(item));
    const newDate = { ...PayTime, value };
    return {
      PayTime: Form.createFormField(newDate),
    };
  },
})

export default class SearchForm extends PureComponent {
  componentDidMount() {
    this.searchHandler();
  }
  handleFormReset = () => {
    const defaultDate = [moment().subtract(7, 'days'), moment()].map(item => (
      item.format('YYYY-MM-DD').toString()
    ));
    const { form, dispatch } = this.props;
    const payload = {
      PayTime: {
        value: defaultDate,
      },
    };
    dispatch({ type: 'orders/changeSearchCondition', payload });
    this.searchHandler();
  }
  searchHandler = (e, pagination) => {
    if (e) {
      e.preventDefault();
    }
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const value = {
        PayTime: fieldsValue.PayTime.map(item => item.format('YYYY-MM-DD')),
        MemberID: fieldsValue.customer,
      };
      const payload = {
        pagination: pagination || this.props.pagination,
      };
      dispatch({ type: 'orders/getHistoryOrders', payload });
    });
  }
  render() {
    const { form, getOrderLoading } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form
        onSubmit={this.searchHandler}
        layout="inline"
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="起止日期">
              {getFieldDecorator('PayTime', {
                // initialValue: [moment().subtract(7, 'days'), moment()],
              })(
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span>
              <Button
                type="primary"
                htmlType="submit"
                loading={getOrderLoading}
              >
                查询
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={this.handleFormReset}
              >
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
}
