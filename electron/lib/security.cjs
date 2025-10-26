/**
 * Security utilities for validating IPC requests
 */

/**
 * Validates that the IPC sender is from an authorized window
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @param {BrowserWindow | null} authorizedWindow - The window allowed to send this request
 * @returns {boolean} True if sender is authorized, false otherwise
 */
function validateSender(event, authorizedWindow) {
  if (!authorizedWindow || authorizedWindow.isDestroyed()) {
    return false;
  }

  // Check if sender ID matches the authorized window's webContents ID
  return event.sender.id === authorizedWindow.webContents.id;
}

/**
 * Validates that the sender is from any of the provided windows
 * @param {Electron.IpcMainInvokeEvent} event - The IPC event
 * @param {BrowserWindow[]} authorizedWindows - Array of windows allowed to send this request
 * @returns {boolean} True if sender is from any authorized window
 */
function validateSenderFromWindows(event, authorizedWindows) {
  return authorizedWindows.some((win) => validateSender(event, win));
}

/**
 * Creates a standardized error response for unauthorized requests
 * @param {string} operation - The operation that was attempted
 * @returns {object} Error response object
 */
function unauthorizedError(operation) {
  return {
    ok: false,
    error: `Unauthorized: ${operation} request from unrecognized sender`,
  };
}

/**
 * Validates file path is within allowed directories (security check for file operations)
 * @param {string} filePath - The file path to validate
 * @param {string} allowedBasePath - The base path that file must be within
 * @returns {boolean} True if path is within allowed directory
 */
function validateFilePath(filePath, allowedBasePath) {
  const path = require('path');
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(allowedBasePath);

  return resolvedPath.startsWith(resolvedBase);
}

module.exports = {
  validateSender,
  validateSenderFromWindows,
  unauthorizedError,
  validateFilePath,
};
