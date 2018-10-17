import { createSelector } from 'redux-bundler'

/*
# Notify
- show error when ipfs goes away.
- show ok when it comes back.
- dismiss the the ok after 3s
*/

const defaultState = {
  show: false,
  error: false,
  eventId: null
}

const notify = {
  name: 'notify',

  reducer: (state = defaultState, action) => {
    if (action.type === 'NOTIFY_DISMISSED') {
      return { ...state, show: false }
    }

    if (action.type === 'STATS_FETCH_FAILED') {
      return {
        ...state,
        show: true,
        error: true,
        eventId: action.type
      }
    }

    if (action.type.match(/^FILES_\w+_FAILED$/)) {
      return {
        ...state,
        show: true,
        error: true,
        eventId: 'FILES_EVENT_FAILED'
      }
    }

    if (action.type === 'STATS_FETCH_FINISHED' && state.eventId === 'STATS_FETCH_FAILED') {
      return {
        ...state,
        error: false,
        eventId: 'STATS_FETCH_FINISHED',
        lastSuccess: Date.now()
      }
    }

    return state
  },

  selectNotify: state => state.notify,

  selectNotifyI18nKey: createSelector(
    'selectNotify',
    'selectIpfsProvider',
    (notify, provider) => {
      const { eventId } = notify

      if (eventId === 'STATS_FETCH_FAILED') {
        return provider === 'window.ipfs' ? 'windowIpfsRequestFailed' : 'ipfsApiRequestFailed'
      }

      if (eventId === 'FILES_EVENT_FAILED') {
        return 'filesEventFailed'
      }

      if (eventId === 'STATS_FETCH_FINISHED') {
        return 'ipfsIsBack'
      }

      return eventId
    }
  ),

  doNotifyDismiss: () => ({ dispatch }) => dispatch({ type: 'NOTIFY_DISMISSED' }),

  // Dismiss the "all ok" message after 3 seconds
  reactNotifyOkDismiss: createSelector(
    'selectAppTime',
    'selectNotify',
    (appTime, notify) => {
      if (notify.eventId === 'STATS_FETCH_FINISHED' && notify.show && appTime - notify.lastSuccess > 3000) {
        return { type: 'NOTIFY_DISMISSED' }
      }
    }
  )
}

export default notify
