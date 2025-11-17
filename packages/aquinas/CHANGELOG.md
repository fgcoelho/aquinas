# aquinas

### 0.0.6 (2025/11/16)

- refactor: simplify find method to return only matching references

### 0.0.5 (2025/10/22)

- fix: patch 'dock.get' missing typing overload
- refactor: rename 'dock.override' to 'dock.update'
- refactor: rename 'dock.register' to 'dock.add'
- feat: add find() and get([]) to dock

## 0.0.4 (2025/10/18)

### Patch Changes

- refactor: internal IoC container from 'inversifyjs' to '@owja/ioc' for smaller dependency chain and bundle
- refactor: rename 'dock.overwrite' to 'dock.override'
- refactor: improve 'dock.override' usability by requiring two params (reference, injectableOrImplementation)
- feat: add 'cloneDock' method
- feat: add 'dock.delete' method

## 0.0.3

### Patch Changes