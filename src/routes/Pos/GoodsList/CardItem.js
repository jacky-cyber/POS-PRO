import React, { PureComponent } from 'react';
import { Card } from 'antd';
import styles from './CardItem.less';

const { Meta, Grid } = Card

export default class CardItem extends PureComponent {
  handleClick = (key) => {
    this.props.dispatch({ type: 'commodity/clickGoodsItem', payload: key });
    setTimeout(() => {
      this.props.dispatch({ type: 'commodity/clickGoodsItemTrue', payload: key });
    }, 0);
  }
  render() {
    const { saleType, item } = this.props;
    const { EN, Image, Key, dataClicked, RetailPrice } = item;
    const imgPlaceholder = 'http://via.placeholder.com/100x100'
    return (
      <Grid
        className={styles.cardGrid}
      >
        <Card
          className={styles.commodityItem}
          bodyStyle={{ padding: 2 }}
          dataclicked={dataClicked}
          onClick={() => this.handleClick(Key)}
          cover={<img className={styles.imgItem} src={Image || imgPlaceholder} alt="商品图片" />}
          // actions={[<span className={styles.priceTag}>{RetailPrice}</span>]}
        >
          <Meta
            title={<span className={styles.priceTag}>{RetailPrice}</span>}
            description={EN}
          />
        </Card>
        {/* <div>
          <div className={styles.imgWrapper}>
            <img src={Image || imgPlaceholder} alt="商品图片" />
          </div>
          <div className={styles.commodityName}>{EN}</div>
          <span className={styles.priceTag}>{RetailPrice}</span>
        </div> */}
      </Grid>
    );
  }
}
