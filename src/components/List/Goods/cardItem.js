import React, { PureComponent } from 'react';
import { Card, Button, Layout } from 'antd'
import styles from './cardItem.less'

export default class CardItem extends PureComponent {
    handleClick = (key) => {
        this.props.dispatch({type: 'commodity/clickGoodsItem', payload: key})
        setTimeout(() => {
            this.props.dispatch({type: 'commodity/clickGoodsItemTrue', payload: key})
        }, 0)
    }
    render() {
        const { Name, UnitPrice, Image, Key, dataClicked } = this.props.item
        return(
            <Card
                className={styles.commodityItem}
                bodyStyle={{padding: 2}}
                dataclicked={dataClicked}
                onClick={() => this.handleClick(Key)}
            >
                <div>
                    <div className={styles.imgWrapper}>
                        <img src={Image} alt="商品图片" />
                    </div>
                    <div className={styles.commodityName}>{Name}</div>
                    <span className={styles.priceTag}>{UnitPrice}</span>
                </div>
            </Card>
        )
    }
}
