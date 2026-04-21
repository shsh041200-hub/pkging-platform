export function register() {
  if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
    const origMeasure = performance.measure.bind(performance)
    performance.measure = function (
      measureName: string,
      startOrMeasureOptions?: string | PerformanceMeasureOptions,
      endMark?: string,
    ): PerformanceMeasure {
      try {
        return origMeasure(measureName, startOrMeasureOptions as string, endMark as string)
      } catch {
        return {
          name: measureName,
          entryType: 'measure',
          startTime: 0,
          duration: 0,
          detail: null,
          toJSON() {
            return { name: measureName, entryType: 'measure', startTime: 0, duration: 0 }
          },
        } as PerformanceMeasure
      }
    }
  }
}
