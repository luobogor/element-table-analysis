import scrollbarWidth from 'element-ui/src/utils/scrollbar-width';
import Vue from 'vue';

class TableLayout {
  constructor(options) {
    this.observers = [];
    this.table = null;
    this.store = null;
    this.columns = null;
    this.showHeader = true;

    this.height = null;
    this.gutterWidth = scrollbarWidth();

    for (let name in options) {
      if (options.hasOwnProperty(name)) {
        this[name] = options[name];
      }
    }

    if (!this.table) {
      throw new Error('table is required for Table Layout');
    }
    if (!this.store) {
      throw new Error('store is required for Table Layout');
    }
  }

  setHeight(value, prop = 'height') {
    if (Vue.prototype.$isServer) return;
    this.updateElsHeight();
  }

  updateElsHeight() {
    this.notifyObservers('scrollable');
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(event) {
    const observers = this.observers;
    observers.forEach((observer) => {
      switch (event) {
        case 'columns':
          observer.onColumnsChange(this);
          break;
        case 'scrollable':
          observer.onScrollableChange(this);
          break;
        default:
          throw new Error(`Table Layout don't have event ${event}.`);
      }
    });
  }
}

export default TableLayout;
