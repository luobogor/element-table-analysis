# Element UI table组件源码分析
本文章从如下图所示的最基本的table入手，分析table组件源代码。本人已经对table组件原来的源码进行削减，源码点击这里下载。下面文章只截图重要的代码片段进行讲解，推荐下载代码把项目运行起来，跟着文章的思路阅读。

![](https://ws3.sinaimg.cn/large/006tNc79gy1ftkowaly1ij30lt079aaq.jpg)

## 思路
````html
<template>
  <div class="el-table">
    <!-- 隐藏列: slot里容纳table-column -->
    <div class="hidden-columns" ref="hiddenColumns">
      <slot></slot>
    </div>

    <div class="el-table__header-wrapper"
         ref="headerWrapper">
      <table-header ref="tableHeader"
                    :store="store">
      </table-header>
    </div>

    <div class="el-table__body-wrapper"
         ref="bodyWrapper">
      <table-body :context="context"
                  :store="store">                  
      </table-body>
    </div>
  </div>
</template>
````

table、table-header、table-body、table-column之间通过table-store进行状态管理。table-header、table-body对table-store数据进行监听，每当table改变table-store数据时触发table-header、table-body重新渲染。

table-column为列数据column绑定相应的renderCell函数，供table-body渲染时使用。table-column这个组件自身不做任何渲染。所以会看到模板将其隐藏。还有就是table-header、table-body通过render函数进行渲染。

## 初始化顺序
![image](https://ws3.sinaimg.cn/large/006tNc79gy1ftjm8s7o5uj30k307kmxz.jpg)

## table
1. 初始化store

	````
	data() {
	  const store = new TableStore(this);
	  return {
	    store,
	  };
	}
	````

2. 将store共享给table-header、table-body

	````html
	    <div class="el-table__header-wrapper"
	         ref="headerWrapper">
	      <table-header :store="store"></table-header>
	    </div>
	
	    <div class="el-table__body-wrapper"
	         ref="bodyWrapper">
	      <table-body :store="store"></table-body>
	    </div>
	```` 

3. 将数据存储到store，供table-body获取data将其渲染

	````
	watch: {
	    data: {
	      immediate: true,
	      handler(value) {
	        // 供 table-body computed.data 使用 
	        this.store.commit('setData', value);
	        // ......
	      }
	    },
	},
	````

4. 设置tableId

	````
	created() {
	      //.....
	      this.tableId = `el-table_${tableIdSeed}`;
	      //.....
	  }
	````

5. 调用 updateColumns 触发 table-header、table-body 二次render更新,标记mounted完成
	
	````
	mounted() {
	    // .....
	    this.store.updateColumns();
	    // .....
	    this.$ready = true;
	}     
	````

## table-column
1. 生成column，并为column绑定`renderCell函数`供table-body使用
	
	````js
	created(){
	      // .........
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
	      // .........
	      
	      // 提table-body使用， table-body.js line 69
	      column.renderCell = function (createElement, data) {
	        if (_self.$scopedSlots.default) {
	          renderCell = () => _self.$scopedSlots.default(data);
	          //<template slot-scope="{row}">
	          //<span>{{row.frequentlyUsed | formatBoolean}}</span>
	          //</template>
	        }
	  
	        if (!renderCell) {// table-header不渲染index列的走这里，
	          /*<div className="cell">王小虎</div>*/
	          renderCell = DEFAULT_RENDER_CELL;
	        }
	  
	        //  <ElTableColumn
	        //      type="index"
	        //      width="50"/>
	        return <div className="cell">{renderCell(createElement, data)}</div>;
	      };
	  
	}
	````

2. 给store.state._columns数组填充数据

  ````js
  mounted() {
      // ...... 
      owner.store.commit('insertColumn', this.columnConfig, columnIndex, this.isSubColumn ? parent.columnConfig : null);
  }
  ````

## table-store
table-store有两个很重要的属性\_columns、data，\_columns保存列的相关信息，data则保存开发者传入的表格数据。还有两个重要的函数insertColumn与updateColumns。


1. insertColumn为_columns填充数据

	````js
	TableStore.prototype.mutations = {
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
	}
	````

2. updateColumns 对_columns进行过滤得到columns

	````js
	TableStore.prototype.updateColumns = function() {
	  const states = this.states;
	  const _columns = states._columns || [];
	  
	  const notFixedColumns = _columns.filter(column => !column.fixed);
	  // .....
	  const leafColumns = doFlattenColumns(notFixedColumns);
	  // .....
	  
	  states.columns = [].concat(leafColumns);
	  // ....
	}
	````

## table-header、table-body
table-header、table-body都拥有以下属性

````
props: {
    store: {
      required: true
    },
}

computed: {
    columns() {
      return this.store.states.columns;
    },
},

render(){
    // 渲染columns的数据
}
````

这两个组件的工作原理是监听columns数据变化以触发render渲染。在table组件的mounted阶段会调用 updateColumns 更新 columns，从而触发 table-header、table-body 重新渲染。

另外table-body还会监听data变化，触发render。例如当组件加载后发送请求，待请求响应赋值data，重新渲染table-body。

````
  computed: {
    data() {
      // table.vue watch.data 中 调用 setData 在store 中存储 data
      return this.store.states.data;
    },
  },
````

