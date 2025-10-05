/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

// Mock rooms data
const mockRooms = [
  {
    id: 1,
    name: "A101",
    buildingName: "IT Main Building",
    capacity: 40,
    type: "Lecture Hall",
    equipment: ["Projector", "Whiteboard", "AC"],
    isAvailable: true,
    floor: 1
  },
  {
    id: 2,
    name: "A102",
    buildingName: "IT Main Building",
    capacity: 35,
    type: "Classroom",
    equipment: ["Projector", "Whiteboard"],
    isAvailable: false,
    floor: 1
  },
  {
    id: 3,
    name: "B201",
    buildingName: "IT Laboratory Building",
    capacity: 25,
    type: "Computer Lab",
    equipment: ["30 PCs", "Projector", "AC"],
    isAvailable: true,
    floor: 2
  },
  {
    id: 4,
    name: "C301",
    buildingName: "Engineering Complex A",
    capacity: 50,
    type: "Laboratory",
    equipment: ["Lab Equipment", "Safety Gear"],
    isAvailable: true,
    floor: 3
  },
  {
    id: 5,
    name: "D205",
    buildingName: "Business Administration Building",
    capacity: 30,
    type: "Conference Room",
    equipment: ["Conference Table", "TV", "AC"],
    isAvailable: false,
    floor: 2
  }
];

export const roomsPage = (req, res) => {
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Rooms", url: "/rooms" }
  ];
  
  // Get unique buildings for filter dropdown
  const buildings = [...new Set(mockRooms.map(room => room.buildingName))];
  
  res.render("rooms", {
    title: "Rooms",
    rooms: mockRooms,
    buildings: buildings
  });
};

export const roomDetailPage = (req, res) => {
  const roomId = parseInt(req.params.id);
  const room = mockRooms.find(r => r.id === roomId);
  
  if (!room) {
    req.flash("error_msg", "Room not found");
    return res.redirect("/rooms");
  }
  
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Rooms", url: "/rooms" },
    { label: room.name, url: `/rooms/${room.id}` }
  ];
  
  res.render("room", {
    title: `Room ${room.name}`,
    room: room
  });
};