/* Table状态管理 */

const TableStore = function (table, initialState = {}) {
  if (!table) {
    throw new Error('Table is required.');
  }

  this.table = table;
  this.states = {
    _columns: [],
    originColumns: [],
    columns: [],
    leafColumns: [],
    isComplex: false,
    data: null,
  };

  // 属性拷贝
  for (let prop in initialState) {
    if (initialState.hasOwnProperty(prop) && this.states.hasOwnProperty(prop)) {
      this.states[prop] = initialState[prop];
    }
  }
};

const doFlattenColumns = (columns) => {
  const result = [];
  columns.forEach((column) => {
    // .....
    result.push(column);
  });
  return result;
};

// 重新规划布局
TableStore.prototype.scheduleLayout = function (updateColumns) {
  if (updateColumns) {
    this.updateColumns();
  }
  this.table.debouncedUpdateLayout();
};

TableStore.prototype.updateColumns = function () {
  const states = this.states;
  const _columns = states._columns || [];

  const notFixedColumns = _columns.filter(column => !column.fixed);
  states.originColumns = [].concat(notFixedColumns);

  const leafColumns = doFlattenColumns(notFixedColumns);

  states.leafColumns = leafColumns.length;

  states.columns = [].concat(leafColumns);
  states.isComplex = false;
};

TableStore.prototype.mutations = {
  // table.vue watch.data 调用
  // table.vue watch.data 调用
  setData(states, data) {
    // ......
    states._data = data;
    states.data = data;
    // ......
  },

  insertColumn(states, column, index, parent) {
    let array = states._columns;
    // ......

    if (typeof index !== 'undefined') {
      // 在index的位置插入column
      array.splice(index, 0, column);
    } else {
      array.push(column);
    }

    // .....
  },

  removeColumn(states, column, parent) {
    let array = states._columns;
    if (parent) {
      array = parent.children;
      if (!array) array = parent.children = [];
    }
    if (array) {
      array.splice(array.indexOf(column), 1);
    }

    if (this.table.$ready) {
      this.updateColumns(); // hack for dynamics remove column
      this.scheduleLayout();
    }
  }
};
TableStore.prototype.commit = function commit(name, ...args) {
  const mutations = this.mutations;
  if (mutations[name]) {
    mutations[name].apply(this, [this.states].concat(args));
  } else {
    throw new Error(`Action not found: ${name}`);
  }
};

export default TableStore;
