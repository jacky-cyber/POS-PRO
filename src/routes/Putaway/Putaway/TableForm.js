import React, { PureComponent, Fragment } from 'react';
import { SwitchableFormItem, TooltipInput } from 'components/BaseComponents';
import { ProductLevelSelect, BarcodeSelect } from 'components/PutawayComponents';
import { Table, Button, Input, Popconfirm, InputNumber, Switch, Divider, message, Badge } from 'antd';
import { isValueValid } from 'utils/utils';
import styles from './style.less';

const { Search } = Input;


export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: props.value,
      searchCondition: '',
    };
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const newData = nextProps.value.map((item) => {
        if (item.Barcode) {
          return { ...item, Barcode: item.Barcode.split(',') };
        }
        return item;
      });
      this.setState({
        data: newData,
      });
    }
  }
  getRowByKey(key, newData) {
    return (newData || this.state.data).filter(item => item.ID === key)[0];
  }
  tableChangeHandler = (pagination, filters, sorter) => {
    this.props.dispatch({
      type: 'putaway/getGoodsForPutaway',
      payload: {
        pagination,
      },
    });
  }
  resetHandler = () => {
    this.props.dispatch({
      type: 'putaway/getGoodsForPutaway',
      payload: {
        value: '',
      },
    });
    this.setState({ searchCondition: '' });
  }

index = 0;
cacheOriginData = {};
toggleEditable = (e, key) => {
  e.preventDefault();
  const newData = this.state.data.map(item => ({ ...item }));
  const target = this.getRowByKey(key, newData);
  if (target) {
    // 进入编辑状态时保存原始数据
    if (!target.isEditing) {
      this.cacheOriginData[key] = { ...target };
    }
    target.isEditing = !target.isEditing;
    this.setState({ data: newData });
  }
}
removeLocal(key) {
  const newData = this.state.data.filter(item => item.ID !== key);
  this.setState({ data: newData });
}
remove(key) {
  if (key) {
    this.props.dispatch({
      type: 'putaway/deleteGoodsForPutaway',
      payload: key,
    });
  }
}
handleKeyPress(e, key) {
  if (e.key === 'Enter') {
    this.saveRow(e, key);
  }
}
fieldChangeHandler(e, fieldName, key) {
  const tempData = this.state.data.map(item => ({ ...item }));
  const target = this.getRowByKey(key, tempData);
  if (target) {
    if (isValueValid(e) || typeof e === 'boolean') {
      target[fieldName] = e.target ? e.target.value : e;
      this.setState({ data: tempData });
    }
  }
}

formatBoolToNum = boolean => (
  boolean ? 1 : 0
)


isValid = (value) => {
  return true;
  // const { ID, IsMilkPowder, CanWholesale, isEditing, isNew, ...filteredValue } = value;
  // const isValid = Object.keys(filteredValue).reduce((prev, current, index) => {
  //   const isCurrentValid = isValueValid(filteredValue[current]);
  //   if (index === 1) {
  //     const isPrevValid = isValueValid(filteredValue[prev]);
  //     return isPrevValid && isCurrentValid;
  //   }
  //   return prev && isCurrentValid;
  // });
  // if (!isValid) {
  //   message.error('请填写商品完整信息');
  //   return;
  // }
  // return value;
}

formatBeforeSubmit = (value) => {
  const { ID } = value;
  if (!ID) { return; }
  if (ID.includes('NEW_TEMP_ID')) {
    const { isEditing, isNew, ID, ...filteredValue } = value;
    const newValue = {
      ...filteredValue,
      ID: '',
      IsMilkPowder: this.formatBoolToNum(value.IsMilkPowder),
      CanWholesale: this.formatBoolToNum(value.CanWholesale),
    };
    if (this.isValid(newValue)) {
      return newValue;
    }
  } else {
    const { isEditing, isNew, ...filteredValue } = value;
    if (this.isValid(filteredValue)) {
      const newValue = {
        ...filteredValue,
        IsMilkPowder: this.formatBoolToNum(value.IsMilkPowder),
        CanWholesale: this.formatBoolToNum(value.CanWholesale),
      };
      return newValue;
    }
  }
}

