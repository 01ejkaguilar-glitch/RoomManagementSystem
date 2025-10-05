// Calendar System for Room Management
// Provides weekly, daily, and monthly calendar views with schedule integration

class CalendarSystem {
  constructor(config) {
    this.config = {
      container: null,
      view: 'week', // 'day', 'week', 'month'
      startHour: 7,
      endHour: 21,
      timeSlotDuration: 30, // minutes
      showWeekends: false,
      currentDate: new Date(),
      schedules: [],
      onEventClick: null,
      onTimeSlotClick: null,
      ...config
    };
    
    this.currentDate = new Date(this.config.currentDate);
    this.schedules = this.config.schedules || [];
    
    this.init();
  }
  
  init() {
    if (!this.config.container) {
      console.error('Calendar container not found');
      return;
    }
    
    this.render();
    this.bindEvents();
  }
  
  render() {
    this.config.container.innerHTML = `
      <div class="calendar-system">
        <div class="calendar-header">
          ${this.renderHeader()}
        </div>
        <div class="calendar-body">
          ${this.renderBody()}
        </div>
      </div>
    `;
  }
  
  renderHeader() {
    const dateStr = this.formatHeaderDate();
    
    return `
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold">${dateStr}</h2>
          <div class="flex items-center gap-2">
            <button class="btn text-gray-600 border border-gray-300" onclick="calendar.navigate('prev')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button class="btn text-gray-600 border border-gray-300" onclick="calendar.navigate('today')">Today</button>
            <button class="btn text-gray-600 border border-gray-300" onclick="calendar.navigate('next')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button class="px-3 py-2 text-sm ${this.config.view === 'day' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    onclick="calendar.changeView('day')">Day</button>
            <button class="px-3 py-2 text-sm ${this.config.view === 'week' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    onclick="calendar.changeView('week')">Week</button>
            <button class="px-3 py-2 text-sm ${this.config.view === 'month' ? 'bg-brand text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}" 
                    onclick="calendar.changeView('month')">Month</button>
          </div>
        </div>
      </div>
    `;
  }
  
  renderBody() {
    switch (this.config.view) {
      case 'day':
        return this.renderDayView();
      case 'week':
        return this.renderWeekView();
      case 'month':
        return this.renderMonthView();
      default:
        return this.renderWeekView();
    }
  }
  
  renderDayView() {
    const date = new Date(this.currentDate);
    const daySchedules = this.getSchedulesForDate(date);
    
    return `
      <div class="day-view bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="day-header bg-gray-50 p-4 border-b">
          <h3 class="font-semibold text-lg">${this.formatDate(date, 'full')}</h3>
          <p class="text-sm text-gray-600">${daySchedules.length} scheduled classes</p>
        </div>
        
        <div class="day-schedule">
          ${this.renderTimeSlots(date, daySchedules)}
        </div>
      </div>
    `;
  }
  
