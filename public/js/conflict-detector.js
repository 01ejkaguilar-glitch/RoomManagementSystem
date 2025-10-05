// Conflict Detection System
// Prevents double-booking of rooms and faculty schedules

class ConflictDetector {
  constructor(schedules = []) {
    this.schedules = schedules;
    this.conflicts = [];
  }
  
  // Main conflict detection method
  detectConflicts(newSchedule = null) {
    const schedulesToCheck = newSchedule ? 
      [...this.schedules, newSchedule] : 
      this.schedules;
    
    this.conflicts = [];
    
    // Check for room conflicts
    this.checkRoomConflicts(schedulesToCheck);
    
    // Check for faculty conflicts
    this.checkFacultyConflicts(schedulesToCheck);
    
    // Check for capacity violations
    this.checkCapacityViolations(schedulesToCheck);
    
    return this.conflicts;
  }
  
  // Check for room double-booking
  checkRoomConflicts(schedules) {
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const schedule1 = schedules[i];
        const schedule2 = schedules[j];
        
        if (this.hasRoomConflict(schedule1, schedule2)) {
          this.conflicts.push({
            type: 'room_conflict',
            severity: 'high',
            message: `Room ${schedule1.roomName} is double-booked`,
            details: `${schedule1.subjectCode} and ${schedule2.subjectCode} are both scheduled in ${schedule1.roomName}`,
            schedules: [schedule1, schedule2],
            conflictTime: this.getOverlapTime(schedule1, schedule2),
            suggestion: this.suggestRoomAlternative(schedule1, schedule2)
          });
        }
      }
    }
  }
  
  // Check for faculty double-booking
  checkFacultyConflicts(schedules) {
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i + 1; j < schedules.length; j++) {
        const schedule1 = schedules[i];
        const schedule2 = schedules[j];
        
        if (this.hasFacultyConflict(schedule1, schedule2)) {
          this.conflicts.push({
            type: 'faculty_conflict',
            severity: 'high',
            message: `${schedule1.faculty} is double-booked`,
            details: `${schedule1.faculty} is scheduled for both ${schedule1.subjectCode} and ${schedule2.subjectCode}`,
            schedules: [schedule1, schedule2],
            conflictTime: this.getOverlapTime(schedule1, schedule2),
            suggestion: 'Consider rescheduling one of the classes or assigning a different faculty member'
          });
        }
      }
    }
  }
  
  // Check for room capacity violations
  checkCapacityViolations(schedules) {
    schedules.forEach(schedule => {
      const room = this.getRoomDetails(schedule.roomName);
      if (room && schedule.maxStudents && schedule.maxStudents > room.capacity) {
        this.conflicts.push({
          type: 'capacity_violation',
          severity: 'medium',
          message: `${schedule.roomName} capacity exceeded`,
          details: `${schedule.subjectCode} has ${schedule.maxStudents} students but ${schedule.roomName} only accommodates ${room.capacity}`,
          schedules: [schedule],
          suggestion: `Consider moving to a larger room or reducing class size to ${room.capacity}`
        });
      }
    });
  }
  
  // Check if two schedules have a room conflict
  hasRoomConflict(schedule1, schedule2) {
    if (schedule1.roomName !== schedule2.roomName) return false;
    if (schedule1.id === schedule2.id) return false;
    
    return this.hasTimeOverlap(schedule1, schedule2) && 
           this.hasDayOverlap(schedule1, schedule2);
  }
  
  // Check if two schedules have a faculty conflict
  hasFacultyConflict(schedule1, schedule2) {
    if (schedule1.faculty !== schedule2.faculty) return false;
    if (schedule1.id === schedule2.id) return false;
    
    return this.hasTimeOverlap(schedule1, schedule2) && 
           this.hasDayOverlap(schedule1, schedule2);
  }
  
  // Check if two schedules have time overlap
  hasTimeOverlap(schedule1, schedule2) {
    const start1 = this.timeToMinutes(schedule1.startTime);
    const end1 = this.timeToMinutes(schedule1.endTime);
    const start2 = this.timeToMinutes(schedule2.startTime);
    const end2 = this.timeToMinutes(schedule2.endTime);
    
    return start1 < end2 && start2 < end1;
  }
  
  // Check if two schedules have day overlap
  hasDayOverlap(schedule1, schedule2) {
    const days1 = schedule1.days || [];
    const days2 = schedule2.days || [];
    
    return days1.some(day => days2.includes(day));
  }
  
  // Get overlap time between two schedules
  getOverlapTime(schedule1, schedule2) {
    const start1 = this.timeToMinutes(schedule1.startTime);
    const end1 = this.timeToMinutes(schedule1.endTime);
    const start2 = this.timeToMinutes(schedule2.startTime);
    const end2 = this.timeToMinutes(schedule2.endTime);
    
    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    
    if (overlapStart >= overlapEnd) return null;
    
    return {
      start: this.minutesToTime(overlapStart),
      end: this.minutesToTime(overlapEnd),
      duration: overlapEnd - overlapStart
    };
  }
  
  // Convert time string to minutes
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  // Convert minutes to time string
  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  // Get room details (in a real app, this would come from a database)
  getRoomDetails(roomName) {
    const rooms = {
      'Room 101': { capacity: 30, type: 'Lecture Hall', building: 'Main Building' },
      'Room 102': { capacity: 25, type: 'Classroom', building: 'Main Building' },
      'Room 201': { capacity: 40, type: 'Lecture Hall', building: 'Main Building' },
      'Room 105': { capacity: 45, type: 'Classroom', building: 'Science Building' },
      'Lab 201': { capacity: 20, type: 'Laboratory', building: 'Science Building' },
      'Lab 202': { capacity: 20, type: 'Laboratory', building: 'Science Building' },
      'Lab 301': { capacity: 20, type: 'Laboratory', building: 'Engineering Building' },
      'Lab 302': { capacity: 25, type: 'Laboratory', building: 'Engineering Building' },
      'Room 350': { capacity: 60, type: 'Lecture Hall', building: 'Engineering Building' }
    };
    
    return rooms[roomName];
  }
  
  // Suggest room alternatives
  suggestRoomAlternative(schedule1, schedule2) {
    const requiredCapacity = Math.max(
      schedule1.maxStudents || 20,
      schedule2.maxStudents || 20
    );
    
    const availableRooms = Object.entries(this.getRoomDetails())
      .filter(([name, room]) => room.capacity >= requiredCapacity)
      .map(([name]) => name);
    
    const conflictTime = this.getOverlapTime(schedule1, schedule2);
    const availableAtTime = availableRooms.filter(room => 
      !this.isRoomBusyAtTime(room, conflictTime, schedule1.days)
    );
    
    if (availableAtTime.length > 0) {
      return `Consider moving to ${availableAtTime[0]} which is available during this time`;
    }
    
    return 'No suitable alternative rooms found. Consider changing the schedule time.';
  }
  
  // Check if room is busy at specific time
  isRoomBusyAtTime(roomName, timeSlot, days) {
    if (!timeSlot || !days) return false;
    
    return this.schedules.some(schedule => {
      if (schedule.roomName !== roomName) return false;
      
      const hasTimeConflict = this.hasTimeOverlap(
        { startTime: timeSlot.start, endTime: timeSlot.end },
        schedule
      );
      
      const hasDayConflict = days.some(day => 
        (schedule.days || []).includes(day)
      );
      
      return hasTimeConflict && hasDayConflict;
    });
  }
  
  // Validate a new schedule before adding
  validateSchedule(newSchedule) {
    const tempConflicts = this.detectConflicts(newSchedule);
    const newScheduleConflicts = tempConflicts.filter(conflict =>
      conflict.schedules.some(s => s === newSchedule || 
        (s.subjectCode === newSchedule.subjectCode && 
         s.startTime === newSchedule.startTime))
    );
    
    return {
      isValid: newScheduleConflicts.length === 0,
      conflicts: newScheduleConflicts,
      warnings: this.generateWarnings(newSchedule)
    };
  }
  
  // Generate warnings for potential issues
  generateWarnings(schedule) {
    const warnings = [];
    
    // Check for back-to-back classes
    const backToBack = this.schedules.filter(s => 
      s.faculty === schedule.faculty &&
      s.days.some(day => schedule.days.includes(day)) &&
      (this.timeToMinutes(s.endTime) === this.timeToMinutes(schedule.startTime) ||
       this.timeToMinutes(schedule.endTime) === this.timeToMinutes(s.startTime))
    );
    
    if (backToBack.length > 0) {
      warnings.push({
        type: 'back_to_back',
        message: `${schedule.faculty} has back-to-back classes`,
        suggestion: 'Consider adding a break between classes'
      });
    }
    
    // Check for unusual hours
    const startHour = this.timeToMinutes(schedule.startTime) / 60;
    if (startHour < 7 || startHour > 18) {
      warnings.push({
        type: 'unusual_hours',
        message: 'Class scheduled outside normal hours (7 AM - 6 PM)',
        suggestion: 'Confirm if this time is acceptable'
      });
    }
    
    // Check for long duration
    const duration = this.timeToMinutes(schedule.endTime) - this.timeToMinutes(schedule.startTime);
    if (duration > 180) { // More than 3 hours
      warnings.push({
        type: 'long_duration',
        message: 'Class duration exceeds 3 hours',
        suggestion: 'Consider adding breaks or splitting into multiple sessions'
      });
    }
    
    return warnings;
  }
  
  // Get conflict summary
  getConflictSummary() {
    const summary = {
      total: this.conflicts.length,
      high: this.conflicts.filter(c => c.severity === 'high').length,
      medium: this.conflicts.filter(c => c.severity === 'medium').length,
      low: this.conflicts.filter(c => c.severity === 'low').length,
      byType: {}
    };
    
    this.conflicts.forEach(conflict => {
      summary.byType[conflict.type] = (summary.byType[conflict.type] || 0) + 1;
    });
    
    return summary;
  }
  
  // Get conflicts for a specific schedule
  getScheduleConflicts(scheduleId) {
    return this.conflicts.filter(conflict =>
      conflict.schedules.some(s => s.id === scheduleId)
    );
  }
  
  // Update schedules and re-detect conflicts
  updateSchedules(schedules) {
    this.schedules = schedules;
    return this.detectConflicts();
  }
  
  // Auto-resolve conflicts (basic implementation)
  autoResolveConflicts() {
    const resolutions = [];
    
    this.conflicts.forEach(conflict => {
      if (conflict.type === 'room_conflict') {
        // Try to find alternative room
        const alternative = this.findAlternativeRoom(conflict.schedules[0]);
        if (alternative) {
          resolutions.push({
            conflict: conflict,
            resolution: 'room_change',
            details: `Move ${conflict.schedules[0].subjectCode} to ${alternative}`,
            schedule: conflict.schedules[0],
            newRoom: alternative
          });
        }
      }
    });
    
    return resolutions;
  }
  
  // Find alternative room for a schedule
  findAlternativeRoom(schedule) {
    const requiredCapacity = schedule.maxStudents || 20;
    const roomOptions = Object.entries(this.getRoomDetails())
      .filter(([name, room]) => 
        room.capacity >= requiredCapacity && 
        name !== schedule.roomName
      );
    
    for (const [roomName] of roomOptions) {
      const testSchedule = { ...schedule, roomName };
      const validation = this.validateSchedule(testSchedule);
      
      if (validation.isValid) {
        return roomName;
      }
    }
    
    return null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConflictDetector;
}

// Global utility functions
window.ConflictUtils = {
  // Format conflict for display
  formatConflictMessage: function(conflict) {
    const icons = {
      room_conflict: '🏠',
      faculty_conflict: '👨‍🏫',
      capacity_violation: '👥'
    };
    
    return `${icons[conflict.type] || '⚠️'} ${conflict.message}`;
  },
  
  // Get severity color class
  getSeverityColor: function(severity) {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-yellow-600 bg-yellow-100',
      low: 'text-blue-600 bg-blue-100'
    };
    
    return colors[severity] || 'text-gray-600 bg-gray-100';
  },
  
  // Generate conflict report
  generateConflictReport: function(conflicts) {
    const report = {
      summary: `Found ${conflicts.length} conflicts`,
      details: conflicts.map(conflict => ({
        type: conflict.type,
        message: conflict.message,
        severity: conflict.severity,
        affectedSchedules: conflict.schedules.map(s => s.subjectCode).join(', '),
        suggestion: conflict.suggestion
      }))
    };
    
    return report;
  }
};