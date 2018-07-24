export default {
  name: 'ElTableBody',

  props: {
    store: {
      required: true
    },
    stripe: Boolean,
    context: {},
    fixed: String,
    highlight: Boolean,
  },

  data() {
    return {
      tooltipContent: '',
    };
  },

  computed: {
    table() {
      return this.$parent;
    },

    data() {
      // table.vue watch.data 中 调用 setData 在store 中存储 data
      return this.store.states.data;
    },

    columns() {
      return this.store.states.columns;
    },
  },

  render(createElement) {
    console.log('table-body render');

    const columnsHidden = this.columns.map((column, index) => this.isColumnHidden(index));
    return (
      <table
        class="el-table__body"
        cellspacing="0"
        cellpadding="0"
        border="0">
        <colgroup>
          {/*控制宽度与table-header的colgroup同步*/}
          {this._l(this.columns, column => <col name={column.id}/>)}
        </colgroup>
        <tbody>
        {
          this._l(this.data, (row, $index) =>
            [<tr style={this.rowStyle ? this.getRowStyle(row, $index) : null}
                 key={this.table.rowKey ? this.getKeyOfRow(row, $index) : $index}
                 class={[this.getRowClass(row, $index)]}>
              {
                this._l(this.columns, (column, cellIndex) => {
                  const { rowspan, colspan } = this.getSpan(row, column, $index, cellIndex);
                  if (!rowspan || !colspan) {
                    return '';
                  }

                  if (rowspan === 1 && colspan === 1) {
                    return (<td style={this.getCellStyle($index, cellIndex, row, column)}
                                class={this.getCellClass($index, cellIndex, row, column)}>
                      {
                        column.renderCell.call(
                          this._renderProxy,
                          createElement,
                          {
                            row,
                            column,
                            $index,
                            store: this.store,
                            _self: this.context || this.table.$vnode.context
                          },
                          columnsHidden[cellIndex]
                        )
                      }
                    </td>);
                  }

                  return (<td style={this.getCellStyle($index, cellIndex, row, column)}
                              class={this.getCellClass($index, cellIndex, row, column)}>
                    {
                      column.renderCell.call(
                        this._renderProxy,
                        h,
                        {
                          row,
                          column,
                          $index,
                          store: this.store,
                          _self: this.context || this.table.$vnode.context
                        },
                        columnsHidden[cellIndex]
                      )
                    }
                  </td>);
                })
              }
            </tr>],
          )
        }
        </tbody>
      </table>
    );
  },

  methods: {
    getRowStyle(row, rowIndex) {
      const rowStyle = this.table.rowStyle;
      if (typeof rowStyle === 'function') {
        return rowStyle.call(null, {
          row,
          rowIndex
        });
      }
      return rowStyle;
    },

    getRowClass(row, rowIndex) {
      const classes = 'el-table__row';
      // .......
      return classes;
    },

    getCellStyle(rowIndex, columnIndex, row, column) {
      return ''
    },

    getCellClass(rowIndex, columnIndex, row, column) {
      return '';
    },

    getSpan(row, column, rowIndex, columnIndex) {
      let rowspan = 1;
      let colspan = 1;

      return {
        rowspan,
        colspan
      };
    },

    isColumnHidden() {
      return false;
    },
  },

  created() {
    console.log('table-body created');
  },
  mounted() {
    console.log('table-body mounted');
  }
};