  renderWeekView() {
    const weekStart = this.getWeekStart(this.currentDate);
    const weekDays = this.getWeekDays(weekStart);
    
    return `
      <div class="week-view bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="week-header grid grid-cols-8 border-b">
          <div class="p-4 border-r bg-gray-50"></div>
          ${weekDays.map(day => `
            <div class="p-4 border-r bg-gray-50 text-center">
              <div class="font-semibold text-sm">${this.formatDate(day, 'weekday')}</div>
              <div class="text-lg ${this.isToday(day) ? 'text-brand font-bold' : 'text-gray-900'}">${day.getDate()}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="week-schedule">
          ${this.renderWeekTimeSlots(weekDays)}
        </div>
      </div>
    `;
  }
  
  renderMonthView() {
    const monthStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const monthEnd = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const calendarStart = this.getWeekStart(monthStart);
    const weeks = this.getMonthWeeks(calendarStart, monthEnd);
    
    return `
      <div class="month-view bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="month-header grid grid-cols-7 border-b bg-gray-50">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `
            <div class="p-4 text-center font-semibold text-sm text-gray-700">${day}</div>
          `).join('')}
        </div>
        
        <div class="month-calendar">
          ${weeks.map(week => `
            <div class="grid grid-cols-7 border-b">
              ${week.map(day => this.renderMonthDay(day)).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  renderTimeSlots(date, daySchedules) {
    let html = '';
    const totalMinutes = (this.config.endHour - this.config.startHour) * 60;
    const slotsCount = totalMinutes / this.config.timeSlotDuration;
    
    for (let i = 0; i < slotsCount; i++) {
      const slotStart = this.config.startHour + (i * this.config.timeSlotDuration / 60);
      const hour = Math.floor(slotStart);
      const minute = (slotStart % 1) * 60;
      const timeString = this.formatTime(hour, minute);
      
      const slotSchedules = this.getSchedulesForTimeSlot(daySchedules, hour, minute);
      
      html += `
        <div class="time-slot flex border-b hover:bg-gray-50" data-time="${hour}:${minute.toString().padStart(2, '0')}">
          <div class="time-label w-20 p-3 text-sm text-gray-600 border-r">${timeString}</div>
          <div class="slot-content flex-1 p-3 min-h-16">
            ${slotSchedules.map(schedule => this.renderScheduleEvent(schedule, 'day')).join('')}
          </div>
        </div>
      `;
    }
    
    return html;
  }
  
  renderWeekTimeSlots(weekDays) {
    let html = '';
    const totalMinutes = (this.config.endHour - this.config.startHour) * 60;
    const slotsCount = totalMinutes / this.config.timeSlotDuration;
    
    for (let i = 0; i < slotsCount; i++) {
      const slotStart = this.config.startHour + (i * this.config.timeSlotDuration / 60);
      const hour = Math.floor(slotStart);
      const minute = (slotStart % 1) * 60;
      const timeString = this.formatTime(hour, minute);
      
      html += `
        <div class="time-slot grid grid-cols-8 border-b hover:bg-gray-50" data-time="${hour}:${minute.toString().padStart(2, '0')}">
          <div class="time-label p-3 text-sm text-gray-600 border-r bg-gray-50">${timeString}</div>
          ${weekDays.map(day => {
            const daySchedules = this.getSchedulesForDate(day);
            const slotSchedules = this.getSchedulesForTimeSlot(daySchedules, hour, minute);
            return `
              <div class="slot-content p-2 border-r min-h-16 relative" data-date="${day.toISOString().split('T')[0]}">
                ${slotSchedules.map(schedule => this.renderScheduleEvent(schedule, 'week')).join('')}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }
    
    return html;
  }
  
  renderMonthDay(day) {
    const daySchedules = this.getSchedulesForDate(day);
    const isCurrentMonth = day.getMonth() === this.currentDate.getMonth();
    const isToday = this.isToday(day);
    
    return `
      <div class="month-day p-2 h-24 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} border-r cursor-pointer hover:bg-gray-50"
           data-date="${day.toISOString().split('T')[0]}"
           onclick="calendar.onDayClick('${day.toISOString().split('T')[0]}')">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm ${isToday ? 'bg-brand text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}">${day.getDate()}</span>
          ${daySchedules.length > 0 ? `<span class="text-xs text-gray-500">${daySchedules.length}</span>` : ''}
        </div>
        <div class="space-y-1">
          ${daySchedules.slice(0, 2).map(schedule => `
            <div class="text-xs bg-brand/10 text-brand px-1 py-0.5 rounded truncate">${schedule.subjectCode}</div>
          `).join('')}
          ${daySchedules.length > 2 ? `<div class="text-xs text-gray-500">+${daySchedules.length - 2} more</div>` : ''}
        </div>
      </div>
    `;
  }
  
  renderScheduleEvent(schedule, viewType) {
    const colors = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const colorClass = colors[schedule.status] || 'bg-blue-100 text-blue-800 border-blue-200';
    
    if (viewType === 'week') {
      return `
        <div class="schedule-event ${colorClass} border rounded p-1 mb-1 cursor-pointer text-xs"
             onclick="calendar.onEventClick(${JSON.stringify(schedule).replace(/"/g, '&quot;')})">
          <div class="font-semibold truncate">${schedule.subjectCode}</div>
          <div class="truncate">${schedule.roomName}</div>
          <div class="text-xs opacity-75">${schedule.startTime}-${schedule.endTime}</div>
        </div>
      `;
    } else {
      return `
        <div class="schedule-event ${colorClass} border rounded p-2 mb-2 cursor-pointer"
             onclick="calendar.onEventClick(${JSON.stringify(schedule).replace(/"/g, '&quot;')})">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="font-semibold">${schedule.subjectCode} - ${schedule.subjectTitle}</div>
              <div class="text-sm opacity-75">${schedule.faculty}</div>
              <div class="text-sm opacity-75">${schedule.roomName} - ${schedule.building}</div>
            </div>
            <div class="text-sm">${schedule.startTime}-${schedule.endTime}</div>
          </div>
        </div>
      `;
    }
  }
  
  // Navigation methods
  navigate(direction) {
    switch (direction) {
      case 'prev':
        this.navigatePrevious();
        break;
      case 'next':
        this.navigateNext();
        break;
      case 'today':
        this.currentDate = new Date();
        break;
    }
    this.render();
  }
  
  navigatePrevious() {
    switch (this.config.view) {
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() - 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        break;
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        break;
    }
  }
  
  navigateNext() {
    switch (this.config.view) {
      case 'day':
        this.currentDate.setDate(this.currentDate.getDate() + 1);
        break;
      case 'week':
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        break;
      case 'month':
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        break;
    }
  }
  
  changeView(view) {
    this.config.view = view;
    this.render();
  }
  
  // Utility methods
  getWeekStart(date) {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return start;
  }
  
  getWeekDays(weekStart) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      if (this.config.showWeekends || (i > 0 && i < 6)) {
        days.push(day);
      }
    }
    return this.config.showWeekends ? days : days.slice(1, 6);
  }
  
