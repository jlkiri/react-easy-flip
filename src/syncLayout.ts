import { useLayoutEffect } from './useLayoutEffect'

type Callback = () => void

type LayoutStep = 'prewrite' | 'read' | 'render'

type CallbackLists = {
  prewrite: Callback[]
  read: Callback[]
  render: Callback[]
}

const jobs: CallbackLists = {
  prewrite: [],
  read: [],
  render: []
}

const flushCallbackList = (jobs: Callback[]) => {
  for (const job of jobs) {
    job()
  }

  jobs.length = 0
}

const flushAllJobs = () => {
  flushCallbackList(jobs.prewrite)
  flushCallbackList(jobs.read)
  flushCallbackList(jobs.render)
}

const registerSyncCallback = (stepName: LayoutStep) => (
  callback?: Callback
) => {
  if (!callback) return

  jobs[stepName].push(callback)
}

export const syncLayout = {
  prewrite: registerSyncCallback('prewrite'),
  read: registerSyncCallback('read'),
  render: registerSyncCallback('render'),
  flush: flushAllJobs
}

export function useSyncLayout() {
  return useLayoutEffect(flushAllJobs)
}
