# event-kit-decorator

> Create `event-kit`

## Install

```
npm i -S event-kit-decorator
```

## Usage

From `examples/index.js`:

```js
import {handler, observable} from 'event-kit-decorator'
import {Observable} from 'rxjs/Observable'
import {Emitter} from 'event-kit'

export default class Alerter {
  @observable alert$: Observable

  constructor() {
    this.emitter = new Emitter()
  }
  
  @handler
  onAlert() {}

  async start() {
    setInterval(() => {
      this.emitter.emit('alert', {message: 'hey!'})
    }, 1000)
  }
}

const alerter = new Alerter()

// Callback.
alerter.onAlert(alert => console.log(alert))

// rxjs Observable.
const subscription = alert.alert$.subscribe(
  alert => console.log(alert),
  err => console.error(err),
)
subscripton.dispose()
```

## License

MIT © Vaughan Rouesnel