  getMonthWeeks(calendarStart, monthEnd) {
    const weeks = [];
    let currentDate = new Date(calendarStart);
    
    while (currentDate <= monthEnd || currentDate.getDay() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
      
      if (week[6] > monthEnd && week[6].getMonth() > monthEnd.getMonth()) {
        break;
      }
    }
    
    return weeks;
  }
  
  getSchedulesForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return this.schedules.filter(schedule => {
      return schedule.days && schedule.days.includes(dayName);
    });
  }
  
  getSchedulesForTimeSlot(daySchedules, hour, minute) {
    return daySchedules.filter(schedule => {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      
      const slotStart = hour * 60 + minute;
      const scheduleStart = startHour * 60 + startMinute;
      const scheduleEnd = endHour * 60 + endMinute;
      
      return slotStart >= scheduleStart && slotStart < scheduleEnd;
    });
  }
  
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  formatDate(date, format = 'short') {
    const options = {
      short: { month: 'short', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      weekday: { weekday: 'short' }
    };
    
    return date.toLocaleDateString('en-US', options[format]);
  }
  
  formatHeaderDate() {
    switch (this.config.view) {
      case 'day':
        return this.formatDate(this.currentDate, 'full');
      case 'week':
        const weekStart = this.getWeekStart(this.currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;
      case 'month':
        return this.currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      default:
        return '';
    }
  }
  
  formatTime(hour, minute) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
  
  // Event handlers
  onDayClick(dateString) {
    this.currentDate = new Date(dateString);
    this.changeView('day');
  }
  
  onEventClick(schedule) {
    if (this.config.onEventClick) {
      this.config.onEventClick(schedule);
    } else {
      alert(`Schedule: ${schedule.subjectCode} - ${schedule.subjectTitle}\nTime: ${schedule.startTime} - ${schedule.endTime}\nRoom: ${schedule.roomName}\nFaculty: ${schedule.faculty}`);
    }
  }
  
  // Public methods
  updateSchedules(schedules) {
    this.schedules = schedules;
    this.render();
  }
  
  goToDate(date) {
    this.currentDate = new Date(date);
    this.render();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalendarSystem;
}