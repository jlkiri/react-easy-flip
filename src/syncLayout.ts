import { useLayoutEffect } from './useLayoutEffect'

type Callback = () => void

type LayoutStep = 'interrupt' | 'measure' | 'render'

type CallbackLists = {
  interrupt: Callback[]
  measure: Callback[]
  render: Callback[]
}

const jobs: CallbackLists = {
  interrupt: [],
  measure: [],
  render: []
}

const flushCallbackList = (jobs: Callback[]) => {
  for (const job of jobs) {
    job()
  }

  jobs.length = 0
}

const flushAllJobs = () => {
  flushCallbackList(jobs.interrupt)
  flushCallbackList(jobs.measure)
  flushCallbackList(jobs.render)
}

const registerSyncCallback = (stepName: LayoutStep) => (
  callback?: Callback
) => {
  if (!callback) return

  jobs[stepName].push(callback)
}

export const syncLayout = {
  interrupt: registerSyncCallback('interrupt'),
  measure: registerSyncCallback('measure'),
  render: registerSyncCallback('render'),
  flush: flushAllJobs,
  jobLength: () => [
    jobs.interrupt.length,
    jobs.measure.length,
    jobs.render.length
  ]
}

export function useSyncLayout() {
  console.debug('useSyncLayout')
  return useLayoutEffect(flushAllJobs)
}
