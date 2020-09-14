import { BehaviorSubject } from 'rxjs';

class Events {
  constructor() {
    if (!Events.instance) {
      this._data = [];
      Events.instance = this;
    }

    this.myObservable = {};
    this.subscribes = {};

    this.unsubscribe = (event) => () => {
      if (this.subscribes[event]) {
        this.subscribes[event].unsubscribe();
      } else {
        // eslint-disable-next-line no-console
        console.error('No event Registered');
      }
    };

    return Events.instance;
  }

  publish(event, data) {
    this.initBehaviorSubject(event);
    this.myObservable[event].next(data);
  }

  initBehaviorSubject(event) {
    if (!this.myObservable[event]) {
      this.myObservable[event] = new BehaviorSubject();
    }
  }

  subscribe(event, getData) {
    try {
      this.initBehaviorSubject(event);
      this.subscribes[event] = this.myObservable[event]
        // .asObservable()
        .subscribe((data) => {
          if (data) {
            getData(data);
          }
        });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
    return this.unsubscribe(event);
  }
}

const instance = new Events();
Object.freeze(instance);

export default instance;
