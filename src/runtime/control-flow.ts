export function ensureLoopWithinLimit(nextStep: number, maxSteps: number) {
  if (nextStep > maxSteps) {
    throw new Error(`while loop exceeded max steps (${maxSteps})`);
  }
}
