<template>
  <div class="subcontent">
    <AddEventsModal v-model="addEvent" v-if="addEvent" :eventDate="eventDate"></AddEventsModal>
    <!-- modal para apresentar o Evento -->
    <q-dialog v-model="displayEvent">
      <q-card v-if="showingEvent" style="width: auto; height: auto">
        <q-toolbar :class="displayClasses(showingEvent)" :style="displayStyles(showingEvent)" style="min-width: 400px;">
          <q-toolbar-title>
            {{ showingEvent.title }}
          </q-toolbar-title>
          <q-btn flat round color="white" icon="delete" v-close-popup></q-btn>
          <q-btn flat round color="white" icon="edit" v-close-popup></q-btn>
          <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
        </q-toolbar>
        <q-card-section class="inset-shadow">
          {{ showingEvent.details }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <div style="display: flex; justify-content: center; align-items: center; flex-wrap: nowrap;">
      <div style="font-size: 2em;">{{ formattedMonth }}</div>
    </div>

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%;">
        <q-calendar-month ref="calendar" v-model="selectedDate" use-navigation focusable hoverable animated bordered
          :focus-type="['day']" :day-min-height="90" :locale="locale" @change="onChange" @moved="onMoved"
          @click-date="onClickDate" @click-day="onClickDay" @click-workweek="onClickWorkweek"
          @click-head-workweek="onClickHeadWorkweek" @click-head-day="onClickHeadDay">
          <template #day="{ scope: { timestamp } }">
            <template v-for="events in eventsMap[timestamp.date]" :key="events.id">
              <div :class="badgeClasses(events, 'day')" :style="badgeStyles(events, 'day')" class="my-event"
                @click.stop.prevent="showEvent(events)">
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
  PARSE_DATE, // regex for parsing out date
  addToDate,
  parseTimestamp,
  today,
  isBetweenDates
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'

import {
  defineComponent,
  ref,
  reactive,
  computed,
  onMounted
} from 'vue'
import NavigationBar from '../components/NavigationBar.vue'
import AddEventsModal from '../components/AddEventsModal.vue'
import Holidays from 'date-holidays'
import postsService from 'src/services/posts'
export default defineComponent({
  name: 'MonthSlotDayHolidays',
  components: {
    NavigationBar,
    QCalendarMonth,
    AddEventsModal
  },

  setup (props, { slots, emit }) {
    const { list } = postsService()
    onMounted(() => {
      getEvents()
    })
    const events = ref(false)
    const showingEvent = ref(null)
    const displayEvent = ref(false)
    const addEvent = ref(false)
    const eventDate = ref(today())
    const selectedDate = ref(today()),
      selectedMonth = reactive([]),
      year = ref(new Date().getFullYear()),
      calendar = ref(null),
      country = 'pt-BR'

    const locale = 'pt-BR'

    const formattedMonth = computed(() => {
      const date = new Date(selectedDate.value)
      return monthFormatter().format(date) + ' ' + date.getFullYear()
    })

    function monthFormatter () {
      try {
        return new Intl.DateTimeFormat(locale || undefined, {
          month: 'long',
          timeZone: 'UTC'
        })
      } catch (e) {
        //
      }
    }

    const holidaysMap = computed(() => {
      // keep previous, current and next year so in dec/jan
      // you can see holidays from different years
      return [
        ...(new Holidays(country).getHolidays(year.value - 1)),
        ...(new Holidays(country).getHolidays(year.value)),
        ...(new Holidays(country).getHolidays(year.value + 1))
      ]
    })

    function getColor (item) {
      switch (item.type) {
        case 'public':
          return 'blue'
        case 'observance':
          return 'green'
        case 'optional':
          return 'red'
        default: // bank|school
          return 'orange'
      }
    }

    const getEvents = async () => {
      try {
        const data = await list()
        events.value = data
        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }
    function showEvent (event) {
      console.log(event)
      displayEvent.value = true
      showingEvent.value = event
      console.log(showingEvent)
    }
    /// where the magic happens...
    const eventsMap = computed(() => {
      const map = {}
      if (selectedMonth.length > 0) {
        const start = selectedMonth[0]
        const end = selectedMonth[selectedMonth.length - 1]
        holidaysMap.value
          .filter(item => {
            const timestamp = parseTimestamp((PARSE_DATE.exec(item.date))[0])
            return isBetweenDates(timestamp, start, end)
          })
          .map((item, index) => {
            return {
              id: index,
              title: item.name,
              details: item.type,
              date: (PARSE_DATE.exec(item.date))[0],
              bgcolor: getColor(item)
            }
          })
          .forEach(event => {
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
          }
          )
        if (events.value.length > 0) {
          events.value.forEach(event => {
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
      }
      return map
    })

    function badgeClasses (event, type) {
      return {
        [`text-white bg-${event.bgcolor}`]: true,
        'rounded-border': true
      }
    }

    function badgeStyles (event, day) {
      const s = {}
      s['background-color'] = event.bgcolor
      // s.left = day.weekday === 0 ? 0 : (day.weekday * parsedCellWidth) + '%'
      // s.top = 0
      // s.bottom = 0
      // s.width = (event.days * parsedCellWidth) + '%'
      return s
    }
    function displayClasses (event) {
      return {
        [`text-white bg-${event.bgcolor}`]: true
      }
    }
    function displayStyles (event) {
      const s = {}
      s['background-color'] = event.bgcolor
      return s
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
      selectedMonth.splice(0, selectedMonth.length, ...data.days)
      // get year of 1st of the month
      for (let index = 0; index < selectedMonth.length; ++index) {
        if (selectedMonth[index].day === 1) {
          year.value = selectedMonth[index].year
          break
        }
      }
    }
    function onClickDate (data) {
      console.log('onClickDate', data)
    }
    function onClickDay (data) {
      addEvent.value = true
      eventDate.value = data.scope.timestamp.date
      console.log('onClickDay', data)
      console.log('onClickDayawe', eventDate.value)
    }
    function onClickWorkweek (data) {
      console.log('onClickWorkweek', data)
    }
    function onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    }
    function onClickHeadWorkweek (data) {
      console.log('onClickHeadWorkweek', data)
    }

    return {
      selectedDate,
      calendar,
      country,
      locale,
      eventsMap,
      eventDate,
      formattedMonth,
      addEvent,
      showingEvent,
      displayEvent,
      getEvents,
      badgeClasses,
      badgeStyles,
      displayClasses,
      displayStyles,
      showEvent,
      onToday,
      onPrev,
      onNext,
      onMoved,
      onChange,
      onClickDate,
      onClickDay,
      onClickWorkweek,
      onClickHeadDay,
      onClickHeadWorkweek
    }
  },
  watch: {
    addEvent (newValue, oldValue) {
      // Execute your function when myBoolean changes
      if (newValue !== oldValue) {
        this.getEvents()
      }
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
