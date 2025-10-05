/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

// Mock schedules data
const mockSchedules = [
  {
    id: 1,
    subjectCode: "CS101",
    subjectTitle: "Introduction to Computer Science",
    faculty: "Dr. Maria Santos",
    roomName: "A101",
    building: "IT Main Building",
    startTime: "08:00 AM",
    endTime: "10:00 AM",
    days: ["Monday", "Wednesday", "Friday"],
    semester: "1st Semester",
    schoolYear: "2024-2025",
    status: "Active"
  },
  {
    id: 2,
    subjectCode: "MATH201",
    subjectTitle: "Calculus II",
    faculty: "Prof. Juan Dela Cruz",
    roomName: "B205",
    building: "Engineering Complex A",
    startTime: "10:30 AM",
    endTime: "12:00 PM",
    days: ["Tuesday", "Thursday"],
    semester: "1st Semester",
    schoolYear: "2024-2025",
    status: "Active"
  },
  {
    id: 3,
    subjectCode: "ENG102",
    subjectTitle: "Technical Writing",
    faculty: "Ms. Ana Garcia",
    roomName: "C301",
    building: "Business Administration Building",
    startTime: "01:00 PM",
    endTime: "02:30 PM",
    days: ["Monday", "Wednesday"],
    semester: "1st Semester",
    schoolYear: "2024-2025",
    status: "Active"
  },
  {
    id: 4,
    subjectCode: "PHYS301",
    subjectTitle: "Advanced Physics",
    faculty: "Dr. Roberto Kim",
    roomName: "D401",
    building: "Engineering Complex B",
    startTime: "03:00 PM",
    endTime: "05:00 PM",
    days: ["Tuesday", "Thursday"],
    semester: "1st Semester",
    schoolYear: "2024-2025",
    status: "Active"
  }
];

export const schedulesPage = (req, res) => {
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Schedules", url: "/schedules" }
  ];
  
  res.render("schedules", {
    title: "Schedules",
    schedules: mockSchedules
  });
};

export const scheduleDetailPage = (req, res) => {
  const scheduleId = parseInt(req.params.id);
  const schedule = mockSchedules.find(s => s.id === scheduleId);
  
  if (!schedule) {
    req.flash("error_msg", "Schedule not found");
    return res.redirect("/schedules");
  }
  
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Schedules", url: "/schedules" },
    { label: schedule.subjectCode, url: `/schedules/${schedule.id}` }
  ];
  
  res.render("schedule", {
    title: `${schedule.subjectCode} - ${schedule.subjectTitle}`,
    schedule: schedule
  });
};

export const newSchedulePage = (req, res) => {
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Schedules", url: "/schedules" },
    { label: "New Schedule", url: "/schedules/new" }
  ];
  
  res.render("schedules/new", {
    title: "Add New Schedule"
  });
};