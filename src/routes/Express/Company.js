import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Table } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TableForm from '../../components/TableForm'

const FormItem = Form.Item;

@connect(state => ({
  express: state.express,
}))
@Form.create()
export default class ExpressComponent extends PureComponent {
  componentDidMount() {
    this.props.dispatch({type: 'express/getCompany'})
  }
  render() {
    const { express, form, dispatch } = this.props
    const { getFieldDecorator } = form
    const { loading, expressList } = express
    const onAddCompany = (value) => dispatch({type: 'express/addCompany', payload: value})
    const onDeleteCompany = (ID) => dispatch({type: 'express/deleteCompany', payload: ID})
    const onUpdateCompany = (value) => dispatch({type: 'express/updateCompany', payload: value})

    const columns = [{
      title: '名字',
      dataIndex: 'Name',
      renderWhenEditable: Input,
      renderWhenUnEditable: null,
    },{
      title: '标识',
      dataIndex: 'Sign',
      renderWhenEditable: Input,
      renderWhenUnEditable: null,
    },{
      title: '默认价格',
      dataIndex: 'Price',
      renderWhenEditable: InputNumber,
      renderWhenUnEditable: null,
    },{
      title: '操作',
      dataIndex: 'action',
    }];


    return (
      <PageHeaderLayout title="快递公司管理">
        <Card bordered={false}>
        {getFieldDecorator('members', {
          initialValue: expressList,
        })(<TableForm
          columns={columns}
          onSubmit={onAddCompany}
          onUpdate={onUpdateCompany}
          onDelete={onDeleteCompany}
          loading={loading}
        />)}

        </Card>
      </PageHeaderLayout>
    );
  }
}
