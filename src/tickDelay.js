let lastTick = -1;

export function onTick(tick) {
  lastTick = tick;
}

export default { onTick };
