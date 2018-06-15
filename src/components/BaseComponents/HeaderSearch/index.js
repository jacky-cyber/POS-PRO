import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon, AutoComplete } from 'antd';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';
import styles from './index.less';

export default class HeaderSearch extends PureComponent {
  static defaultProps = {
    defaultActiveFirstOption: false,
    onPressEnter: () => {},
    onSearch: () => {},
    className: '',
    placeholder: '',
    dataSource: [],
  };
  static propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onSearch: PropTypes.func,
    onPressEnter: PropTypes.func,
    defaultActiveFirstOption: PropTypes.bool,
    dataSource: PropTypes.array,
  };
  state = {
    searchMode: false,
    value: '',
  };
  componentDidMount() {
    Mousetrap.bind('alt+s', () => {
      this.enterSearchMode();
    });
    this.enterSearchMode();
    // window.addEventListener('keyup', this.listen.bind(this));
  }
  componentWillReceiveProps(nextProps) {
    const { activeTabKey: oldActiveTabKey } = this.props;
    const { activeTabKey: newActiveTabKey } = nextProps;
    if (oldActiveTabKey !== newActiveTabKey) {
      this.enterSearchMode();
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
    Mousetrap.unbind('alt+s');
  }
  onKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.setState({ value: null });
      this.timeout = setTimeout(() => {
        this.props.onPressEnter(this.state.value); // Fix duplicate onPressEnter
      }, 0);
    }
  }
  onChange = (value) => {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange();
    }
  }
  listen(e) {
    if (e.keyCode === 27) this.leaveSearchMode();
  }
  enterSearchMode = () => {
    this.setState({ searchMode: true }, () => {
      if (this.state.searchMode) {
        this.input.focus();
      }
    });
  }
  leaveSearchMode = () => {
    this.setState({
      searchMode: false,
      value: null,
    });
    this.input.blur();
  }
  render() {
    const { className, placeholder, ...restProps } = this.props;
    const inputClass = classNames(styles.input, {
      [styles.show]: this.state.searchMode,
    });
    return (
      <span
        className={classNames(className, styles.headerSearch)}
        onClick={this.enterSearchMode}
      >
        <Icon type="search" key="Icon" />
        <AutoComplete
          key="AutoComplete"
          {...restProps}
          className={inputClass}
          onChange={this.onChange}
          value={this.state.value}
        >
          <Input
            placeholder={placeholder}
            ref={(node) => {
              this.input = node;
            }}
            onKeyDown={this.onKeyDown}
            // onBlur={this.leaveSearchMode}
          />
        </AutoComplete>
      </span>
    );
  }
}
