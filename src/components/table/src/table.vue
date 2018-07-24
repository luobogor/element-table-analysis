<template>
  <div class="el-table">
    <!-- 隐藏列: slot里容纳table-column -->
    <div class="hidden-columns" ref="hiddenColumns">
      <slot></slot>
    </div>

    <div class="el-table__header-wrapper"
         ref="headerWrapper">
      <table-header ref="tableHeader"
                    :store="store"></table-header>
    </div>

    <div class="el-table__body-wrapper"
         ref="bodyWrapper">
      <table-body :context="context"
                  :store="store"
                  :stripe="stripe"></table-body>
    </div>
  </div>
</template>

<script>
// 控制操作频度的组件
import debounce from 'throttle-debounce/debounce';
// 表格状态管理工具
import TableStore from './table-store';
import TableBody from './table-body';
import TableHeader from './table-header';

let tableIdSeed = 1;

export default {
  name: 'ElTable',

  props: {
    data: { type: Array, default: () => [] },
    stripe: Boolean,// 条纹
    border: Boolean,
    context: {},
  },

  data() {
    const store = new TableStore(this);
    return {
      store,
    };
  },

  components: {
    TableHeader,
    TableBody,
  },

  watch: {
    data: {
      immediate: true,
      handler(value) {
        // 供 table-body computed.data 使用
        this.store.commit('setData', value);
        if (this.$ready) {
          this.$nextTick(() => {
            this.doLayout();
          });
        }
      }
    },
  },

  methods: {
    doLayout() {
    },
  },

  created() {
    console.log('table created');
    this.tableId = `el-table_${tableIdSeed}`;
    tableIdSeed += 1;
    // 提供给table-store的TableStore.prototype.scheduleLayout使用
    this.debouncedUpdateLayout = debounce(50, () => this.doLayout());
  },

  mounted() {
    // 更新columns与originColumns从而触发table-header、table-body更新
    console.log('table mounted ，调用updateColumns触发 table-header、table-body更新');
    this.store.updateColumns();
    this.doLayout();
    // 标记table组件已经mounted，table-store.js的insertColumn也以此来判断需不需调用updateColumn
    this.$ready = true;
  },
};
</script>
