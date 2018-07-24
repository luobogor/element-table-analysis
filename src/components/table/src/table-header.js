import LayoutObserver from './layout-observer';
import TableStore from "./table-store";

const getAllColumns = (columns) => {
  const result = [];
  columns.forEach(column => {
    if (column.children) {
      result.push(column);
      result.push.apply(result, getAllColumns(column.children));
    } else {
      result.push(column);
    }
  });

  return result;
};

const convertToRows = (originColumns) => {
  let maxLevel = 1;
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1;
      if (maxLevel < column.level) {
        maxLevel = column.level;
      }
    }
    if (column.children) {
      let colSpan = 0;
      column.children.forEach((subColumn) => {
        traverse(subColumn, column);
        colSpan += subColumn.colSpan;
      });
      column.colSpan = colSpan;
    } else {
      column.colSpan = 1;
    }
  };

  originColumns.forEach((column) => {
    column.level = 1;
    traverse(column);
  });

  const rows = [];
  for (let i = 0; i < maxLevel; i++) {
    rows.push([]);
  }

  const allColumns = getAllColumns(originColumns);

  allColumns.forEach((column) => {
    if (!column.children) {
      column.rowSpan = maxLevel - column.level + 1;
    } else {
      column.rowSpan = 1;
    }
    rows[column.level - 1].push(column);
  });

  return rows;
};

export default {
  name: 'ElTableHeader',

  mixin: [LayoutObserver],

  props: {
    store: {
      required: true
    },
    border: Boolean,
  },

  data() {
    return {
      draggingColumn: null,
      dragging: false,
      dragState: {}
    };
  },

  computed: {
    table() {
      return this.$parent;
    },
    columns() {
      // table-store.js 的 TableStore.prototype.updateColumns 会更新 columns，以下情况会调用updateColumns

      // 在table.vue mounted阶段会更新columns
      // 如果当表格渲染完成再动态添加列,table-column 在 mounted阶段也会更新columns
      return this.store.states.columns;
    },
  },

  render(createElement) {
    console.log('table-header render');

    // originColumns的更新与 computed.columns一样
    const originColumns = this.store.states.originColumns;
    // 非多级表头情况下，columnRows是一个嵌套数组 [[col1,col2,col3,...]]
    const columnRows = convertToRows(originColumns, this.columns);
    // 是否拥有多级表头
    const isGroup = columnRows.length > 1;
    if (isGroup) this.$parent.isGroup = true;
    return (
      <table class="el-table__header"
             cellspacing="0"
             cellpadding="0"
             border="0">
        <colgroup>
          {/*<col name="el-table_21_column_90" width="180">*/}
          {/* column.id在table-column line237赋值*/}
          {
            this._l(this.columns, column => <col name={ column.id } />)
          }
        </colgroup>
        <thead>
        {
          this._l(columnRows, (columns, rowIndex) =>
            <tr
              style={this.getHeaderRowStyle(rowIndex)}
              className={this.getHeaderRowClass(rowIndex)}
            >
              {
                this._l(columns, (column, cellIndex) =>
                  <th colspan={column.colSpan}
                      rowspan={column.rowSpan}
                      style={this.getHeaderCellStyle(rowIndex, cellIndex, columns, column)}
                      class={this.getHeaderCellClass(rowIndex, cellIndex, columns, column)}>
                    <div
                      className={['cell', column.filteredValue && column.filteredValue.length > 0 ? 'highlight' : '', column.labelClassName]}>
                      {/*先渲染table-column，而column.renderHeader是在table-column中绑定的*/}
                      {
                        column.renderHeader
                          ? column.renderHeader.call(this._renderProxy, createElement, {
                            column,
                            $index: cellIndex,
                            store: this.store,
                            _self: this.$parent.$vnode.context
                          })
                          : column.label
                      }
                    </div>
                  </th>)
              }
            </tr>)
        }
        </thead>
      </table>);
  },

  methods: {
    getHeaderCellStyle(rowIndex, columnIndex, row, column) {
      return '';
    },

    getHeaderCellClass(rowIndex, columnIndex, row, column) {
      return '';
    },
    getHeaderRowStyle(rowIndex) {
      return '';
    },
    getHeaderRowClass(rowIndex) {
      return '';
    },
  },

  created() {
    console.log('table-header created');
  },
  mounted() {
    console.log('table-header mounted');
  }
}
