
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
    
import express from "express";
import { homePage } from "../controllers/homeController.js";
import { loginPage, registerPage, forgotPasswordPage, dashboardPage, loginUser, registerUser, logoutUser } from "../controllers/authController.js";
import { collegesPage, collegeDetailPage, newCollegePage } from "../controllers/collegeController.js";
import { buildingsPage, buildingDetailPage } from "../controllers/buildingController.js";
import { roomsPage, roomDetailPage } from "../controllers/roomController.js";
import { schedulesPage, scheduleDetailPage, newSchedulePage } from "../controllers/scheduleController.js";

const router = express.Router();

// Home routes
router.get("/", homePage);

// Auth routes
router.get("/login", loginPage);
router.post("/login", loginUser);
router.get("/register", registerPage);
router.post("/register", registerUser);
router.get("/forgot-password", forgotPasswordPage);
router.get("/dashboard", dashboardPage);
router.get("/logout", logoutUser);

// College routes
router.get("/colleges", collegesPage);
router.get("/colleges/new", newCollegePage);
router.get("/colleges/:id", collegeDetailPage);

// Building routes
router.get("/buildings", buildingsPage);
router.get("/buildings/:id", buildingDetailPage);

// Room routes
router.get("/rooms", roomsPage);
router.get("/rooms/:id", roomDetailPage);

// Schedule routes
router.get("/schedules", schedulesPage);
router.get("/schedules/new", newSchedulePage);
router.get("/schedules/:id", scheduleDetailPage);

export default router;
