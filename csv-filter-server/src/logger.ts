const LOG_ENABLED = false;

export function logDebug(label: string, value?: any) {
  if (!LOG_ENABLED) return;
  if (value !== undefined) {
    console.log(`👉 ${label}:`, value);
  } else {
    console.log(`👉 ${label}`);
  }
}
