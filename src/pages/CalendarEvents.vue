<template>
  <div class="subcontent">
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%;">
        <q-calendar-month ref="calendar" v-model="selectedDate" use-navigation focusable hoverable
          :month-label-size="size" :focus-type="['day']" :day-min-height="100" animated bordered
          :weekdays="[1, 2, 3, 4, 5]" :locale="'pt-BR'" :style="theme" @change="onChange" @moved="onMoved"
          @click-date="onClickDate" @click-day="onClickDay" @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek" @click-head-day="onClickHeadDay">
          <template #day="{ scope: { timestamp } }">
            <template v-for="events in eventsMap[timestamp.date]" :key="events.id">
              <div :class="badgeClasses(events, 'day')" :style="badgeStyles(events, 'day')" class="my-event">
                <div class="title q-calendar__ellipsis">
                  {{ events.title + (events.time ? ' - ' + events.time : '') }}
                  <q-tooltip>{{ events.details }}</q-tooltip>
                </div>
              </div>
            </template>
          </template>
        </q-calendar-month>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QCalendarMonth,
  addToDate,
  parseTimestamp,
  today
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'

import { defineComponent, ref, onMounted } from 'vue'
import NavigationBar from '../components/NavigationBar.vue'
import postsService from 'src/services/posts'

export default defineComponent({
  name: 'MonthSlotDay',
  components: {
    NavigationBar,
    QCalendarMonth
  },

  setup () {
    const { list } = postsService()
    const events = ref([])
    onMounted(() => {
      getEvents()
    })
    const getEvents = async () => {
      try {
        const data = await list()
        events.value = data
      } catch (error) {
        console.error(error)
      }
    }
    return {
      events
    }
  },
  data () {
    return {
      selectedDate: today()
    }
  },
  computed: {
    eventsMap () {
      const map = {}
      if (this.events.length > 0) {
        this.events.forEach(event => {
          (map[event.date] = (map[event.date] || [])).push(event)
          if (event.days !== undefined) {
            let timestamp = parseTimestamp(event.date)
            let days = event.days
            // add a new event for each day
            // skip 1st one which would have been done above
            do {
              timestamp = addToDate(timestamp, { day: 1 })
              if (!map[timestamp.date]) {
                map[timestamp.date] = []
              }
              map[timestamp.date].push(event)
              // already accounted for 1st day
            } while (--days > 1)
          }
        })
      }
      console.log(map)
      return map
    }
  },
  methods: {
    badgeClasses (event, type) {
      return {
        [`text-white bg-${event.bgcolor}`]: true,
        'rounded-border': true
      }
    },

    badgeStyles (day, event) {
      const s = {}
      // s.left = day.weekday === 0 ? 0 : (day.weekday * this.parsedCellWidth) + '%'
      // s.top = 0
      // s.bottom = 0
      // s.width = (event.days * this.parsedCellWidth) + '%'
      return s
    },

    onToday () {
      this.$refs.calendar.moveToToday()
    },
    onPrev () {
      this.$refs.calendar.prev()
    },
    onNext () {
      this.$refs.calendar.next()
    },
    onMoved (data) {
      console.log('onMoved', data)
    },
    onChange (data) {
      console.log('onChange', data)
    },
    onClickDate (data) {
      console.log('onClickDate', data)
    },
    onClickDay (data) {
      console.log('onClickDay', data)
      this.addEvent = true
    },
    onClickWorkweek (data) {
      console.log('onClickWorkweek', data)
    },
    onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    },
    onClickHeadWorkweek (data) {
      console.log('onClickHeadWorkweek', data)
    }
  }
})
</script>

<style lang="sass" scoped>
.my-event
  position: relative
  font-size: 12px
  width: 100%
  margin: 1px 0 0 0
  justify-content: center
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

.rounded-border
  border-radius: 2px
</style>
