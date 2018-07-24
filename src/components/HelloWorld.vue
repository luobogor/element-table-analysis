<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <ElTable
      :data="tableData"
      style="width: 100%">
      <ElTableColumn
        type="index"
        width="50"/>
      <ElTableColumn
        prop="date"
        label="日期"
        width="180"
        :formatter="dateFormatter"/>
      <ElTableColumn
        prop="name"
        label="姓名"
        width="180"/>
      <ElTableColumn
        prop="address"
        label="地址"/>

      <ElTableColumn
        prop="address"
        label="地址">
        <template slot-scope="{ row }">
          <span>{{row.enable ? '是' : '否'}}</span>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      tableData: [{
        date: new Date(),
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄',
        enable: true,
      }, {
        date: new Date(),
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄',
        enable: false,
      }, {
        date: new Date(),
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄',
        enable: true,
      }, {
        date: new Date(),
        name: '王小虎',
        address: '上海市普陀区金沙江路 1516 弄',
        enable: true,
      }]
    };
  },

  methods: {
    dateFormatter(row, column, value, index) {
      return this.formatDate(row.date);
    },

    formatDate(date) {
      const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      const day = date.getDate();
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }
  },

  mounted() {
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  h1, h2 {
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #42b983;
  }
</style>
