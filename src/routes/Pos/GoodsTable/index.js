import React, { PureComponent } from 'react';
import { Table, Layout, Icon, Button, InputNumber, Select, Radio } from 'antd';
import update from 'immutability-helper';
import { connect } from 'dva';
import cls from 'classnames';
import { ChooseCalculator, SelectedGoods } from 'components/PosComponents';
import { TagSelect, HeaderSearch } from 'components/BaseComponents';
import { POS_TAB_TYPE, SALE_TYPE } from 'constant';
import styles from './index.less';


const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const { Sider, Content } = Layout;
const { Option } = Select;


const originalColumns = [
  {
    title: '中文名',
    dataIndex: 'CN',
    key: 'CN',
  },
  {
    title: '英文名',
    dataIndex: 'EN',
    key: 'EN',
  },
  {
    title: '零售价',
    dataIndex: 'RetailPrice',
    key: 'RetailPrice',
  },
  {
    title: '白金价',
    dataIndex: 'PlatinumPrice',
  },
  {
    title: '钻石价',
    dataIndex: 'DiamondPrice',
  },
  {
    title: 'VIP价',
    dataIndex: 'VIPPrice',
  },
  {
    title: 'SVIP价',
    dataIndex: 'SVIPPrice',
  },
  {
    title: '会员价格',
    dataIndex: 'CustomerPrice',
    key: 'CustomerPrice',
  },
];

const wholesaleColumns = [
  {
    title: '中文名',
    dataIndex: 'CN',
    key: 'CN',
  },
  {
    title: '英文名',
    dataIndex: 'EN',
    key: 'EN',
  },
  {
    title: '一级批发价',
    dataIndex: 'WholesalePrice',
  },
  {
    title: '二级批发价',
    dataIndex: 'SecondWholesalePrice',
  },
];


function searchResult(
  value,
  count,
  includedBarcodeCount,
  includedSkuCount,
  includedCNCount,
  includedENCount) {
  return [
    <Option key={`${value}1`} value="" text={`${value}`}>
      条码等于 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{count}</span> 个
    </Option>,
    <Option key={`${value}2`} value="barcode" text="">
      条码包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedBarcodeCount}</span> 个
    </Option>,
    <Option key={`${value}3`} value="sku" text="">
      SKU 包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedSkuCount}</span> 个
    </Option>,
    <Option key={`${value}3`} value="CN" text="">
      中文名 包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedCNCount}</span> 个
    </Option>,
    <Option key={`${value}3`} value="EN" text="">
      英文名 包含 <span style={{ color: 'red' }}>{value}</span> 的商品有 <span className={styles.optionCount}>{includedENCount}</span> 个
    </Option>,
  ];
}


  @connect(state => ({
    currentOrderGoodsList: state.commodity.currentOrderGoodsList,
    loading: state.loading.effects['commodity/getStoreSaleGoods'] || state.loading.effects['commodity/getMilkPowderGoods'] || state.loading.effects['commodity/getStoreSaleGoods'],
    order: state.commodity.orders.filter(item => item.key === state.commodity.activeTabKey)[0],
    activeTabKey: state.commodity.activeTabKey,
  }))

