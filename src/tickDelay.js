let _totalTick = 0;
let _enabled = false;
let _delay = 6;
const _queue = []; // { fireTick, fn }[]

export function onTick() {
  _totalTick++;
  for (let i = _queue.length - 1; i >= 0; i--) {
    if (_totalTick >= _queue[i].fireTick) {
      _queue[i].fn();
      _queue.splice(i, 1);
    }
  }
}

// Returns true if the attack was queued (caller should NOT fire immediately).
// Returns false if delay is off (caller fires normally).
export function queue(fn) {
  if (!_enabled) return false;
  const fireTick = _totalTick + _delay;
  _queue.push({ fireTick, fn });
  return true;
}

export function setEnabled(v) { _enabled = v; }
export function setDelay(v)   { _delay = v; }
export function getEnabled()  { return _enabled; }
export function getDelay()    { return _delay; }
export function reset()       { _queue.length = 0; _totalTick = 0; }

export default { onTick, queue, setEnabled, setDelay, getEnabled, getDelay, reset };
