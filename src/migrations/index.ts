import * as migration_20260621_182208_initial from './20260621_182208_initial';
import * as migration_20260621_184714_remove_legacy_project_fields from './20260621_184714_remove_legacy_project_fields';

export const migrations = [
  {
    up: migration_20260621_182208_initial.up,
    down: migration_20260621_182208_initial.down,
    name: '20260621_182208_initial',
  },
  {
    up: migration_20260621_184714_remove_legacy_project_fields.up,
    down: migration_20260621_184714_remove_legacy_project_fields.down,
    name: '20260621_184714_remove_legacy_project_fields'
  },
];