saveRow(e, key) {
  // 保存行数据
  e.persist();
  const target = this.getRowByKey(key) || {};
  if (target) {
    const value = this.formatBeforeSubmit(target);
    if (value) {
      this.props.onAddOrUpdate(value);
    }
  }
  // const searchPayload = this.generateSearchPayload();
  // this.props.onSubmit(payload, this.props.pagination, searchPayload);
  // this.toggleEditable(e, key);
}
generateSearchPayload = () => {
  // 生成正常格式的查询条件
  const tempObj = {};
  Object.keys(this.props.searchCondition)
    .forEach((item) => {
      Object.assign(tempObj, { [item]: this.props.searchCondition[item].value });
    });
  return tempObj;
}
cancel(e, key) {
  // 取消编辑
  this.clickedCancel = true;
  e.preventDefault();
  const newData = this.state.data.map(item => ({ ...item }));
  const target = this.getRowByKey(key, newData);
  if (this.cacheOriginData[key]) {
    Object.assign(target, this.cacheOriginData[key]);
    target.isEditing = false;
    delete this.cacheOriginData[key];
  }
  this.setState({ data: newData });
  this.clickedCancel = false;
}
generateNewItem = (columns) => {
  const member = {
    ID: `NEW_TEMP_ID_${this.index}`,
    isEditing: true,
    isNew: true,
    EN: '[Trilogy]Holiday Heros Limited Edition',
    CN: 'Trilogy限量圣诞旅行套装',
    Sku: 'TL202003',
    Barcode: [],
    Specification: 'set',
    Weight: 0,
    ProductLevel: 'X',
    Brand: 'Trilogy',
    CanWholesale: true,
    IsMilkPowder: false,
    RetailPrice: 0,
    PlatinumPrice: 0,
    DiamondPrice: 0,
    VIPPrice: 0,
    SVIPPrice: 0,
    WholesalePrice: 0,
    SecondWholesalePrice: 0,
  };
  return member;
}
newMember = (columns) => {
  const data = [...this.state.data];
  const newMember = this.generateNewItem(columns);
  const newData = [newMember, ...data];
  this.index += 1;
  this.setState({ data: newData });
}
render() {
  const { loading, pagination, dispatch } = this.props;
  const { data, searchCondition } = this.state;
  const columns = [{
    title: '中文名',
    dataIndex: 'CN',
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={TooltipInput}
        onChange={e => this.fieldChangeHandler(e, 'CN', record.ID)}
      />
    ),
  }, {
    title: '英文名',
    dataIndex: 'EN',
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={TooltipInput}
        onChange={e => this.fieldChangeHandler(e, 'EN', record.ID)}
      />
    ),
  }, {
    title: 'SKU',
    dataIndex: 'Sku',
    width: 110,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={Input}
        onChange={e => this.fieldChangeHandler(e, 'Sku', record.ID)}
      />
    ),
  }, {
    title: '条码',
    dataIndex: 'Barcode',
    width: 180,
    render: (text, record) => {
      if (!record.isEditing) {
        if (Array.isArray(text)) {
          return (
            <div>
              {
                text.map(item => (
                  <div key={item}>{item}</div>
                ))
              }
            </div>
          );
        } else {
          return text;
        }
      }
      return (
        <SwitchableFormItem
          value={text}
          isEditing={record.isEditing}
          formItemElement={BarcodeSelect}
          onChange={e => this.fieldChangeHandler(e, 'Barcode', record.ID)}
        />
      );
    },
  }, {
    title: '规格',
    dataIndex: 'Specification',
    width: 60,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={Input}
        onChange={e => this.fieldChangeHandler(e, 'Specification', record.ID)}
      />
    ),
  }, {
    title: '重量',
    dataIndex: 'Weight',
    width: 60,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'Weight', record.ID)}
      />
    ),
  }, {
    title: '品级',
    dataIndex: 'ProductLevel',
    width: 60,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={ProductLevelSelect}
        onChange={e => this.fieldChangeHandler(e, 'ProductLevel', record.ID)}
      />
    ),
  }, {
    title: '类别',
    dataIndex: 'Brand',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={Input}
        onChange={e => this.fieldChangeHandler(e, 'Brand', record.ID)}
      />
    ),
  }, {
    title: '可否批发',
    dataIndex: 'CanWholesale',
    width: 80,
    render: (text, record) => {
      if (record.isEditing) {
        return (
          <Switch
            checked={!!text}
            disabled={!(record.isEditing)}
            onChange={e => this.fieldChangeHandler(e, 'CanWholesale', record.ID)}
          />
        );
      } else {
        return (
          <Badge
            status={text ? 'success' : 'error'}
            text={text ? '是' : '否'}
          />
        );
      }
    },
  }, {
    title: '是否代发',
    dataIndex: 'IsMilkPowder',
    width: 80,
    render: (text, record) => {
      if (record.isEditing) {
        return (
          <Switch
            checked={!!text}
            disabled={!(record.isEditing)}
            onChange={e => this.fieldChangeHandler(e, 'IsMilkPowder', record.ID)}
          />
        );
      } else {
        return (
          <Badge
            status={text ? 'success' : 'error'}
            text={text ? '是' : '否'}
          />
        );
      }
    },
  }, {
    title: '零售价',
    dataIndex: 'RetailPrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'RetailPrice', record.ID)}
      />
    ),
  }, {
    title: '白金价',
    dataIndex: 'PlatinumPrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'PlatinumPrice', record.ID)}
      />
    ),
  },
  {
    title: '钻石价',
    dataIndex: 'DiamondPrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'DiamondPrice', record.ID)}
      />
    ),
  },
  {
    title: 'VIP价',
    dataIndex: 'VIPPrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'VIPPrice', record.ID)}
      />
    ),
  },
  {
    title: 'SVIP价',
    dataIndex: 'SVIPPrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'SVIPPrice', record.ID)}
      />
    ),
  },
  {
    title: '一级批发',
    dataIndex: 'WholesalePrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'WholesalePrice', record.ID)}
      />
    ),
  },
  {
    title: '二级批发',
    dataIndex: 'SecondWholesalePrice',
    width: 80,
    render: (text, record) => (
      <SwitchableFormItem
        value={text}
        isEditing={record.isEditing}
        formItemElement={InputNumber}
        onChange={e => this.fieldChangeHandler(e, 'SecondWholesalePrice', record.ID)}
      />
    ),
  }, {
    title: '操作',
    key: 'action',
    width: 90,
    render: (text, record) => {
      if (!!record.isEditing && this.props.loading) {
        return null;
      }
      if (record.isEditing) {
        if (record.isNew) {
          return (
            <span>
              <a onClick={e => this.saveRow(e, record.ID)}>保存</a>
              <Divider type="vertical" />
              <Popconfirm title="是否要删除此行？" onConfirm={() => this.removeLocal(record.ID)}>
                <a>删除</a>
              </Popconfirm>
            </span>
          );
        }
        return (
          <span>
            <a onClick={e => this.saveRow(e, record.ID)}>保存</a>
            <Divider type="vertical" />
            <a onClick={e => this.cancel(e, record.ID)}>取消</a>
          </span>
        );
      }
      return (
        <span>
          <a onClick={e => this.toggleEditable(e, record.ID)}>编辑</a>
          <Divider type="vertical" />
          <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.ID)}>
            <a>删除</a>
          </Popconfirm>
        </span>
      );
    },
  }];
  return (
    <Fragment>
      <div className={styles.tableWrapper}>
        <div className={styles.searchBar}>
          <Search
            value={searchCondition}
            onChange={e => this.setState({ searchCondition: e.target.value })}
            style={{ width: 400 }}
            onSearch={value => dispatch({
              type: 'putaway/getGoodsForPutaway',
              payload: {
                value,
              },
            })}
          />
          <Button
            onClick={this.resetHandler}
          >
            重置
          </Button>
          <Button
            type="primary"
            onClick={this.newMember.bind(this, columns)}
          >
            新建
          </Button>
        </div>
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          bordered
          rowClassName={(record) => {
            return record.isEditing ? styles.isEditing : '';
          }}
          pagination={pagination}
          onChange={this.tableChangeHandler}
          rowKey={record => record.ID}
        />
      </div>
    </Fragment>
  );
}
}
