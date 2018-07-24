/* eslint-disable no-underscore-dangle */
export default {
  computed: {
    tableLayout() {
      let layout = this.layout;
      // this.table 来自父组件
      if (!layout && this.table) {
        layout = this.table.layout;
      }
      if (!layout) {
        throw new Error('Can not find table layout');
      }
      return layout;
    },
  },

  methods: {// TODO
    onColumnsChange() {},
    onScrollableChange() {},
  },

  created() {
    this.tableLayout.addObserver(this);
  },

  mounted() {
    this.onColumnsChange();
    this.onScrollableChange();
  },

  updated() {
    if (this.__updated__) return;
    this.onColumnsChange(this.tableLayout);
    this.onScrollableChange(this.tableLayout);
    this.__updated__ = true;
  },

  destroyed() {
    this.tableLayout.removeObserver(this);
  },
};
