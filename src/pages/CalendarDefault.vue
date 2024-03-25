<template>
  <div class="subcontent">
    <navigation-bar @today="onToday" @prev="onPrev" @next="onNext" />

    <div>

      <div style="display: flex; justify-content: center; align-items: center;">
        <div>Month Label Size:</div>
        <q-option-group v-model="size" :options="options" type="radio" inline />
      </div>

      <div class="row justify-center">
        <div style="display: flex; max-width: 800px; width: 100%;">
          <q-calendar-month ref="calendar" v-model="selectedDate" use-navigation focusable hoverable
            :month-label-size="size" :focus-type="['day']" :day-min-height="100" animated bordered
            :weekdays="[1, 2, 3, 4, 5]" :locale="'pt-BR'" :style="theme" @change="onChange" @moved="onMoved"
            @click-date="onClickDate" @click-day="onClickDay" @click-workweek="onClickWorkweek"
            @click-head-workweek="onClickHeadWorkweek" @click-head-day="onClickHeadDay" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent
} from 'vue'
import {
  QCalendarMonth,
  today
} from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarMonth.sass'
import NavigationBar from '../components/NavigationBar.vue'

export default defineComponent({
  name: 'CalendarPage',
  components: {
    NavigationBar,
    QCalendarMonth
  },
  data () {
    return {
      selectedDate: today(),
      size: 'sm',
      options: [{
        label: 'xxs',
        value: 'xxs'
      },
      {
        label: 'xs',
        value: 'xs'
      },
      {
        label: 'sm',
        value: 'sm'
      },
      {
        label: 'md',
        value: 'md'
      },
      {
        label: 'lg',
        value: 'lg'
      },
      {
        label: 'xl',
        value: 'xl'
      },
      {
        label: 'xxl',
        value: 'xxl'
      }
      ],
      theme: {
        '--calendar-scrollbar-track': '#64b5f6',
        '--calendar-scrollbar-thumb': '#0d47a0',
        '--calendar-scrollbar-thumb-hover': '#1e88e5',
        '--calendar-scrollbar-track-dark': '#64b5f6',
        '--calendar-scrollbar-thumb-dark': '#0d47a0',
        '--calendar-scrollbar-thumb-hover-dark': '#1e88e5',
        '--calendar-border': '#64b5f6 1px solid',
        '--calendar-border-dark': '#e3f2fd 1px solid',
        '--calendar-border-section': '#90caf9 1px dashed',
        '--calendar-border-section-dark': '#90caf9 1px dashed',
        '--calendar-border-current': '#64b5f6 2px solid',
        '--calendar-border-current-dark': '#2979ff 2px solid',
        '--calendar-mini-range-connector-hover-border': '#027BE3 1px dashed',
        '--calendar-mini-range-connector-hover-border-dark': '#ffff66 1px dashed',
        '--calendar-color': '#0d47a0',
        '--calendar-color-dark': '#e3f2fd',
        '--calendar-background': '#e3f2fd',
        '--calendar-background-dark': '#0d47a0',
        '--calendar-current-color': '#027BE3',
        '--calendar-current-color-dark': '#2979ff',
        '--calendar-current-background': '#00000000',
        '--calendar-current-background-dark': '#0d47a0',
        '--calendar-disabled-date-color': '#e3f2fd',
        '--calendar-disabled-date-color-dark': '#bebebe',
        '--calendar-disabled-date-background': '#90caf9',
        '--calendar-disabled-date-background-dark': '#121212',
        '--calendar-active-date-color': '#e3f2fd',
        '--calendar-active-date-color-dark': '#ffff66',
        '--calendar-active-date-background': '#2979ff',
        '--calendar-active-date-background-dark': '#64b5f6',
        '--calendar-outside-color': '#0d47a0',
        '--calendar-outside-color-dark': '#bebebe',
        '--calendar-outside-background': '#00000000',
        '--calendar-outside-background-dark': '#121212',
        '--calendar-selected-color': '#027BE3',
        '--calendar-selected-color-dark': '#027BE3',
        '--calendar-selected-background': '#cce7ff',
        '--calendar-selected-background-dark': '#cce7ff',
        '--calendar-mini-selected-color': 'unset',
        '--calendar-mini-selected-color-dark': '#027BE3',
        '--calendar-mini-selected-background': 'unset',
        '--calendar-mini-selected-background-dark': '#cce7ff',
        '--calendar-mini-selected-label-color': '#027BE3',
        '--calendar-mini-selected-label-color-dark': '#cce7ff',
        '--calendar-mini-selected-label-background': '#cce7ff',
        '--calendar-mini-selected-label-background-dark': '#027BE3',
        '--calendar-range-color': '#027BE3',
        '--calendar-range-color-dark': '#027BE3',
        '--calendar-range-background': '#cce7ff',
        '--calendar-range-background-dark': '#cce7ff',
        '--calendar-mini-range-color': '#cce7ff',
        '--calendar-mini-range-color-dark': '#027BE3',
        '--calendar-mini-range-background': 'unset',
        '--calendar-mini-range-background-dark': 'unset',
        '--calendar-mini-range-label-color': '#cce7ff',
        '--calendar-mini-range-label-color-dark': '#027BE3',
        '--calendar-mini-range-label-background': '#cce7ff',
        '--calendar-mini-range-label-background-dark': '#cce7ff',
        '--calendar-mini-range-connector-color': '#cce7ff',
        '--calendar-mini-range-connector-color-dark': '#ffff66',
        '--calendar-mini-range-hover-color': '#027BE3',
        '--calendar-mini-range-hover-color-dark': '#ffff66',
        '--calendar-mini-range-firstlast-color': '#cce7ff',
        '--calendar-mini-range-firstlast-color-dark': '#cce7ff',
        '--calendar-mini-range-firstlast-background': 'unset',
        '--calendar-mini-range-firstlast-background-dark': '#cce7ff',
        '--calendar-mini-range-firstlast-label-color': '#cce7ff',
        '--calendar-mini-range-firstlast-label-color-dark': '#cce7ff',
        '--calendar-mini-range-firstlast-label-background': '#027BE3',
        '--calendar-mini-range-firstlast-label-background-dark': '#ffff66',
        '--calendar-intervals-width': '56px',
        '--calendar-work-week-width': '30px',
        '--calendar-mini-work-week-width': '30px',
        '--calendar-work-week-font-size': '1.0em',
        '--calendar-head-font-weight': '600'
      }
    }
  },
  methods: {
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
}
)
</script>
