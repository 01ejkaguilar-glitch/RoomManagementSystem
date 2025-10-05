/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines
*/

// Mock data grouped by college
const mockBuildings = [
  {
    id: 1,
    name: "IT Main Building",
    collegeId: 1,
    collegeName: "College of Information Technology",
    roomCount: 15,
    floors: 3,
    year_built: "2012"
  },
  {
    id: 2,
    name: "IT Laboratory Building",
    collegeId: 1,
    collegeName: "College of Information Technology",
    roomCount: 8,
    floors: 2,
    year_built: "2015"
  },
  {
    id: 3,
    name: "Engineering Complex A",
    collegeId: 2,
    collegeName: "College of Engineering",
    roomCount: 20,
    floors: 4,
    year_built: "2008"
  },
  {
    id: 4,
    name: "Engineering Complex B",
    collegeId: 2,
    collegeName: "College of Engineering",
    roomCount: 18,
    floors: 4,
    year_built: "2010"
  },
  {
    id: 5,
    name: "Business Administration Building",
    collegeId: 3,
    collegeName: "College of Business Administration",
    roomCount: 12,
    floors: 3,
    year_built: "2009"
  }
];

// Group buildings by college
const groupBuildingsByCollege = () => {
  const grouped = {};
  mockBuildings.forEach(building => {
    if (!grouped[building.collegeName]) {
      grouped[building.collegeName] = [];
    }
    grouped[building.collegeName].push(building);
  });
  return grouped;
};

export const buildingsPage = (req, res) => {
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Buildings", url: "/buildings" }
  ];
  
  const buildingsByCollege = groupBuildingsByCollege();
  
  res.render("buildings", {
    title: "Buildings",
    buildingsByCollege: buildingsByCollege
  });
};

export const buildingDetailPage = (req, res) => {
  const buildingId = parseInt(req.params.id);
  const building = mockBuildings.find(b => b.id === buildingId);
  
  if (!building) {
    req.flash("error_msg", "Building not found");
    return res.redirect("/buildings");
  }
  
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Buildings", url: "/buildings" },
    { label: building.name, url: `/buildings/${building.id}` }
  ];
  
  res.render("building", {
    title: building.name,
    building: building
  });
};