export default class GoodsTable extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        display: false,
        originalContent: props.currentOrderGoodsList,
        content: props.currentOrderGoodsList,
        dataSource: [],
        filteredContent: [],
        includedBarcodeContent: [],
        includedSkuContent: [],
        includedCNContent: [],
        includedENContent: [],
        columns: [
          {
            title: '中文名',
            dataIndex: 'CN',
            key: 'CN',
          },
          {
            title: '英文名',
            dataIndex: 'EN',
            key: 'EN',
          },
          {
            title: '零售价',
            dataIndex: 'RetailPrice',
            key: 'RetailPrice',
          },
          {
            title: '白金价',
            dataIndex: 'PlatinumPrice',
          },
          {
            title: '钻石价',
            dataIndex: 'DiamondPrice',
          },
          {
            title: 'SVIP价',
            dataIndex: 'SVIPPrice',
          },
          {
            title: '会员价格',
            dataIndex: 'CustomerPrice',
            key: 'CustomerPrice',
          },
          {
            title: '数量',
            dataIndex: 'Count',
            key: 'Count',
            render: (text, record) => {
              return (
                <InputNumber
                  style={{ width: 50 }}
                  size="small"
                  value={text}
                  min={0}
                  onChange={value => this.countChangeHandler(value, record)}
                />
              );
            },
          },
          {
            title: '库存',
            dataIndex: 'Stock',
            key: 'Stock',
          },
          {
            title: '操作',
            dataIndex: 'Add',
            key: 'Add',
            render: (text, record, index) => {
              return (
                <Button
                  type="primary"
                  size="small"
                  className={styles.addButton}
                  icon="shopping-cart"
                  shape="circle"
                  onClick={() => props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: record.Key, count: record.Count } })}
                />
              );
            },
          },
        ],
        commonColumns: [
          {
            title: '数量',
            dataIndex: 'Count',
            key: 'Count',
            render: (text, record) => {
              return (
                <InputNumber
                  style={{ width: 50 }}
                  size="small"
                  value={text}
                  min={0}
                  onChange={value => this.countChangeHandler(value, record)}
                />
              );
            },
          },
          {
            title: '库存',
            dataIndex: 'Stock',
            key: 'Stock',
          },
          {
            title: '操作',
            dataIndex: 'Add',
            key: 'Add',
            render: (text, record, index) => {
              return (
                <Button
                  type="primary"
                  size="small"
                  className={styles.addButton}
                  icon="shopping-cart"
                  shape="circle"
                  onClick={() => props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: record.Key, count: record.Count } })}
                />
              );
            },
          },
        ],
        tagList: [
          {
            title: '商品名',
            dataIndex: 'CN',
            key: 'Name',
          },
          {
            title: '零售价',
            dataIndex: 'RetailPrice',
            key: 'RetailPrice',
          },
          {
            title: '销售价',
            dataIndex: 'RealPrice',
            key: 'RealPrice',
          },
          {
            title: '操作',
            dataIndex: 'Add',
            key: 'Add',
          },
        ],
      };
    }

    componentDidMount() {
      const { order } = this.props;
      const { type } = order;
      this.updateColumns(type);
    }

    componentWillReceiveProps(nextProps) {
      const { currentOrderGoodsList, order } = nextProps;
      const { type } = order;
      const { activeTabKey: oldActiveTabKey } = this.props;
      const { activeTabKey: newActiveTabKey } = nextProps;
      // if (oldActiveTabKey !== newActiveTabKey) {
      this.setState({
        content: currentOrderGoodsList,
        originalContent: currentOrderGoodsList,
      });
      this.updateColumns(type);
      // }
    }

    updateColumns = (type) => {
      if (type === 3) {
        this.setState({
          columns: [...wholesaleColumns, ...this.state.commonColumns],
        });
      } else {
        this.setState({
          columns: [...originalColumns, ...this.state.commonColumns],
        });
      }
    }
    countChangeHandler = (value, record) => {
      const key = record.Key;
      const newContent = this.state.content.map((item) => {
        if (item.Key === key) {
          return { ...item, Count: value };
        }
        return item;
      });
      this.setState({ content: newContent });
    }

    toggleCollapse = () => {
      this.setState({
        display: !this.state.display,
      });
    }


    moveColumn = (dragIndex, hoverIndex) => {
      const { columns } = this.state;
      const dragRow = columns[dragIndex];

      this.setState(
        update(this.state, {
          columns: {
            $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
          },
        }),
      );
    }
    tagChangeHandler = (tagList) => {
      const newColumns = this.state.tagList.filter((columnItem) => {
        return !!tagList.find(tagItem => (tagItem === columnItem.dataIndex));
      });
      this.setState({ columns: newColumns });
    }
    selectHandler = (value) => {
      if (value === '') {
        this.pressEnterHandler(value);
      } else if (value === 'barcode') {
        this.setState({ content: this.state.includedBarcodeContent });
      } else if (value === 'sku') {
        this.setState({ content: this.state.includedSkuContent });
      } else if (value === 'CN') {
        this.setState({ content: this.state.includedCNContent });
      } else if (value === 'EN') {
        this.setState({ content: this.state.includedENContent });
      }
    }
    searchHandler = (value) => {
      const processedValue = value.trim().toLowerCase();
      // 等于一品多码中的一个
      const filteredContent = this.state.originalContent.filter(item => item.Barcode.split(',').map(item => item.toLowerCase()).includes(processedValue));
      // 包含条码
      const includedBarcodeContent = this.state.originalContent.filter(item => (
        item.Barcode.toLowerCase().includes(processedValue)
      ));
      // 包含 sku
      const includedSkuContent = this.state.originalContent.filter(
        item => (
          item.Sku.toLowerCase().includes(processedValue))
      );
      // 品名
      const strArray = value ?
        value.split(' ').filter(item => item !== '').map(item => item.toLowerCase())
        : [];
      const includedCNContent = this.state.originalContent.filter(item => (strArray.reduce((a, b) => {
        const s = item.CN.toLowerCase() || '';
        const b1 = typeof a === 'boolean' ? a : s.includes(a);
        const b2 = s.includes(b);
        return b1 && b2;
      }, true)));
      const includedENContent = this.state.originalContent.filter(item => (strArray.reduce((a, b) => {
        const s = item.EN.toLowerCase() || '';
        const b1 = typeof a === 'boolean' ? a : s.includes(a);
        const b2 = s.includes(b);
        return b1 && b2;
      }, true)));
      this.setState({
        dataSource: value ?
          searchResult(
            value,
            filteredContent.length,
            includedBarcodeContent.length,
            includedSkuContent.length,
            includedCNContent.length,
            includedENContent.length
          )
          : [],
        filteredContent,
        includedBarcodeContent,
        includedSkuContent,
        includedCNContent,
        includedENContent,
      });
    }
    clearSearchHandler = () => {
      this.setState({ content: this.props.currentOrderGoodsList });
    }
    pressEnterHandler = () => {
      this.setState({
        dataSource: [],
      });
      const { filteredContent } = this.state;
      if (filteredContent.length === 1) {
        const filteredItem = filteredContent[0];
        this.props.dispatch({ type: 'commodity/addToSelectedList', payload: { key: filteredItem.Key, count: 1 } });
      }
    }
    render() {
      const { order, dispatch, loading, activeTabKey } = this.props;
      const { dataSource, content } = this.state;
      const drawableContent = content.map(item => ({
        ...item,
      }));
      const { saleType, type } = order;
      const defaultValue = this.state.tagList.map(item => item.dataIndex);
      const tagSelectWrapper = cls({
        [styles.tagSelectShow]: this.state.display,
        [styles.tagSelectHide]: !this.state.display,
      });
      const typeSelectRender = (
        type === POS_TAB_TYPE.STORESALE && (
          <RadioGroup
            value={saleType}
            onChange={e => dispatch({ type: 'commodity/clickChangeSaleTypeButton', payload: e.target.value })}
            style={{ marginLeft: 24 }}
            disabled={loading}
          >
            <RadioButton value={SALE_TYPE.LOCAL}>本地</RadioButton>
            <RadioButton value={SALE_TYPE.EXPRESS}>邮寄</RadioButton>
            <RadioButton value={SALE_TYPE.SHIPPING}>代发</RadioButton>
          </RadioGroup>
        )
      );
      const tabHeaderRender = (
        <div>
          <HeaderSearch
            className={`${styles.action} ${styles.search}`}
            placeholder="商品条码搜索-此状态下可使用扫码枪"
            dataSource={dataSource}
            optionLabelProp="text"
            onSelect={this.selectHandler}
            onSearch={this.searchHandler}
            onPressEnter={this.pressEnterHandler}
            activeTabKey={activeTabKey}
          />
          <a onClick={() => this.clearSearchHandler()}>清除搜索</a>
        </div>
      );
      return (
        <Layout>
          <Sider
            width={440}
            className={styles.sider}
          >
            <Content
              className={styles.leftContent}
            >
              <SelectedGoods />
            </Content>
            <div
              className={styles.calculator}
            >
              <ChooseCalculator />
            </div>
          </Sider>
          <Content className={styles.rightContent}>
            <div className={styles.header}>
              <div>
                <a style={{ marginLeft: 8 }} onClick={this.toggleCollapse}>
                  配置表格 <Icon type={this.state.display ? 'up' : 'down'} />
                </a>
              </div>
              { typeSelectRender }
            </div>
            <div className={tagSelectWrapper}>
              <TagSelect onChange={this.tagChangeHandler} defaultValue={defaultValue}>
                {
                  this.state.tagList.map(item => (
                    <TagSelect.Option value={item.dataIndex} key={item.key}>
                      {item.title}
                    </TagSelect.Option>
                  ))
                }
              </TagSelect>
            </div>
            <div className={styles.tabHeader}>
              { tabHeaderRender }
            </div>
            <div className={styles.commodityListWrapper}>
              <Table
                bordered
                dataSource={drawableContent}
                columns={this.state.columns}
                rowKey={record => record.Key}
                loading={loading}
                size="small"
                pagination={{
                    pageSize: 15,
                }}
              />
            </div>
          </Content>
        </Layout>
      );
    }
  }
