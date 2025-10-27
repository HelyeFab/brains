# Terminal Security Documentation

## Overview
This document outlines the security measures implemented for the terminal widget in Brains.

## Security Threats Mitigated

### 1. **Arbitrary Code Execution**
- **Threat**: Malicious input could exploit shell vulnerabilities
- **Mitigation**: Input sanitization, type checking, length limits

### 2. **Resource Exhaustion (DoS)**
- **Threat**: Rapid input could overwhelm the terminal process
- **Mitigation**: Rate limiting (100 writes/second), terminal count limits (5 max)

### 3. **Buffer Overflow**
- **Threat**: Extremely long inputs could cause crashes
- **Mitigation**: 10,000 character limit per write

### 4. **Environment Variable Injection**
- **Threat**: Malicious environment variables could execute code
- **Mitigation**: Sanitize environment, remove dangerous vars (LD_PRELOAD, etc.)

### 5. **Dimension Attacks**
- **Threat**: Invalid resize dimensions could crash terminal
- **Mitigation**: Dimension validation (10-500 cols, 5-200 rows)

## Implemented Security Measures

### Input Validation (`terminal:in`)
```javascript
// Type checking
if (typeof data !== 'string') return null;

// Length limiting
if (data.length > MAX_INPUT_LENGTH) return null;

// Rate limiting
MAX_WRITES_PER_WINDOW = 100 per 1000ms
```

### Terminal Spawn Limits (`terminal:spawn`)
```javascript
MAX_TERMINALS_PER_SESSION = 5

// Dimension clamping
cols: Math.max(10, Math.min(500, cols))
rows: Math.max(5, Math.min(200, rows))

// Environment sanitization
Removes: LD_PRELOAD, LD_LIBRARY_PATH,
         DYLD_INSERT_LIBRARIES, DYLD_LIBRARY_PATH
```

### Resize Validation (`terminal:resize`)
```javascript
// Parameter validation
- Type checking for size object
- Numeric validation for cols/rows
- Range validation (10-500 cols, 5-200 rows)
```

### IPC Security
```javascript
// All handlers validate sender
if (!validateSender(event, windows.main)) {
  return unauthorizedError();
}
```

## Security Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_TERMINALS_PER_SESSION` | 5 | Prevent resource exhaustion |
| `MAX_INPUT_LENGTH` | 10,000 | Prevent buffer overflow |
| `RATE_LIMIT_WINDOW` | 1,000ms | Rate limiting window |
| `MAX_WRITES_PER_WINDOW` | 100 | Max writes per second |
| Terminal Cols Range | 10-500 | Prevent dimension attacks |
| Terminal Rows Range | 5-200 | Prevent dimension attacks |

## Logging

All security events are logged to console with `[Security]` prefix:

```javascript
// Examples:
[Security] Terminal rate limit exceeded for wcid 123
[Security] Terminal input too long: 15000 chars (max: 10000)
[Security] Terminal resize rejected: invalid dimensions 1000x1000
[Security] Removed dangerous env var: LD_PRELOAD
```

## Best Practices for Users

1. **Keep Electron Updated**: Security patches are regularly released
2. **Review Terminal Output**: Be cautious of unexpected behavior
3. **Limit Terminal Count**: Don't open more terminals than needed
4. **Monitor Resource Usage**: Use System Monitor widget to track CPU/memory

## Known Limitations

### node-pty Dependency
- **Issue**: Terminal requires native node-pty module
- **Impact**: Users must have build tools to compile native modules
- **Workaround**: electron-builder packages pre-compiled binaries
- **Future**: Consider WebAssembly-based terminal (see TERMINAL_ALTERNATIVES.md)

### Privilege Level
- **Warning**: All terminals run with same privileges as Electron app
- **Recommendation**: Never run Brains as root/administrator
- **Mitigation**: Environment sanitization prevents some escalation vectors

### Shell Access
- **Warning**: Terminal provides full shell access to local system
- **Security Note**: This is by design for a system administration tool
- **Best Practice**: Use in trusted environments only

## Security Audit Checklist

- [x] Input validation on all terminal IPC handlers
- [x] Rate limiting for terminal input
- [x] Terminal count limits enforced
- [x] Dimension validation for spawn and resize
- [x] Environment variable sanitization
- [x] Error handling with informative logging
- [x] Sender validation on all IPC handlers
- [x] Cleanup of tracking data on terminal destruction

## Future Enhancements

1. **Command Auditing**: Optional logging of all terminal commands
2. **Restricted Mode**: Limited shell with only allowed commands
3. **Sandboxing**: Explore WebContainer API for isolated environments
4. **Session Timeout**: Auto-close terminals after inactivity
5. **Permission System**: Require user confirmation for dangerous commands

## References

- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [xterm.js Security Guide](https://xtermjs.org/docs/guides/security/)
- [node-pty Security Considerations](https://github.com/microsoft/node-pty#security)

## Last Updated
2025-10-27

## Changelog
- **2025-10-27**: Initial security hardening implementation
  - Added input sanitization
  - Implemented rate limiting
  - Added terminal count limits
  - Environment variable sanitization
  - Dimension validation
