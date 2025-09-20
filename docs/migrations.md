# Database Migrations Guide

This document explains how to create, run, and manage database migrations in Aidle.

## Overview

Aidle uses a versioned migration system to manage database schema changes. All schema modifications should be done through migrations to ensure:
- Consistent database state across all installations
- Reproducible upgrades and fresh installs
- Version control for database changes
- Rollback capability during development

## Migration Concepts

### What is a Migration?

A migration is a versioned script that modifies the database schema. Each migration has:
- A unique ID (e.g., `0001_initial_schema`)
- A descriptive name
- An `up()` method that applies changes
- An optional `down()` method for rollback (dev only)

### Migration State

Migrations can be in one of two states:
- **Pending**: Not yet applied to the database
- **Applied**: Successfully executed and recorded in `schema_migrations` table

## Creating a New Migration

### 1. Create the Migration File

Create a new TypeScript file in `src/main/core/migrations/migrations/` with the naming convention:
```
XXXX_descriptive_name.ts
```

Where `XXXX` is a zero-padded sequential number.

### 2. Implement the Migration

```typescript
import type Database from 'better-sqlite3'
import type { Migration } from '../types'

export const migration: Migration = {
  id: '0003_add_user_preferences',
  name: 'Add user preferences table',

  up(db: Database.Database) {
    db.exec(`
      CREATE TABLE user_preferences (
        user_id TEXT PRIMARY KEY,
        theme TEXT NOT NULL DEFAULT 'dark',
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `)
  },

  down(db: Database.Database) {
    db.exec('DROP TABLE IF EXISTS user_preferences')
  },
}
```

### 3. Register the Migration

Add your migration to the exports in `src/main/core/migrations/migrations/index.ts`:

```typescript
import { migration as migration0003 } from './0003_add_user_preferences'

export const allMigrations: Migration[] = [
  migration0001,
  migration0002,
  migration0003, // Add your new migration
]
```

## Running Migrations

### During Development

Migrations run automatically when the application starts. The bootstrap process will:
1. Initialize the migration runner
2. Check for pending migrations
3. Apply them in order
4. Emit events for UI feedback

### Using CLI Commands

```bash
# Preview pending and applied migrations
npm run migrate:plan

# Apply all pending migrations
npm run migrate:apply

# Rollback last migration (development only)
npm run migrate:rollback
```

## Best Practices

### DO:
- ✅ Keep migrations small and focused
- ✅ Use transactions (automatically handled by the runner)
- ✅ Test migrations on a copy of production data
- ✅ Include indexes in the same migration as table creation
- ✅ Use descriptive names for migrations
- ✅ Write idempotent migrations when possible
- ✅ Document complex migrations with comments

### DON'T:
- ❌ Modify existing migrations once deployed
- ❌ Use migrations for data seeding (except system defaults)
- ❌ Reference application code in migrations
- ❌ Create circular dependencies between migrations
- ❌ Skip migration numbers in the sequence

## Migration Conventions

### Naming
- Use lowercase with underscores
- Start with a 4-digit sequential number
- Be descriptive but concise
- Examples:
  - `0001_initial_schema`
  - `0002_add_user_auth`
  - `0003_create_audit_log`

### Schema Changes
- **Creating tables**: Include all columns, constraints, and indexes
- **Altering tables**: Use separate ALTER statements for clarity
- **Dropping tables**: Always use `DROP TABLE IF EXISTS`
- **Indexes**: Name them descriptively (e.g., `idx_users_email`)

### Data Migrations
- Only migrate essential system data
- Use prepared statements for data insertion
- Handle edge cases gracefully
- Log important operations

## Testing Migrations

### Unit Tests
Test your migration logic in isolation:

```typescript
it('should create preferences table', async () => {
  const db = new Database(':memory:')
  const runner = new MigrationRunner(db, eventBus)

  runner.registerMigration(migration0003)
  await runner.runPendingMigrations()

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  expect(tables).toContainEqual({ name: 'user_preferences' })
})
```

### Integration Tests
Test migrations with the full application context:

```typescript
it('should handle upgrade from v1 to v2', async () => {
  // Setup v1 database state
  // Run new migrations
  // Verify final state
})
```

## Troubleshooting

### Common Issues

**Migration fails to run:**
- Check for SQL syntax errors
- Verify table/column doesn't already exist
- Ensure proper transaction handling

**Application won't start:**
- Check migration logs in console
- Verify database file permissions
- Try running migrations manually with CLI

**Rollback fails:**
- Ensure `down()` method is implemented
- Check for foreign key constraints
- Verify data dependencies

### Debugging

Enable verbose logging:
```typescript
await runner.runPendingMigrations({ verbose: true })
```

Dry run to preview changes:
```typescript
await runner.runPendingMigrations({ dryRun: true })
```

## Migration Checklist

Before submitting a PR with migrations:

- [ ] Migration has unique sequential ID
- [ ] `up()` method is implemented
- [ ] `down()` method is implemented (if feasible)
- [ ] Migration is registered in index.ts
- [ ] SQL syntax is valid
- [ ] Tests are written and passing
- [ ] Migration runs on fresh database
- [ ] Migration runs on existing database
- [ ] No modifications to existing migrations
- [ ] Documentation updated if needed

## Advanced Topics

### Conditional Migrations

Sometimes you need to check conditions before applying changes:

```typescript
up(db: Database.Database) {
  const tableExists = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='old_table'"
  ).get()

  if (tableExists) {
    db.exec('ALTER TABLE old_table RENAME TO new_table')
  }
}
```

### Data Transformation

For complex data migrations:

```typescript
up(db: Database.Database) {
  // Create new structure
  db.exec('CREATE TABLE new_format (...)')

  // Migrate data
  const oldData = db.prepare('SELECT * FROM old_format').all()
  const insert = db.prepare('INSERT INTO new_format VALUES (...)')

  for (const row of oldData) {
    insert.run(transformData(row))
  }

  // Clean up
  db.exec('DROP TABLE old_format')
}
```

### Performance Considerations

For large datasets:
- Use batch operations
- Create indexes after data insertion
- Consider chunking large migrations
- Monitor memory usage

## Related Documentation

- [Storage Architecture](./design.md#data-storage)
- [Testing Guide](./testing.md)
- [Contributing Guidelines](./contributing.md)