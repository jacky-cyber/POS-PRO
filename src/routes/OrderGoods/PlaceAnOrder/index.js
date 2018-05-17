import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Select, Icon, Button, InputNumber, DatePicker, Modal, message, Table } from 'antd';
import Cookies from 'js-cookie';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import GoodsList from './GoodsList';

import styles from './index.less';

const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
  goodsList: state.orderGoods.goodsList,
  isGetGoodsListLoading: state.orderGoods.isGetGoodsListLoading,
}))
@Form.create()
export default class PlaceAnOrder extends PureComponent {
  state = {
    goodsOrderedList: [],
    goodsList: [],
    modalVisible: false,
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'orderGoods/fetchGoodsList' });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.goodsList && Array.isArray(nextProps.goodsList)) {
      this.setState({ goodsList: nextProps.goodsList });
    }
  }
  submitHandler = () => {
    const currentUser = Cookies.getJSON('currentUser');
    const { DepartmentID, ShopName } = currentUser;
    const detail = this.state.goodsOrderedList.map(item => ({
      ProductName: item.EN,
      Number: item.Count,
      Sku: item.Sku,
    }));
    const value = {
      ShopName,
      DepartmentID,
      Detail: detail,
    };
    const valueJson = JSON.stringify(value);
    this.props.dispatch({ type: 'orderGoods/addOrder', payload: valueJson });
  }

  countChangeHandler = (value, record) => {
    const { goodsOrderedList } = this.state;
    let newList = [];
    const tempItem = goodsOrderedList.filter(item => item.Sku === record.Sku)[0];
    if (tempItem) {
      newList = goodsOrderedList.map((item) => {
        if (item.Sku === tempItem.Sku) { return { ...tempItem, Count: value }; }
        return item;
      });
    } else {
      newList = [...goodsOrderedList, { ...record, Count: value }];
    }
    const newFilteredList = newList.filter(item => item.Count !== 0);
    this.setState(
      { goodsOrderedList: newFilteredList },
    );
  }

  render() {
    const { isGetGoodsListLoading } = this.props;
    const { modalVisible, goodsList, goodsOrderedList } = this.state;

    const columns = [
      {
        title: 'SKU',
        dataIndex: 'Sku',
      },
      {
        title: '英文名',
        dataIndex: 'EN',
      },
      {
        title: '中文名',
        dataIndex: 'CN',
      },
      {
        title: '规格',
        dataIndex: 'Specification',
      },
      {
        title: '订货数量',
        dataIndex: 'Count',
        render: (text, record, index) => (
          <InputNumber
            value={text}
            min={0}
            max={record.Stock || 0}
            onChange={value => this.countChangeHandler(value, record)}
          />
        ),
      },
      {
        title: '库存量',
        dataIndex: 'Stock',
      },
    ];


    return (
      <PageHeaderLayout title="发起订货">
        <Card bordered={false}>
          <Modal
            visible={modalVisible}
            onCancel={() => this.setState({ modalVisible: false })}
            width={1200}
            footer={null}
            closable={false}
          >
            <GoodsList
              goodsList={goodsList}
              loading={isGetGoodsListLoading}
              countChangeHandler={this.countChangeHandler.bind(this)}
            />
          </Modal>
          <div className={styles.tableList}>
            <Row type="flex" justify="space-between">
              <Col>
                <Button
                  type="primary"
                  onClick={() => this.setState({ modalVisible: true })}
                >
                  点击选择商品
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={this.submitHandler}
                  disabled={goodsOrderedList.length === 0}
                >发起订货
                </Button>
              </Col>
            </Row>
            <Table
              onChange={this.handleStandardTableChange}
              rowKey={record => record.Sku}
              columns={columns}
              dataSource={goodsOrderedList}
              pagination={null}
            />
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
