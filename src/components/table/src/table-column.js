import objectAssign from 'element-ui/src/utils/merge';
import { getPropByPath } from 'element-ui/src/utils/util';

let columnIdSeed = 1;

const defaults = {
  default: {
    order: ''
  },
  index: {
    width: 48,
    minWidth: 48,
    realWidth: 48,
    order: ''
  }
};

const forced = {
  index: {
    //<ElTableColumn
    //  type="index"
    // width="50"/>
    renderHeader: function (h, { column }) {
      return column.label || '#';
    },
    renderCell: function (h, { $index, column }) {
      let i = $index + 1;
      const index = column.index;

      if (typeof index === 'number') {
        i = $index + index;
      } else if (typeof index === 'function') {
        i = index($index);
      }

      return <div>{i}</div>;
    },
    sortable: false
  },
};

const DEFAULT_RENDER_CELL = function (h, { row, column, $index }) {
  const property = column.property;
  const value = property && getPropByPath(row, property).v;
  if (column && column.formatter) {
    return column.formatter(row, column, value, $index);
  }
  return value;
};

const parseWidth = (width) => {
  if (width !== undefined) {
    width = parseInt(width, 10);
    if (isNaN(width)) {
      width = null;
    }
  }
  return width;
};

const getDefaultColumn = function (type, options) {
  const column = {};

  objectAssign(column, defaults[type || 'default']);

  for (let name in options) {
    if (options.hasOwnProperty(name)) {
      const value = options[name];
      if (typeof value !== 'undefined') {
        column[name] = value;
      }
    }
  }

  if (!column.minWidth) {
    column.minWidth = 80;
  }

  column.realWidth = column.width === undefined ? column.minWidth : column.width;

  return column;
};

export default {
  name: 'ElTableColumn',

  props: {
    type: {
      type: String,
      default: 'default',
    },
    label: String,
    prop: String,
    width: {},
    formatter: Function,
    context: {},
    index: [Number, Function], // 用于指定列位置
  },

  data() {
    return {
      isSubColumn: false,
      columns: [],
    };
  },

  watch: {
    label(newVal) {
      if (this.columnConfig) {
        this.columnConfig.label = newVal;
      }
    },

    prop(newVal) {
      if (this.columnConfig) {
        this.columnConfig.property = newVal;
      }
    },


    width(newVal) {
      if (this.columnConfig) {
        this.columnConfig.width = parseWidth(newVal);
        this.owner.store.scheduleLayout();
      }
    },
  },

  computed: {
    owner() {// 寻找拥有tableId的外层组件
      let parent = this.$parent;
      while (parent && !parent.tableId) {// 见table.vue line 454，为tableId赋值
        parent = parent.$parent;
      }
      return parent;
    },
    columnOrTableParent() {// 寻找拥有tableId 或 columnId的外层组件
      let parent = this.$parent;
      while (parent && !parent.tableId && !parent.columnId) {
        parent = parent.$parent;
      }
      return parent;
    },
  },

  beforeCreate() {
    this.row = {};
    this.column = {};
    this.$index = 0;
  },

  created() {
    console.log('table-column created');

    this.customRender = this.$options.render;// 暂时未清楚customRender在哪里使用
    this.$options.render = createElement => createElement('div', this.$slots.default);

    let parent = this.columnOrTableParent;
    let owner = this.owner;
    this.isSubColumn = owner !== parent;
    this.columnId = (parent.tableId || parent.columnId) + '_column_' + columnIdSeed++;

    let type = this.type;
    const width = parseWidth(this.width);

    let column = getDefaultColumn(type, {
      id: this.columnId,
      columnKey: this.columnKey,
      label: this.label,
      property: this.prop || this.property,// 旧版element ui为property，现在的版本是prop
      type, // selection、index、expand
      renderCell: null,
      renderHeader: this.renderHeader, // 提供给table-column， table-column.js line 112
      width,
      formatter: this.formatter,
      context: this.context,
      index: this.index,
    });

    objectAssign(column, forced[type] || {});

    this.columnConfig = column;

    let renderCell = column.renderCell;
    let _self = this;

    // 提供给table-body， table-body.js line 69
    column.renderCell = function (createElement, data) {
      if (_self.$scopedSlots.default) {
        renderCell = () => _self.$scopedSlots.default(data);
        //<template slot-scope="{row}">
        //<span>{{row.frequentlyUsed | formatBoolean}}</span>
        //</template>
      }

      if (!renderCell) {// table-header不渲染index的栏走这里，
        /*<div className="cell">王小虎</div>*/
        renderCell = DEFAULT_RENDER_CELL;
      }

      //<ElTableColumn
      //  type="index"
      //  width="50"/>
      return <div className="cell">{renderCell(createElement, data)}</div>;
    };
  },

  mounted() {
    console.log('table-column mounted');

    const owner = this.owner;
    const parent = this.columnOrTableParent;
    let columnIndex;

    if (!this.isSubColumn) {
      // 如果不是嵌套列，序号是table-column标签顺序
      columnIndex = [].indexOf.call(parent.$refs.hiddenColumns.children, this.$el);
    } else {
      // 否则是在父级列的位置
      columnIndex = [].indexOf.call(parent.$el.children, this.$el);
    }
    // 向state._columns添加当前列
    owner.store.commit('insertColumn', this.columnConfig, columnIndex, this.isSubColumn ? parent.columnConfig : null);
  },

  destroyed() {
    if (!this.$parent) return;
    const parent = this.$parent;
    this.owner.store.commit('removeColumn', this.columnConfig, this.isSubColumn ? parent.columnConfig : null);
  },
};
