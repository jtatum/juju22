interface StoreOptions {
  name: string
  cwd?: string
  fileExtension?: string
  schema?: Record<string, { default?: unknown }>
}

export default class Store<T extends Record<string, unknown>> {
  private readonly data = new Map<keyof T, T[keyof T]>()

  constructor(private readonly options: StoreOptions) {
    const { schema } = options
    if (!schema) return

    for (const [key, value] of Object.entries(schema)) {
      if (Object.prototype.hasOwnProperty.call(value, 'default')) {
        this.data.set(key as keyof T, value.default as T[keyof T])
      }
    }
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.data.get(key)
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.data.set(key, value)
  }

  delete(key: keyof T) {
    this.data.delete(key)
  }

  clear() {
    this.data.clear()
  }

  all(): Record<string, T[keyof T]> {
    return Object.fromEntries(this.data.entries()) as Record<string, T[keyof T]>
  }
}
