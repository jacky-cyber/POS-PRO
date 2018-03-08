
import React, { PureComponent } from 'react';
import { Table, Button, message, Popconfirm, Divider, Select } from 'antd';
import styles from './TableForm.less';
import PropTypes from 'prop-types';
import { getMenuData } from '../../common/menu';

const { Option } = Select




export default class TableForm extends PureComponent {
  static propTypes = {
    onBulkCopy: PropTypes.func,
    onSubmit: PropTypes.func,
    onUpdate: PropTypes.func,
    onDelete: PropTypes.func,
    init: PropTypes.string,
    columns: PropTypes.array,
    loading: PropTypes.bool,
    isEdit: PropTypes.bool,
    editableAccess: PropTypes.bool,
  }
  constructor(props) {
    super(props);
    this.state = {
      data: props.value || [],
      columns: props.columns || [],
      isInit: false,
    }
  }
  componentDidMount() {
    const columns = this.props.columns || []
    const newColumns = columns.map(item => {
      if (item.dataIndex === 'action-deleteOnly') {
        return (
          {
            ...item,
            render: (text, record) => {
              return (
                <span>
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.removeLocal(record.ID)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            },
          }
        )
      } else if (item.dataIndex === 'action') {
        return (
          {
            ...item,
            render: (text, record) => {
              if (record.editable) {
                if (record.isNew) {
                  return (
                    <span>
                      <a onClick={() => this.saveRow(record.ID)}>保存</a>
                      <Divider type="vertical" />
                      <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
                        <a>删除</a>
                      </Popconfirm>
                    </span>
                  );
                }
                return (
                  <span>
                    <a onClick={() => this.saveRow(record.ID)}>保存</a>
                    <Divider type="vertical" />
                    <a onClick={e => this.cancel(e, record.ID)}>取消</a>
                  </span>
                );
              }
              return (
                <span>
                  <a onClick={e => this.toggleEditableAfterBlur(e, record.ID)}>编辑</a>
                  <Divider type="vertical" />
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
                    <a>删除</a>
                  </Popconfirm>
                </span>
              );
            },
          }
        )
      } else {
        return (
          {
            ...item,
            render: (text, record) => (
              this.generateRenderComponent(item, text, record)
            ),
          }
        )
      }
    })
    this.setState({ columns: newColumns })
    // if ('value' in this.props && this.props.init) {
    //   const data = this.props.value || []
    //   const newData = this.props.init ?
    //     [
    //       this.generateNewItem(this.props.init),
    //       ...data
    //     ]
    //     :
    //     data
    //   this.setState({
    //     data: newData,
    //   });
    // }
  }
  generateNewItem = (init) => {
    const dataIndexArray = this.state.columns.filter(item => (item.dataIndex !== 'action' || item.dataIndex !== 'action-deleteOnly')).filter(item => !item.isRejectInit).map(item => item.dataIndex)
    const member = {
      ID: `NEW_TEMP_ID_${this.index}`,
      editable: true,
      isNew: true,
    }
    let newMember = member
    dataIndexArray.forEach(item => {
      newMember = { ...newMember, [item]: init, }
    })
    return newMember || {}
  }
  generateRenderComponent = (columnItem, text, record) => {
    if (record.editable) {
      const Editable = columnItem.renderWhenEditable
      if (record.isNew) {
        const props = columnItem.propsWhenEditableAndNew || {}
        if (columnItem.dataIndex === 'Authority') {
          return (
            <Select
              value={text}
              onChange={e => this.handleFieldChange(e, columnItem['dataIndex'], record.ID)}
              placeholder={columnItem['title']}
              mode="multiple"
              style={{width: 300}}
            >
            {
            getMenuData().map(item => (
              <Option value={item.ID} key={item.ID}>{item.name}</Option>
            ))
            }
              {/* <Option value="pos">POS</Option>
              <Option value="express">快递管理</Option>
              <Option value="express">快递管理</Option> */}
            </Select>
          )
        }
        return (
        <Editable
          value={text}
          onChange={e => this.handleFieldChange(e, columnItem['dataIndex'], record.ID)}
          onKeyPress={e => this.handleKeyPress(e, record.ID)}
          placeholder={columnItem['title']}
          { ...props }
        />
        )
      }
      const props = columnItem.propsWhenEditable || {}
        if (columnItem.dataIndex === 'Authority') {
          return (
            <Select
              value={text}
              onChange={e => this.handleFieldChange(e, columnItem['dataIndex'], record.ID)}
              placeholder={columnItem['title']}
              mode="multiple"
              style={{width: 300}}
            >
            {
            getMenuData().map(item => (
              <Option value={item.ID} key={item.ID}>{item.name}</Option>
            ))
            }
            </Select>
          )
        }
      return (
        <Editable
          value={text}
          onChange={e => this.handleFieldChange(e, columnItem['dataIndex'], record.ID)}
          onKeyPress={e => this.handleKeyPress(e, record.ID)}
          placeholder={columnItem['title']}
          { ...props }
        />
      )
    } else {
      if (!columnItem.renderWhenUnEditable) { return text } else {
        const UnEditable = columnItem.renderWhenUnEditable
        const props = columnItem.propsWhenUnEditable || {}
        return (
          <UnEditable
            value={text}
            onChange={e => this.handleFieldChange(e, columnItem['dataIndex'], record.ID)}
            onKeyPress={e => this.handleKeyPress(e, record.ID)}
            placeholder={columnItem['title']}
            { ...props }
          />
        )
      }
    }

  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && !nextProps.loading) {
      const data = nextProps.value || []
      // 仅在第一次进该组件的时候新建, 所以加了一个 isInit 的状态锁
      const newData = (nextProps.init && !this.state.isInit) ?
        [
          this.generateNewItem(nextProps.init),
          ...data
        ]
        :
        data
      this.setState({
        data: newData,
        isInit: true,
      });
    }
    // const newData = this.state.data.map(item => ({ ...item, editable: nextProps.editable }))
    // this.setState({ data: newData })
  }
  getRowByKey(key) {
    return this.state.data.filter(item => item.ID === key)[0];
  }
  index = 0;
  cacheOriginData = {};
  clickedCancel = false
  handleSubmit = (target) => {
    if (!target.ID) { return }
    if (target.ID.indexOf('NEW_TEMP') === -1) {
      this.props.onUpdate(target, target.ID)
      return
    }
    this.props.onSubmit(target)
    // e.preventDefault();
    // this.props.form.validateFieldsAndScroll((err, values) => {
    //     if (!err) {
    //         console.log(values)
    //     }
    // });
  }
  toggleEditable(key) {
    const target = this.getRowByKey(key);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: [...this.state.data] });
    }
  }
  toggleEditableAfterBlur(e, key) {
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (target) {
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = { ...target };
      }
      target.editable = !target.editable;
      this.setState({ data: [...this.state.data] });
    }
  }
  removeLocal(key) {
    const target = this.getRowByKey(key)
    if (!target.ID) { return }
    const newData = this.state.data.filter(item => item.ID !== key);
    this.setState({ data: newData });
  }
  remove(key) {
    const target = this.getRowByKey(key)
    if (!target.ID) { return }
    if (!target.isNew) {
      this.props.onDelete(target.ID)
      return
    }
    const newData = this.state.data.filter(item => item.ID !== key);
    this.setState({ data: newData });
  }
  newMember = () => {
    const data = [...this.state.data];
    const newMember = this.generateNewItem()
    const newData = [
      newMember,
      ...data
    ]
    this.index += 1;
    this.setState({ data: newData });
  }
  handleKeyPress(e, key) {
    if (e.key === 'Enter') {
      this.saveRow(key)
      // this.saveRowAfterBlur(e, key);
    }
  }
  handleFieldChange(e, fieldName, key) {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key);
    if (target) {
      target[fieldName] = e && (e.target ? e.target.value : e)
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
    this.clickedCancel = true
    const target = this.getRowByKey(key)
    let dataIndexArray = []
    if (target.isNew) {
      console.log(dataIndexArray)
    } else {
      dataIndexArray = this.state.columns.filter(item => (item.dataIndex !== 'action' && item.dataIndex !== 'Password')).map(item => item.dataIndex)
    }
    let isShowMessage = false
    dataIndexArray.forEach(item => {
      if (!target[item]) { isShowMessage = true }
    })
    if (isShowMessage) {
      message.error('请填写完整信息')
      return
    }
    // delete target.isNew
    // this.toggleEditable(key)
    if (target.isNew) {
      console.log('submit', target, this.props.payload)
      this.props.onSubmit(target, this.props.payload)
    } else {
      console.log('update', target)
      this.props.onUpdate(target, this.props.payload)
    }
  }
  saveRowAfterBlur(e, key) {
    e.persist();
    // save field when blur input
    setTimeout(() => {
      if (document.activeElement.tagName === 'INPUT' &&
        document.activeElement !== e.target) {
        return;
      }
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      }
      const target = this.getRowByKey(key);
      if (!target.ChineseName || !target.EnglishName || !target.ComputerTerminalImage || !target.MobileTerminalImage) {
        message.error('请填写完整品牌信息。');
        e.target.focus();
        return;
      }
      delete target.isNew;
      this.toggleEditableAfterBlur(e, key);
      // this.props.onChange(this.state.data);
      this.handleSubmit(target)
    }, 200);
  }
  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({ data: [...this.state.data] });
  }
  dataHandlerBeforeBulkCopy = (data) => {
    const ID = this.props.ID
    const newData = data && data.map(item => ({ ...item, ProductDefineID: ID }))
    const newJsonData = JSON.stringify(newData)
    return newJsonData
  }
  handleBulkCopy = () => {
    const dataObject = this.dataHandlerBeforeBulkCopy(this.state.data)
    this.props.onBulkCopy && this.props.onBulkCopy(dataObject, this.props.ID)
  }
  toEditHandler = () => {
    this.props.onToEdit()
    // const newData = this.state.data.map(item => ({ ...item, isEdit: this.props.editable }))
    // this.setState({data: newData})
  }
  quitEditHandler = () => {
    this.props.onQuitEdit()
    // const newData = this.state.data.map(item => ({ ...item, isEdit: this.props.editable }))
    // this.setState({data: newData})
  }
  render() {
    const { onBulkCopy, onSubmit, onUpdate, onDelete, init, columns, loading, editable, editAccess, ...otherProps } = this.props
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
          columns={this.state.columns}
          dataSource={this.state.data}
          rowClassName={(record) => {
            return record.editable ? styles.editable : '';
          }}
          rowKey={record => record.ID}
          loading={loading}
          { ...otherProps }
        />
      </div>
    );
  }
}
