import React, { PureComponent } from 'react';
import { Select, Modal, Button } from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less'

const { Option } = Select;

const searchTypeMapping = {
  Sku: 'SKU',
  ChineseName: '产品中文名',
  EnglishName: '产品英文名',
  BrandChineseName: '品牌中文名',
  BrandEnglishName: '品牌英文名',
}

const generateOptions = (options) => {
  const newOptions = options.map((item) => {
    return <Option value={item.ID} key={item.ID}> {item['label']} </Option>;
  });
  return newOptions;
};

export default class Searchable extends PureComponent {
  static propTypes = {
    fetchData: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.object]),
    data: PropTypes.array,
    label: PropTypes.string,
    CreateForm: PropTypes.func,
  }
  constructor() {
    super();
    this.state = {
      searchString: '',
      isShowModal: false,
      cacheSearchString: '',
      value: [],
      searchType: new Set(['Sku', 'ChineseName', 'EnglishName', 'BrandChineseName', 'BrandEnglishName']),
    };
  }
  componentDidMount() {
    if (this.props.payload) {
      this.props.fetchData && this.props.fetchData(this.props.payload);
      this.props.cascadeFunc && this.props.cascadeFunc(this.props.payload);
      return;
    }
    this.props.fetchData && this.props.fetchData();
  }
  toggleModal = () => {
    this.setState({ isShowModal: !this.state.isShowModal });
  }
  searchHandler = (string) => {
    this.setState({
      searchString: string,
    });
  }
  selectHandler = (value, option) => {
    const searchTypeItem = value.split('-')[0]
    this.state.searchType.delete(searchTypeItem)
    this.setState({
      searchType: new Set([...this.state.searchType]),
      value: [...this.state.value, value]
    })
    // if (value.includes('create-')) {
    //   this.toggleModal();
    //   this.setState({ cacheSearchString: value });
    // } else {
    //   this.props.onChange(value);
    // }
  }
  deselectHandler = (value, option) => {
    const searchTypeItem = value.split('-')[0]
    const newSearchType = this.state.searchType.add(searchTypeItem)
    const newValue = [...this.state.value].filter(item => item !== value)
    this.setState({
      searchType: newSearchType,
      value: newValue,
    })
  }
  blurHandler = () => {
    this.setState({ searchString: '' })
  }
  submitHandler = () => {
    console.log(this.state.value)
  }
  render() {
    const { searchString, searchType, value } = this.state;
    const newOptions = [...searchType].map(item => ({
      ID: `${item}-${searchString}`,
      label: `在 ${searchTypeMapping[item]} 下查询 ${searchString}`,
    }))
    const options = searchString ?
      newOptions
      // [
      //   { ID: `sku-${searchString}`, label: `在SKU下查询  ${searchString}` },
      //   { ID: `ChineseName-${searchString}`, label: `在中文名下查询 ${searchString}` },
      //   { ID: `EnglishName-${searchString}`, label: `在英文名下查询 ${searchString}` },
      //   { ID: `BrandChineseName-${searchString}`, label: `在品牌中文名下查询 ${searchString}` },
      //   { ID: `BrandEnglishName-${searchString}`, label: `在品牌英文名下查询 ${searchString}` },
      // ]
      :
      []
    return (
      <div>
        <div className={styles.searchSelectWrapper}>
          <Select
            onBlur={this.blurHandler}
            style={{ width: '100%' }}
            mode='multiple'
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
