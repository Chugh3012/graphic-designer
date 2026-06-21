import * as migration_20260621_221907_initial from './20260621_221907_initial';

export const migrations = [
  {
    up: migration_20260621_221907_initial.up,
    down: migration_20260621_221907_initial.down,
    name: '20260621_221907_initial'
  },
];
