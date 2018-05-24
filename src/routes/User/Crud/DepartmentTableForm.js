import React, { PureComponent } from 'react';
import { Table, Button, message, Popconfirm, Divider, Select, Input } from 'antd';
import PropTypes from 'prop-types';
import { SwitchableFormItem } from 'components/BaseComponents';
import styles from './style.less';


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
    // 初始化 init
    const initValue = this.generateNewItem(props.init);
    this.index += 1;
    this.state = {
      data: [initValue] || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const data = nextProps.value || [];
      // 保留 isNew 的行
      const filtered = this.state.data.filter(item => item.isNew);
      this.setState({
        data: [...filtered, ...data],
      });
    }
  }

  // 获取行数据
  getRowByKey(key) {
    return this.state.data.filter(item => item.ID === key)[0];
  }

  index = 0;
  cacheOriginData = {};
  clickedCancel = false


  // 切换编辑状态
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

  // 删除本地行数据
  removeLocal(key) {
    const target = this.getRowByKey(key);
    if (!target.ID) { return; }
    const newData = this.state.data.filter(item => item.ID !== key);
    this.setState({ data: newData });
  }

  // 删除行数据
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

  newMember = (init = '') => {
    const data = [...this.state.data];
    const newMember = this.generateNewItem(init);
    const newData = [
      newMember,
      ...data,
    ];
    this.index += 1;
    this.setState({ data: newData });
  }

  // 生成行数据
  generateNewItem = (init = '') => {
    if (init) {
      // 初始化新建列表
      const member = {
        ID: `NEW_TEMP_ID_${this.index}`,
        isEditing: true,
        isNew: true,
        Sid: '',
        Name: init,
        Note: init,
        Pos: `${init}-01`,
      };
      return member;
    }
    const member = {
      ID: `NEW_TEMP_ID_${this.index}`,
      isEditing: true,
      isNew: true,
      Sid: '',
      Name: '',
      Note: '',
      Pos: '',
    };
    return member;
  }

  // 改变数据
  fieldChangeHandler(e, fieldName, key) {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      const value = e.target ? e.target.value : e;
      if (fieldName === 'Name') {
        target.Note = value;
        target.Pos = `${value}-01`;
        this.setState({ data: newData });
      }
      target[fieldName] = value;
      this.setState({ data: newData });
    }
  }

  // 保存行数据
  saveRow(key) {
    this.clickedCancel = true;
    const target = this.getRowByKey(key);
    const dataIndexArray = ['Sid', 'Name', 'Note', 'Pos'];
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
    // this.toggleEditable(key);

    const { Sid, Name, Note, Pos } = target;
    const value = { Sid, Name, Note, Pos };
    this.props.onSubmit(value);
  }

  // 取消编辑
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      // 导入缓存
      Object.assign(target, this.cacheOriginData[key]);
      target.isEditing = false;
      // 卸磨杀驴
      delete this.cacheOriginData[key];
    }
    this.setState({ data: [...this.state.data] });
  }

  render() {
    const columns = [{
      title: 'SID',
      dataIndex: 'Sid',
      render: (text, record) => {
        const { isEditing } = record;
        return (
          <SwitchableFormItem
            value={text}
            isEditing={isEditing}
            formItemElement={Input}
            onChange={e => this.fieldChangeHandler(e, 'Sid', record.ID)}
          />
        );
      },
    }, {
      title: '名称',
      dataIndex: 'Name',
      render: (text, record) => {
        const { isEditing } = record;
        return (
          <SwitchableFormItem
            value={text}
            isEditing={isEditing}
            formItemElement={Input}
            onChange={e => this.fieldChangeHandler(e, 'Name', record.ID)}
          />
        );
      },
    }, {
      title: '标签',
      dataIndex: 'Note',
      render: (text, record) => {
        const { isEditing } = record;
        return (
          <SwitchableFormItem
            value={text}
            isEditing={isEditing}
            formItemElement={Input}
            onChange={e => this.fieldChangeHandler(e, 'Note', record.ID)}
          />
        );
      },
    }, {
      title: '默认收货 POS',
      dataIndex: 'Pos',
      render: (text, record) => {
        const { isEditing } = record;
        return (
          <SwitchableFormItem
            value={text}
            isEditing={isEditing}
            formItemElement={Input}
            onChange={e => this.fieldChangeHandler(e, 'Pos', record.ID)}
          />
        );
      },
    }, {
      title: '操作',
      dataIndex: 'Action',
      render: (text, record) => {
        if (record.isEditing) {
          if (record.isNew) {
            return (
              <span style={{ minWidth: 100, display: 'inline-block' }}>
                <a onClick={() => this.saveRow(record.ID)}>保存</a>
                <Divider type="vertical" />
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          }
          return (
            <span style={{ minWidth: 100, display: 'inline-block' }}>
              <a onClick={() => this.saveRow(record.ID)}>保存</a>
            </span>
          );
        } else {
          return (
            <span style={{ minWidth: 100, display: 'inline-block' }}>
              <a onClick={e => this.toggleEditable(record.ID)}>编辑</a>
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
