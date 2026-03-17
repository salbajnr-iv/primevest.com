export const logEvent = (payload: Record<string, unknown>): void => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), ...payload }));
};
