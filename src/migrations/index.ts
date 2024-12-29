import * as migration_20241229_103840_initial from './20241229_103840_initial';

export const migrations = [
  {
    up: migration_20241229_103840_initial.up,
    down: migration_20241229_103840_initial.down,
    name: '20241229_103840_initial'
  },
];
