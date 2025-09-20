# Juju22 Development Guidelines

## Logging

### Source Code
```typescript
import { createLogger, type Logger } from './logger'

export class MyService {
  private readonly logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger ?? createLogger('MyService')
  }
}
```

### Tests
```typescript
import type { Logger } from '@main/core/logger'

const createMockLogger = (): Logger =>
  ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  } as unknown as Logger)

// Use it:
const service = new MyService(createMockLogger())
```

**Never use `createLogger` in tests - it writes to disk and will fail.**

## Import Paths

Use aliases in tests:
- ✅ `import { MyService } from '@main/core/my-service'`
- ❌ `import { MyService } from '../../src/main/core/my-service'`

## Before Committing

```bash
npm run test:unit  # Must pass
npm run lint       # Zero warnings
npx tsc --noEmit   # Type check must pass
```