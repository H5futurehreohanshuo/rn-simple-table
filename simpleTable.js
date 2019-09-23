import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ViewPropTypes, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { Table, TableWrapper, Cell } from 'react-native-table-component';
import { cloneDeep } from 'lodash';

import { TABLE_BORDER_COLOR } from '../constant';

const styles = StyleSheet.create({
  tableContainer: {
    backgroundColor: '#fff'
  },
  table: {
    minWidth: '100%',
    flexDirection: 'column'
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: TABLE_BORDER_COLOR
  },
  tableBody: {
    flex: 1
  },
  tableRow: {
    minWidth: '100%',
    flexDirection: 'row'
  },
  tableSummaryRow: {
    backgroundColor: '#fafafa',
    borderBottomColor: TABLE_BORDER_COLOR,
    borderBottomWidth: 0.5
  },
  commonColumn: {
    padding: 15
  },
  commonColumnText: {
    lineHeight: 18,
    fontSize: 13,
    color: '#646464'
  },
  headerColumnText: {},
  headerColumn: {},
  bodyColumn: {},
  bodySummaryColumn: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 7,
    paddingBottom: 7
  },
  bodySummaryColumnText: {
    fontSize: 12,
    color: '#000'
  },
  columnSort: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  columnSortText: {
    textAlign: 'right'
  },
  sortContainer: { marginLeft: 5, width: 6 },
  sort: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderLeftWidth: 3,
    borderRightColor: 'transparent',
    borderRightWidth: 3
  },
  sortAscend: {
    marginBottom: 2,
    borderBottomColor: '#c7c7c7',
    borderBottomWidth: 6
  },
  sortAscending: {
    borderBottomColor: '#7a7def'
  },
  sortDescend: {
    borderTopColor: '#c7c7c7',
    borderTopWidth: 6
  },
  sortDescending: {
    borderTopColor: '#7a7def'
  }
});

const processNum = num => {
  if (!num) return 0;
  if (typeof num === 'number') return num;
  const newNum = num.replace('%', '');
  return +newNum;
};

const sortArr = (arr, field, type, defaultArr = []) => {
  const copyArr = arr.concat([]);
  let dataListSorted;
  switch (type) {
    case 'ascend':
      dataListSorted = copyArr.sort((a, b) => {
        const valueA = processNum(a[field]);
        const valueB = processNum(b[field]);

        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      });
      break;
    case 'descend':
      dataListSorted = copyArr.sort((a, b) => {
        const valueA = processNum(a[field]);
        const valueB = processNum(b[field]);

        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
        return 0;
      });
      break;
    default:
      dataListSorted = defaultArr;
      break;
  }
  return dataListSorted;
};

class SimpleTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      dataSummary: [],
      sortColumn: '',
      sortType: 'default'
    };
  }

  componentWillMount() {
    const { dataSource, dataSummary = [] } = this.props;
    this.setState({
      dataSource: cloneDeep(dataSource),
      dataSummary: cloneDeep(dataSummary)
    });
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource, dataSummary = [] } = nextProps;
    this.setState({
      dataSource: cloneDeep(dataSource),
      dataSummary: cloneDeep(dataSummary)
    });
  }

  handleSortTable = sortColumn => {
    const sortTypeNextMap = {
      ascend: 'descend',
      descend: 'default',
      default: 'ascend'
    };
    const { sortType } = this.state;

    this.setState(
      {
        sortColumn,
        sortType: sortTypeNextMap[sortType]
      },
      () => {
        this.operaSortTable();
      }
    );
  };

  operaSortTable = () => {
    const { dataSource, sortColumn, sortType } = this.state;
    const { dataSource: defaultDataSource } = this.props;
    // 排序
    this.setState({
      dataSource: sortArr(dataSource, sortColumn, sortType, defaultDataSource)
    });
  };

  handleClickRow = row => {
    const { rowClick } = this.props;
    // eslint-disable-next-line no-unused-expressions
    rowClick && rowClick(row);
  };

  render() {
    const { dataSource, sortColumn, sortType, dataSummary } = this.state;
    const { columns, textStyle, cellStyle, style, bodyHeight, headerStyle } = this.props;

    const HeadCell = column => {
      if (column.renderHeader) {
        return column.renderHeader(column.title);
      }
      // 排序
      if (column.sortable) {
        return (
          <TouchableOpacity onPress={() => this.handleSortTable(column.dataIndex)}>
            <View style={[styles.columnSort]}>
              <Text style={[styles.commonColumnText, styles.columnSortText, column.style && { ...column.style }]}>
                {column.title}
              </Text>
              <View style={styles.sortContainer}>
                <View
                  style={[
                    styles.sort,
                    styles.sortAscend,
                    sortColumn === column.dataIndex && sortType === 'ascend' && styles.sortAscending
                  ]}
                />
                <View
                  style={[
                    styles.sort,
                    styles.sortDescend,
                    sortColumn === column.dataIndex && sortType === 'descend' && styles.sortDescending
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        );
      }
      return column.title;
    };

    // 渲染数据单元格
    const renderCell = (column, data, dataIndex) => {
      // 展示序号
      if (column.type === 'index') {
        return dataIndex + 1;
      }
      if (column.render) {
        return column.render(data[column.dataIndex], data);
      }
      return data[column.dataIndex];
    };

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={[styles.tableContainer, style && { ...style }]}
      >
        <Table style={styles.table}>
          {/* header */}
          <TableWrapper style={[styles.tableHeader, headerStyle && { ...headerStyle }]}>
            {columns.map((column, index) => (
              <Cell
                key={`table_header_${index}`}
                style={[
                  styles.commonColumn,
                  styles.headerColumn,
                  cellStyle,
                  column.width && { width: typeof column.width === 'string' ? column.width : column.width + 30 }
                ]}
                textStyle={[styles.commonColumnText, styles.headerColumnText]}
                data={HeadCell(column)}
              />
            ))}
          </TableWrapper>
          {/* body */}
          <TableWrapper style={styles.tableBody}>
            {/* 汇总数据列表 */}
            {dataSummary.map((data, dataIndex) => (
              <TableWrapper style={[styles.tableRow, styles.tableSummaryRow]} key={`table_summary_row_${dataIndex}`}>
                {columns.map((column, columnIndex) => (
                  <Cell
                    key={`table_summary_cell_${dataIndex}_${columnIndex}`}
                    style={[
                      styles.bodySummaryColumn,
                      cellStyle,
                      column.width && { width: typeof column.width === 'string' ? column.width : column.width + 30 }
                    ]}
                    textStyle={[
                      styles.commonColumnText,
                      styles.bodySummaryColumnText,
                      column.style && { ...column.style }
                    ]}
                    data={column.render ? column.render(data[column.dataIndex], data) : data[column.dataIndex]}
                  />
                ))}
              </TableWrapper>
            ))}
            {/* 数据列表 */}
            <ScrollView
              nestedScrollEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              style={{ height: bodyHeight }}
            >
              {dataSource.map((data, dataIndex) => (
                <TouchableOpacity
                  key={`table_row_${dataIndex}`}
                  activeOpacity={1}
                  onPress={() => {
                    this.handleClickRow(data);
                  }}
                >
                  <TableWrapper style={styles.tableRow}>
                    {columns.map((column, columnIndex) => (
                      <Cell
                        key={`table_cell_${dataIndex}_${columnIndex}`}
                        style={[
                          styles.commonColumn,
                          styles.bodyColumn,
                          cellStyle,
                          column.width && {
                            width: typeof column.width === 'string' ? column.width : column.width + 30
                          },
                          column.style && { ...column.style }
                        ]}
                        textStyle={[
                          styles.commonColumnText,
                          textStyle && { ...textStyle },
                          column.textStyle && { ...column.textStyle }
                        ]}
                        data={renderCell(column, data, dataIndex)}
                      />
                    ))}
                  </TableWrapper>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TableWrapper>
        </Table>
      </ScrollView>
    );
  }
}

SimpleTable.propTypes = {
  style: ViewPropTypes.style,
  headerStyle: ViewPropTypes.style,
  cellStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  dataSummary: PropTypes.arrayOf(PropTypes.object),
  bodyHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  rowClick: PropTypes.func,

  // isRequired
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired
};

SimpleTable.defaultProps = {
  dataSummary: [],
  headerStyle: {},
  cellStyle: {},
  style: {},
  textStyle: {},
  bodyHeight: 'auto',
  rowClick: null
};

export default SimpleTable;
