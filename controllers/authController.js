
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
    
import bcrypt from "bcrypt";
import { User, sequelize } from "../models/userModel.js";
await sequelize.sync();

export const loginPage = (req, res) => res.render("login", { title: "Login" });
export const registerPage = (req, res) => res.render("register", { title: "Register" });
export const forgotPasswordPage = (req, res) => res.render("forgotpassword", { title: "Forgot Password" });
export const dashboardPage = (req, res) => {
  if (!req.session.userId) return res.redirect("/login");
  
  // Mock data for dashboard - replace with real database queries later
  const stats = {
    colleges: 8,
    buildings: 25,
    rooms: 120,
    activeSchedules: 15
  };
  
  const upcoming = [
    {
      subjectCode: "CS101",
      subjectTitle: "Introduction to Computer Science",
      roomName: "A101",
      startTime: "08:00 AM",
      endTime: "10:00 AM",
      status: "Scheduled"
    },
    {
      subjectCode: "MATH201",
      subjectTitle: "Calculus II",
      roomName: "B205",
      startTime: "10:30 AM",
      endTime: "12:00 PM",
      status: "Scheduled"
    },
    {
      subjectCode: "ENG102",
      subjectTitle: "Technical Writing",
      roomName: "C301",
      startTime: "01:00 PM",
      endTime: "02:30 PM",
      status: "Scheduled"
    }
  ];
  
  res.render("dashboard", { 
    title: "Dashboard",
    stats: stats,
    upcoming: upcoming
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.send("User not found");
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("Incorrect password");
  req.session.userId = user.id;
  res.redirect("/dashboard");
};

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  req.session.userId = user.id;
  res.redirect("/dashboard");
};

export const logoutUser = (req, res) => {
  req.session.destroy();
  res.redirect("/login");
};
