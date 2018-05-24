import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TableForm from './TableForm';


@connect(state => ({
  userList: state.user.userList,
  loading: state.loading.effects['user/getAll'],
  departmentList: state.user.departmentList,
}))
@Form.create()
export default class UserCrud extends PureComponent {
  componentDidMount() {
    this.props.dispatch({ type: 'user/getAll' });
  }
  render() {
    const { userList, loading, form, dispatch, departmentList } = this.props;
    const newUserList = userList.map((item) => {
      if (typeof item.Authority === 'string') {
        if (item.Authority === '') return ({ ...item, Authority: [] });
        return ({ ...item, Authority: item.Authority.split(',') });
      } else { return item; }
    });
    const { getFieldDecorator } = form;
    const onAddOrUpdateCompany = value => dispatch({ type: 'user/addOrUpdate', payload: value });
    const onDeleteCompany = (ID) => {};

    return (
      <PageHeaderLayout title="账号管理">
        <Card bordered={false}>
          {getFieldDecorator('members', {
            initialValue: newUserList,
          })(
            <TableForm
              onSubmit={onAddOrUpdateCompany}
              onDelete={onDeleteCompany}
              loading={loading}
              departmentList={departmentList}
              dispatch={dispatch}
            />
          )}

        </Card>
      </PageHeaderLayout>
    );
  }
}
