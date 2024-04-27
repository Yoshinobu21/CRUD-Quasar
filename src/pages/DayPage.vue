<template>
  <div class="subcontent">
    <AddEventsModal v-model="addEvent" v-if="addEvent" :eventId="eventId" :eventDate="eventDate" :eventTimeStart="eventTimeStart" :eventTimeFinish="eventTimeFinish"></AddEventsModal>

    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />
    <div style="display: flex; justify-content: center; align-items: center; flex-wrap: nowrap;">
    </div>

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%; height: 400px;">
        <q-calendar-day ref="calendar" v-model="selectedDate" view="day" bordered :hour24-format="toggled"
          :locale="locale" time-clicks-clamped :selected-start-end-dates="startEndDates" :interval-minutes="15"
          :interval-count="96" :interval-height="40" animated transition-next="slide-left" transition-prev="slide-right"
          @change="onChange" @moved="onMoved" @click-date="onClickDate" @click-interval="onClickInterval"
          @click-head-intervals="onClickHeadIntervals" @click-head-day="onClickHeadDay"
          @mousedown-time="onMouseDownTime" @mouseup-time="onMouseUpTime" @mousemove-time="onMouseMoveTime">

          <template #head-day-event="{ scope: { timestamp } }">
            <div style="display: flex; justify-content: center; flex-wrap: wrap; padding: 2px;">
              <template v-for="events in eventsMap[timestamp.date]" :key="events._id">
                <q-badge v-if="!events.timeStart" :class="badgeClasses(events, 'header')"
                  :style="badgeStyles(events, 'header')"
                  style="width: 100%; cursor: pointer; height: 12px; font-size: 10px; margin: 1px;">
                  <div class="title q-calendar__ellipsis">
                    {{ events.title }}
                    <q-tooltip>{{ events.details }}</q-tooltip>
                  </div>
                </q-badge>
                <q-badge v-else :class="badgeClasses(events, 'header')" :style="badgeStyles(events, 'header')"
                  style="margin: 1px; width: 10px; max-width: 10px; height: 10px; max-height: 10px; cursor: pointer"
                  @click="scrollToEvent(events)">
                  <q-tooltip>{{ events.duration + ' - ' + events.details }}</q-tooltip>
                </q-badge>
              </template>
            </div>
          </template>

          <template #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight } }">
            <template v-for="events in getDayEvents(timestamp.date)" :key="events._id">
              <div v-if="events.timeStart !== undefined" class="my-event" :class="badgeClasses(events, 'body')"
                :style="badgeStyles(events, 'body', timeStartPos, timeDurationHeight)">
                <div class="title q-calendar__ellipsis">
                  {{ events.title }}
                  <q-tooltip>{{ 'das: ' + events.timeStart + ' até as: ' + events.timeFinish + ' - ' + events.details
                    }}</q-tooltip>
                </div>
              </div>
            </template>
          </template>
        </q-calendar-day>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QCalendarDay,
  addToDate,
  parseTimestamp,
  isBetweenDates,
  today,
  parsed,
  parseTime,
  getDayTimeIdentifier,
  getDateTime
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass'
import postsService from 'src/services/posts'

import { defineComponent, ref, onMounted, computed, watch } from 'vue'
import AddEventsModal from '../components/AddEventsModal.vue'
import NavigationBar from '../components/NavigationBar.vue'

function leftClick (e) {
  return e.button === 0
}

