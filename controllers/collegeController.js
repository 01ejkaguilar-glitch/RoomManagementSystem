/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Mindoro State University - Philippines

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Mock data - replace with database queries later
const mockColleges = [
  {
    id: 1,
    name: "College of Information Technology",
    abbreviation: "CIT",
    description: "Leading college in computer science and information technology education.",
    buildingCount: 3,
    established: "2010"
  },
  {
    id: 2,
    name: "College of Engineering",
    abbreviation: "COE",
    description: "Excellence in engineering education and research.",
    buildingCount: 4,
    established: "2005"
  },
  {
    id: 3,
    name: "College of Business Administration",
    abbreviation: "CBA",
    description: "Developing future business leaders and entrepreneurs.",
    buildingCount: 2,
    established: "2008"
  },
  {
    id: 4,
    name: "College of Arts and Sciences",
    abbreviation: "CAS",
    description: "Liberal arts education with diverse academic programs.",
    buildingCount: 5,
    established: "2000"
  }
];

export const collegesPage = (req, res) => {
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Colleges", url: "/colleges" }
  ];
  
  res.render("colleges", {
    title: "Colleges",
    colleges: mockColleges
  });
};

export const collegeDetailPage = (req, res) => {
  const collegeId = parseInt(req.params.id);
  const college = mockColleges.find(c => c.id === collegeId);
  
  if (!college) {
    req.flash("error_msg", "College not found");
    return res.redirect("/colleges");
  }
  
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Colleges", url: "/colleges" },
    { label: college.name, url: `/colleges/${college.id}` }
  ];
  
  res.render("college", {
    title: college.name,
    college: college
  });
};

export const newCollegePage = (req, res) => {
  res.locals.breadcrumbs = [
    { label: "Dashboard", url: "/dashboard" },
    { label: "Colleges", url: "/colleges" },
    { label: "New College", url: "/colleges/new" }
  ];
  
  res.render("colleges/new", {
    title: "Add New College"
  });
};