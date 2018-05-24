import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TableForm from './DepartmentTableForm';


@connect(state => ({
  departmentList: state.user.departmentList,
  loading: state.loading.effects['user/getDepartment'],
}))
@Form.create()
export default class DepartmentManagement extends PureComponent {
  componentDidMount() {
    this.props.dispatch({ type: 'user/getDepartment' });
  }
  render() {
    const { departmentList, loading, form, dispatch, init } = this.props;
    const { getFieldDecorator } = form;
    const onAddDepartment = value => dispatch({ type: 'user/addDepartment', payload: value });
    const onDeleteDepartment = (ID) => {};

    return (
      <PageHeaderLayout title="部门管理">
        <Card bordered={false}>
          {getFieldDecorator('members', {
            initialValue: departmentList,
          })(
            <TableForm
              init={init}
              onSubmit={onAddDepartment}
              onDelete={onDeleteDepartment}
              loading={loading}
            />
          )}

        </Card>
      </PageHeaderLayout>
    );
  }
}
