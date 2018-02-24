import React, { PureComponent } from 'react';
import { Table, Button, message, Popconfirm, Divider, Input, InputNumber } from 'antd';
import styles from './index.less';

export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.value || [],
      columns: props.columns || [],
      isInit: false,
    };
  }
  generateNewItem = (init) => {
    const dataIndexArray = this.state.columns.filter(item => (item.dataIndex !== 'action' || item.dataIndex !== 'action-deleteOnly')).filter(item => !item.isRejectInit).map(item => item.dataIndex);
    const member = {
      ID: `NEW_TEMP_ID_${this.index}`,
      editable: true,
      isNew: true,
    };
    let newMember = member;
    dataIndexArray.forEach((item) => {
      newMember = { ...newMember, [item]: init };
    });
    return newMember || {};
  }
  index = 0;
  cacheOriginData = {};
  clickedCancel = false
  handleSubmit = (target) => {
    if (!target.ID) { return; }
    if (target.ID.indexOf('NEW_TEMP') === -1) {
      this.props.onUpdate(target, target.ID);
      return;
    }
    this.props.onSubmit(target);
    // e.preventDefault();
    // this.props.form.validateFieldsAndScroll((err, values) => {
    //     if (!err) {
    //         console.log(values)
    //     }
    // });
  }
  removeLocal(key) {
    const target = this.getRowByKey(key);
    if (!target.ID) { return; }
    const newData = this.state.data.filter(item => item.ID !== key);
    this.setState({ data: newData });
  }
  remove(key) {
    const data = this.props.dataSource;
    const newData = data.filter(item => (item.ID !== key));
    this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: newData })
    //   const target = this.getRowByKey(key);
    //   if (!target.ID) { return; }
    //   if (!target.isNew) {
    //     this.props.onDelete(target.ID);
    //     return;
    //   }
    //   const newData = this.state.data.filter(item => item.ID !== key);
    //   this.setState({ data: newData });
  }
  newMember = () => {
    const data = [...this.state.data];
    const newMember = this.generateNewItem();
    const newData = [
      newMember,
      ...data,
    ];
    this.index += 1;
    this.setState({ data: newData });
  }

  handleFieldChange(e, fieldName, key) {
    const data = this.props.dataSource;
    const value = e && (e.target ? e.target.value : e);
    const newData = data.map(item => {
      if (item.ID === key) {
        return { ...item, [fieldName]: value };
      }
      return item;
    });
    this.props.dispatch({ type: 'commodity/changeExpressDataAndSumCost', payload: newData })
    // const newData = [...this.state.data];
    // const target = this.getRowByKey(key);
    // if (target) {
    //   target[fieldName] = e && (e.target ? e.target.value : e);
    //   this.setState({ data: newData });
    // }
  }
  render() {
    const { dataSource, dispatch } = this.props;
    const columns = [{
      title: '包裹序号',
      dataIndex: 'BoxIndex',
      width: '10%',
      render: (text, record, index) => <span>{index + 1}</span>,
    }, {
      title: '快递公司',
      dataIndex: 'Name',
      width: '30%',
      render: (text, record) => <Input value={text} onChange={e => this.handleFieldChange(e, 'Name', record.ID)} />,
    }, {
      title: '重量',
      dataIndex: 'Weight',
      width: '15%',
      render: (text, record) => <InputNumber value={text} onChange={e => this.handleFieldChange(e, 'Weight', record.ID)} />,
    }, {
      title: '加权重量',
      dataIndex: 'WeightedWeight',
      width: '15%',
      render: (text, record) => <InputNumber value={text} onChange={e => this.handleFieldChange(e, 'WeightedWeight', record.ID)} />,
    }, {
      title: '金额',
      dataIndex: 'Cost',
      width: '15%',
      render: (text, record) => <InputNumber value={text} onChange={e => this.handleFieldChange(e, 'Cost', record.ID)} />,
    }, {
      title: '操作',
      dataIndex: 'action',
      width: '15%',
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
          dataSource={dataSource}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
          rowKey={record => record.ID}
        />
      </div>
    );
  }
}