export default defineComponent({
  name: 'WeekSlotDayBody',
  components: {
    NavigationBar,
    QCalendarDay,
    AddEventsModal
  },

  setup () {
    const { list } = postsService()
    const addEvent = ref(false)
    const eventDate = ref(today())
    const eventId = ref(null)
    const eventTimeStart = ref(null)
    const eventTimeFinish = ref(null)
    const selectedDate = ref(today()),
      calendar = ref(null),
      toggled = ref(false),
      anchorTimestamp = ref(null),
      otherTimestamp = ref(null),
      mouseDown = ref(false),
      currentDate = ref(null)

    const events = ref(false)

    const locale = 'pt-BR'
    const getEvents = async () => {
      try {
        const data = await list()
        events.value = data
      } catch (error) {
        console.error(error)
      }
    }

    onMounted(() => {
      getEvents()
    })

    const startEndDates = computed(() => {
      const dates = []
      if (anchorDayTimeIdentifier.value !== false && otherDayTimeIdentifier.value !== false) {
        if (anchorDayTimeIdentifier.value <= otherDayTimeIdentifier.value) {
          dates.push(getDateTime(anchorTimestamp.value), getDateTime(otherTimestamp.value))
        } else {
          dates.push(getDateTime(otherTimestamp.value), getDateTime(anchorTimestamp.value))
        }
      }
      return dates
    })

    const anchorDayTimeIdentifier = computed(() => {
      if (anchorTimestamp.value !== null) {
        return getDayTimeIdentifier(anchorTimestamp.value)
      }
      return false
    })

    const otherDayTimeIdentifier = computed(() => {
      if (otherTimestamp.value !== null) {
        return getDayTimeIdentifier(otherTimestamp.value)
      }
      return false
    })

    function hasDate (days) {
      return currentDate.value
        ? days.find(day => day.date === currentDate.value)
        : false
    }

    const eventsMap = computed(() => {
      const map = {}
      // events.value.forEach(event => (map[ event.date ] = map[ event.date ] || []).push(event))
      if (events.value !== false) {
        events.value.forEach(event => {
          if (!map[event.date]) {
            map[event.date] = []
          }
          map[event.date].push(event)
          if (event.days) {
            let timestamp = parseTimestamp(event.date)
            let days = event.days
            do {
              timestamp = addToDate(timestamp, { day: 1 })
              if (!map[timestamp.date]) {
                map[timestamp.date] = []
              }
              map[timestamp.date].push(event)
            } while (--days > 0)
          }
        })
      }
      return map
    })
    function getDayEvents (dt) {
      // get all events for the specified date
      const events = eventsMap.value[dt]
      if (events === 1) {
        events[0].side = 'full'
      } else if (events === 2) {
        // this example does no more than 2 events per day
        // check if the two events overlap and if so, select
        // left or right side alignment to prevent overlap
        const startTime = addToDate(parsed(events[0].date), { minute: parseTime(events[0].time) })
        const endTime = addToDate(startTime, { minute: events[0].duration })
        const startTime2 = addToDate(parsed(events[1].date), { minute: parseTime(events[1].time) })
        const endTime2 = addToDate(startTime2, { minute: events[1].duration })
        if (isBetweenDates(startTime2, startTime, endTime, true) || isBetweenDates(endTime2, startTime, endTime, true)) {
          events[0].side = 'left'
          events[1].side = 'right'
        } else {
          events[0].side = 'full'
          events[1].side = 'full'
        }
      }
      return events
    }

    function badgeClasses (event, type) {
      const isHeader = type === 'header'

      return {
        [`text-white bg-${event.bgcolor}`]: true,
        'full-width': !isHeader && (!event.side || event.side === 'full'),
        'left-side': !isHeader && event.side === 'left',
        'right-side': !isHeader && event.side === 'right',
        'rounded-border': true
      }
    }

    function badgeStyles (event, type, timeStartPos = undefined, timeDurationHeight = undefined) {
      const s = {}
      if (timeStartPos && timeDurationHeight) {
        s.top = timeStartPos(event.timeStart) + 'px'
        s.height = timeDurationHeight(event.duration) + 'px'
      }
      s['background-color'] = event.bgcolor
      s['align-items'] = 'flex-start'
      return s
    }

    function onMouseDownTime ({ scope, event }) {
      console.log('onMouseDownTime', { scope, event })
      if (leftClick(event)) {
        // mouse is down, start selection and capture current
        mouseDown.value = true
        anchorTimestamp.value = scope.timestamp
        otherTimestamp.value = scope.timestamp
      }
    }

    function addMinutesToTime (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number)
      let totalMinutes = hours * 60 + minutes + 15
      totalMinutes = (totalMinutes + 1440) % 1440
      const newHours = Math.floor(totalMinutes / 60)
      const newMinutes = totalMinutes % 60

      const newTimeString = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`

      return newTimeString
    }

    function onMouseUpTime ({ scope, event }) {
      console.log('onMouseUpTime', { scope, event })
      if (leftClick(event)) {
        // mouse is up, capture last and cancel selection
        scope.timestamp.time = addMinutesToTime(scope.timestamp.time)
        otherTimestamp.value = scope.timestamp
        mouseDown.value = false
        eventId.value = null
        eventDate.value = scope.timestamp.date
        eventTimeStart.value = anchorTimestamp.value.time
        eventTimeFinish.value = otherTimestamp.value.time
        addEvent.value = true
      }
    }

    function onMouseMoveTime ({ scope, event }) {
      if (mouseDown.value === true) {
        otherTimestamp.value = scope.timestamp
      }
    }

    function scrollToEvent (event) {
      calendar.value.scrollToTime(event.timeStart, 350)
    }

    function onToday () {
      calendar.value.moveToToday()
    }
    function onPrev () {
      calendar.value.prev()
    }
    function onNext () {
      calendar.value.next()
    }
    function onMoved (data) {
      console.log('onMoved', data)
    }
    function onChange (data) {
      console.log('onChange', data)
    }
    function onClickDate (data) {
      console.log('onClickDate', data)
    }
    // function onClickTime (data) {
    //   addEvent.value = true
    //   eventId.value = null
    //   eventDate.value = data.scope.timestamp.date
    //   console.log('onClickTime', data)
    // }
    function onClickInterval (data) {
      console.log('onClickInterval', data)
    }
    function onClickHeadIntervals (data) {
      console.log('onClickHeadIntervals', data)
    }
    function onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    }
    watch(addEvent, async (newValue, oldValue) => {
      if (newValue !== oldValue) {
        getEvents()
      }
      if (oldValue !== newValue) {
        getEvents()
      }
    })
    return {
      selectedDate,
      eventsMap,
      locale,
      toggled,
      calendar,
      addEvent,
      eventDate,
      eventId,
      eventTimeStart,
      eventTimeFinish,
      startEndDates,
      onMouseDownTime,
      onMouseUpTime,
      onMouseMoveTime,
      hasDate,
      getDayEvents,
      badgeClasses,
      badgeStyles,
      scrollToEvent,
      onToday,
      onPrev,
      onNext,
      onMoved,
      onChange,
      onClickDate,
      onClickInterval,
      onClickHeadIntervals,
      onClickHeadDay
    }
  }
})
</script>

<style lang="sass" scoped>
.my-event
  position: absolute
  font-size: 12px
  justify-content: center
  margin: 0 1px
  text-overflow: ellipsis
  overflow: hidden
  cursor: pointer

.title
  position: relative
  display: flex
  justify-content: center
  align-items: center
  height: 100%

.text-white
  color: white

.bg-blue
  background: blue

.bg-green
  background: green

.bg-orange
  background: orange

.bg-red
  background: red

.bg-teal
  background: teal

.bg-grey
  background: grey

.bg-purple
  background: purple

.full-width
  left: 0
  width: calc(100% - 2px)

.left-side
  left: 0
  width: calc(50% - 3px)

.right-side
  left: 50%
  width: calc(50% - 3px)

.rounded-border
  border-radius: 2px

.day-view-current-time-indicator
  position: absolute
  left: -5px
  height: 10px
  width: 10px
  margin-top: -4px
  background-color: rgba(0, 0, 255, .5)
  border-radius: 50%

.day-view-current-time-line
  position: absolute
  left: 5px
  border-top: rgba(0, 0, 255, .5) 2px solid
  width: calc(100% - 5px)

.q-dark,
.body--dark,
.q-calendar--dark
  .day-view-current-time-indicator
    background-color: rgba(255, 255, 0, .85)

  .day-view-current-time-line
    border-top: rgba(255, 255, 0, .85) 2px solid
</style>
