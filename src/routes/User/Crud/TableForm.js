import React, { PureComponent } from 'react';
import { Table, Button, message, Popconfirm, Divider, Select, Input } from 'antd';
import PropTypes from 'prop-types';
import { SwitchableFormItem, SearchableSelect } from 'components/BaseComponents';
import DepartmentManagement from './DepartmentManagement';
import styles from './style.less';
import { getMenuData } from '../../../common/menu';

const { Option } = Select;


export default class TableForm extends PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    loading: PropTypes.bool,
  }
  static defaultProps = {
    loading: false,
  }
  constructor(props) {
    super(props);
    this.state = {
      data: props.value || [],
    };
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      // 编辑状态下不更新数据
      const { data: currentData } = this.state;
      const isReject = currentData.reduce((prev, current) => {
        return prev || current.isEditing;
      }, false);
      const data = nextProps.value || [];
      if (!isReject) {
        this.setState({
          data,
        });
      }
    }
  }
  getRowByKey(key) {
    return this.state.data.filter(item => item.ID === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  clickedCancel = false
  generateNewItem = () => {
    const member = {
      ID: `NEW_TEMP_ID_${this.index}`,
      isEditing: true,
      isNew: true,
      Username: '',
      Password: '',
      DepartmentID: '',
      ShopName: '',
      Authority: [],
    };
    return member;
  }
  toggleEditable(key) {
    const target = this.getRowByKey(key);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.isEditing) {
        this.cacheOriginData[key] = { ...target };
      }
      target.isEditing = !target.isEditing;
      this.setState({ data: [...this.state.data] });
    }
  }
  toggleEditableAfterBlur(e, key) {
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.isEditing) {
        this.cacheOriginData[key] = { ...target };
      }
      target.isEditing = !target.isEditing;
      this.setState({ data: [...this.state.data] });
    }
  }
  removeLocal(key) {
    const target = this.getRowByKey(key);
    if (!target.ID) { return; }
    const newData = this.state.data.filter(item => item.ID !== key);
    this.setState({ data: newData });
  }
  remove(key) {
    const target = this.getRowByKey(key);
    if (!target.ID) { return; }
    if (!target.isNew) {
      this.props.onDelete(target.ID);
      return;
    }
    const newData = this.state.data.filter(item => item.ID !== key);
    this.setState({ data: newData });
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
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(key);
      // this.saveRowAfterBlur(e, key);
    }
  }
  fieldChangeHandler(e, fieldName, key) {
    console.log('e', e, fieldName, key);
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    console.log('target', target);
    if (target) {
      const value = e.target ? e.target.value : e;
      if (fieldName === 'DepartmentID') {
        target.DepartmentID = value.ID;
        target.ShopName = value.Name;
        this.setState({ data: newData });
        return;
      }
      target[fieldName] = value;
      this.setState({ data: newData });
    }
  }
  handleFieldChange(e, fieldName, key) {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      const value = e.target ? e.target.value : e;
      if (fieldName === 'DepartmentID') {
        target.DepartmentID = value.value;
        target.ShopName = value.label;
        this.setState({ data: newData });
        return;
      }
      target[fieldName] = value;
      this.setState({ data: newData });
    }
  }
  handleImgChange(value, fieldName, key) {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      target[fieldName] = value;
      this.setState({ data: newData });
    }
  }
  saveRow(key) {
    this.clickedCancel = true;
    const target = this.getRowByKey(key);
    let dataIndexArray = [];
    if (target.isNew) {
      dataIndexArray = ['Username', 'Password', 'DepartmentID', 'ShopName', 'Authority'];
    } else {
      dataIndexArray = ['DepartmentID', 'ShopName', 'Authority'];
    }
    const isShowMessage = dataIndexArray.reduce((prev, current) => {
      return (
        (
          Array.isArray(target[current]) ?
            target[current].length === 0
            :
            (
              target[current] === '' || target[current] === undefined || target[current] === null
            )
        )
       || prev);
    }, false);
    if (isShowMessage) {
      message.error('请填写完整信息');
      return;
    }
    delete target.isNew;
    this.toggleEditable(key);
    const { Username, Password, DepartmentID, ShopName, Authority } = target;
    const value = { Username, Password, DepartmentID, ShopName, Authority };
    this.props.onSubmit(value);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.isEditing = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: [...this.state.data] });
  }
  dataHandlerBeforeBulkCopy = (data) => {
    const ID = this.props.ID;
    const newData = data && data.map(item => ({ ...item, ProductDefineID: ID }));
    const newJsonData = JSON.stringify(newData);
    return newJsonData;
  }
  handleBulkCopy = () => {
    const dataObject = this.dataHandlerBeforeBulkCopy(this.state.data);
    this.props.onBulkCopy && this.props.onBulkCopy(dataObject, this.props.ID);
  }
  toEditHandler = () => {
    this.props.onToEdit();
    // const newData = this.state.data.map(item => ({ ...item, isEdit: this.props.editable }))
    // this.setState({data: newData})
  }
  quitEditHandler = () => {
    this.props.onQuitEdit();
    // const newData = this.state.data.map(item => ({ ...item, isEdit: this.props.editable }))
    // this.setState({data: newData})
  }
  render() {
    const getDepartment = () => this.props.dispatch({ type: 'user/getDepartment' });
    const columns = [{
      title: '账号',
      dataIndex: 'Username',
      render: (text, record) => {
        const { isNew, isEditing } = record;
        return (
          <SwitchableFormItem
            value={text}
            isEditing={isEditing}
            formItemElement={Input}
            formItemElementProps={isNew ? {} : { disabled: true }}
            onChange={e => this.fieldChangeHandler(e, 'Username', record.ID)}
          />
        );
      },
    }, {
      title: '密码',
      dataIndex: 'Password',
      render: (text, record) => {
        const { isNew, isEditing } = record;
        const value = isNew ? text : '密码不可见';
        return (
          <SwitchableFormItem
            value={value}
            isEditing={isEditing}
            formItemElement={Input}
            formItemElementProps={isNew ? {} : { disabled: true }}
            onChange={e => this.fieldChangeHandler(e, 'Password', record.ID)}
          />
        );
      },
    }, {
      title: '部门',
      dataIndex: 'DepartmentID',
      width: 250,
      render: (text, record) => {
        const { isEditing, DepartmentName } = record;
        return (
          <SwitchableFormItem
            value={isEditing ? text : DepartmentName}
            isEditing={isEditing}
            formItemElement={SearchableSelect}
            formItemElementProps={{
              fetchData: getDepartment,
              // 暂时只支持 value 键为必须的
              data: this.props.departmentList,
              label: 'Name',
              value: text,
              disabled: false,
              CreateForm: DepartmentManagement,
            }}
            onChange={e => this.fieldChangeHandler(e, 'DepartmentID', record.ID)}
          />

          // <SearchableSelect
          //   onChange={e => this.fieldChangeHandler(e, 'DepartmentID', record.ID)}
          //   fetchData={getDepartment}
          //   data={this.props.departmentList}
          //   label="Name"
          //   value={text}
          //   disabled={false}
          //   style={{ minWidth: 200 }}
          //   CreateForm={DepartmentManagement}
          // />
        );
      },
    }, {
      title: '店名',
      dataIndex: 'ShopName',
      render: (text, record) => {
        return (
          <SwitchableFormItem
            value={text}
            isEditing={record.isEditing}
            formItemElement={Input}
            onChange={e => this.fieldChangeHandler(e, 'ShopName', record.ID)}
          />
        );
      },
    }, {
      title: '权限',
      dataIndex: 'Authority',
      render: (text, record) => {
        const { isEditing } = record;
        return (
          <Select
            value={text}
            onChange={e => this.handleFieldChange(e, 'Authority', record.ID)}
            mode="multiple"
            style={{ minWidth: 300 }}
            disabled={!isEditing}
          >
            {
              getMenuData().map(item => (
                <Option value={item.ID} key={item.ID}>{item.name}</Option>
              ))
            }
          </Select>
        );
      },
    }, {
      title: '操作',
      dataIndex: 'action',
      render: (text, record) => {
        if (record.isEditing) {
          if (record.isNew) {
            return (
              <span style={{ minWidth: 100, display: 'inline-block' }}>
                <a onClick={() => this.saveRow(record.ID)}>保存</a>
                {/* <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
                  <a>删除</a>
                </Popconfirm> */}
              </span>
            );
          }
          return (
            <span style={{ minWidth: 100, display: 'inline-block' }}>
              <a onClick={() => this.saveRow(record.ID)}>保存</a>
              <Divider type="vertical" />
              <a onClick={e => this.cancel(e, record.ID)}>取消</a>
            </span>
          );
        } else {
          return (
            <span style={{ minWidth: 100, display: 'inline-block' }}>
              <a onClick={e => this.toggleEditableAfterBlur(e, record.ID)}>编辑</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        }
      },
    }];
    const { loading } = this.props;
    return (
      <div>
        <Button
          style={{ width: '100%', marginTop: 16, marginBottom: 8 }}
          type="dashed"
          onClick={this.newMember}
          icon="plus"
          disabled={loading}
        >
          新增成员
        </Button>
        <Table
          columns={columns}
          dataSource={this.state.data}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
          rowKey={record => record.ID}
          loading={loading}
        />
      </div>
    );
  }
}
