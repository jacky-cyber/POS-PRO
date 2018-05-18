import React, { PureComponent } from 'react';
import { Select, Button } from 'antd';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import styles from './index.less';

const { Option } = Select;

const searchTypeMapping = {
  Sku: 'SKU',
  ChineseName: '产品中文名',
  EnglishName: '产品英文名',
  // BrandChineseName: '品牌中文名',
  // BrandEnglishName: '品牌英文名',
};

const generateOptions = (options) => {
  const newOptions = options.map((item) => {
    return <Option value={item.ID} key={item.ID}> {item.label} </Option>;
  });
  return newOptions;
};

@connect()

export default class Searchable extends PureComponent {
  constructor() {
    super();
    this.state = {
      searchString: '',
      value: [],
      // searchType: new Set(['Sku', 'ChineseName', 'EnglishName', 'BrandChineseName', 'BrandEnglishName']),
      searchType: new Set(['Sku', 'ChineseName', 'EnglishName']),
    };
  }
  searchHandler = (string) => {
    this.setState({
      searchString: string,
    });
  }
  selectHandler = (value, option) => {
    const searchTypeItem = value.split('-')[0];
    this.state.searchType.delete(searchTypeItem);
    this.setState({
      searchType: new Set([...this.state.searchType]),
      value: [...this.state.value, value],
    });
  }
  deselectHandler = (value, option) => {
    const searchTypeItem = value.split('-')[0];
    const newSearchType = this.state.searchType.add(searchTypeItem);
    const newValue = [...this.state.value].filter(item => item !== value);
    this.setState({
      searchType: newSearchType,
      value: newValue,
    });
  }
  blurHandler = () => {
    this.setState({ searchString: '' });
  }
  submitHandler = () => {
    const payload = {};
    this.state.value.forEach((item) => {
      const tempArray = item.split('-');
      const key = tempArray[0];
      const value = tempArray[1];
      Object.assign(payload, { [key]: value });
    });
    this.props.dispatch({ type: 'orderGoods/fetchGoodsList', payload });
  }
  render() {
    const { searchString, searchType } = this.state;
    const newOptions = [...searchType].map(item => ({
      ID: `${item}-${searchString}`,
      label: `在 ${searchTypeMapping[item]} 下查询 ${searchString}`,
    }));
    const options = searchString ?
      newOptions
      :
      [];
    return (
      <div>
        <div className={styles.searchSelectWrapper}>
          <Select
            onBlur={this.blurHandler}
            style={{ width: '100%' }}
            mode="multiple"
            showSearch
            onSearch={this.searchHandler}
            optionFilterProp="children"
            filterOption={(input, option) => {
              return option.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }}
            notFoundContent="请输入想要搜索的内容"
            onSelect={this.selectHandler}
            onDeselect={this.deselectHandler}
          >
            {generateOptions(options)}
          </Select>
          <Button
            onClick={this.submitHandler}
            style={{ marginLeft: 24 }}
            type="primary"
            shape="circle"
            icon="search"
          />
        </div>
      </div>
    );
  }
}
