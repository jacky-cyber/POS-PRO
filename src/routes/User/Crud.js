import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input,  Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Table } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TableForm from './TableForm'


const FormItem = Form.Item;

@connect(state => ({
  userList: state.user.userList,
  loading: state.loading.effects['user/getAll'],
}))
@Form.create()
export default class UserCrud extends PureComponent {
  componentDidMount() {
    this.props.dispatch({type: 'user/getAll'})
  }
  render() {
    const { userList, loading, form, dispatch } = this.props
    const newUserList = userList.map(item => {
      if (typeof item.Authority === 'string') {
        return { ...item, Authority: item.Authority.split(',')}
      } else { return item }
    })
    const { getFieldDecorator } = form
    const onAddCompany = (value) => dispatch({type: 'user/addOrUpdate', payload: value})
    const onDeleteCompany = (ID) => {}
    const onUpdateCompany = (value) => dispatch({type: 'user/addOrUpdate', payload: value})

    const columns = [{
      title: '账号',
      dataIndex: 'Username',
      renderWhenEditable: Input,
      propsWhenEditable: {
        disabled: true,
      },
      renderWhenUnEditable: null,
    },{
      title: '密码',
      dataIndex: 'Password',
      renderWhenEditable: Input,
      propsWhenEditable: {
        disabled: true,
        type: 'password',
      },
      propsWhenEditableAndNew: {
        type: 'password',
      },
      renderWhenUnEditable: null,
    },{
      title: '部门',
      dataIndex: 'DepartmentID',
      renderWhenEditable: Input,
      renderWhenUnEditable: null,
    },{
      title: '店名',
      dataIndex: 'ShopName',
      renderWhenEditable: Input,
      renderWhenUnEditable: null,
    },{
      title: '权限',
      dataIndex: 'Authority',
      renderWhenEditable: null,
      renderWhenUnEditable: null,
    },{
      title: '操作',
      dataIndex: 'action',
    }];


    return (
      <PageHeaderLayout title="账号管理">
        <Card bordered={false}>
        {getFieldDecorator('members', {
          initialValue: newUserList,
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
