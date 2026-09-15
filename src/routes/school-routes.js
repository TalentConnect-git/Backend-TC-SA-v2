import express from "express";
import mongoose from "mongoose";

import ensureAuthenticated from "../middlewares/validate-token-middleware.js";
import {
  addSchool, getSchoolById, getSchoolsByStatus, getNearbySchools, updateSchoolInfo, deleteSchool, uploadSchoolPhotos,
  uploadSchoolVideo,
  deleteSchoolPhoto,
  deleteSchoolVideo,
  getSchoolPhoto,
  getSchoolVideos,
  getSchoolPhotos,
  getTotalSchoolsCount,
  uploadSchoolLogo,
  getSchoolLogo,
  addSchoolByAuth,
  getSchoolByAuthId,
  getSchoolVideo,
  getStudentsCount,
  reverseGeocodeSchoolController,
} from '../controllers/school-controllers.js';
import {
  addTechnologyAdoption,
  getTechnologyAdoptionById,
  updateTechnologyAdoption
} from '../controllers/technology-adoption-controllers.js';
import {
  addInternationalExposure,
  getInternationalExposureById,
  updateInternationalExposure
} from '../controllers/international-exposure-controllers.js';
import {
  addSafetyAndSecurity,
  getSafetyAndSecurityById,
  updateSafetyAndSecurity
} from '../controllers/safety-security-controllers.js';
import { addAmenities, getAmenitiesById, updateAmenities } from '../controllers/amenities-controllers.js';
import { addActivities, getActivitiesById, updateActivities } from '../controllers/activities-controllers.js';
import { addAlumni, getAlumniBySchool, deleteAlumniBySchool, updateAlumniBySchool } from '../controllers/alumni-controllers.js';
import { searchSchool } from '../controllers/search-controllers.js';
import { compareSchools } from "../controllers/compare-controllers.js";
import { getSchoolByFeeRange, getSchoolByShift } from '../controllers/filter-controllers.js';
import { getSchoolCardData } from "../controllers/card-controllers.js";
import { addInfrastructure, getInfrastructureById, updateInfrastructure } from '../controllers/infrastructure-controllers.js';
import { addOtherDetails, getOtherDetailsById, updateOtherDetails } from '../controllers/other-detail-controller.js';
import {
  addFeesAndScholarships,
  getFeesAndScholarshipsById,
  updateFeesAndScholarships
} from '../controllers/fees-scholarship-controllers.js';
import {
  addAcademics,
  getAcademicsById,
  updateAcademics
} from '../controllers/academic-controllers.js';
import { addSupport, getSupportByStudId, getSupportBySupId, deleteSupportBySupId } from '../controllers/support-controllers.js';
import { predictSchools } from "../controllers/predictor-controllers.js";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
} from "../controllers/blog-controllers.js";
import {
  addAdmissionTimeline,
  getAdmissionTimelineById,
  updateAdmissionTimeline
} from '../controllers/admission-timeline-controllers.js';
import {
  addFaculty,
  getFacultyById,
  updateFaculty
} from '../controllers/faculty-controllers.js';
import { adminLogin } from '../controllers/admin-controllers.js';
import { photoUpload, videoUpload, logoUpload } from '../../config/multer.js';

const router = express.Router();

// Schools
router.get('/schools/reverse-geocode', reverseGeocodeSchoolController);
router.get('/reverse-geocode', reverseGeocodeSchoolController);
router.post('/schools/', addSchool);
router.get('/schools/status/:status', getSchoolsByStatus);
router.get('/schools/nearby', getNearbySchools);
router.get("/count", getStudentsCount);
router.get('/schools/:id', getSchoolById);
router.put('/schools/:id', updateSchoolInfo);
router.delete('/schools/:id', deleteSchool);
router.post('/schools/:authId', addSchoolByAuth);    // create and attach authId
router.get('/schools/auth/:authId', getSchoolByAuthId);


router.post('/:id/upload/photos', photoUpload.array('files', 4), uploadSchoolPhotos); // 5MB limit
router.post('/:id/upload/video', videoUpload.single('file'), uploadSchoolVideo); // 20MB limit
router.delete('/:id/photo/:publicId', deleteSchoolPhoto);
router.post('/:id/upload/logo', logoUpload.single('logo'), uploadSchoolLogo);
router.get('/:id/logo', getSchoolLogo);
router.delete('/:id/video/:publicId', deleteSchoolVideo);

router.get('/:id/photos', getSchoolPhotos); // Get all photos
router.get('/:id/videos', getSchoolVideos); // Get all videos
router.get('/:id/photo/:publicId', getSchoolPhoto); // Get specific photo
router.get('/:id/video/:publicId', getSchoolVideo); // Get specific video


// Amenities
router.post('/schools/amenities/', addAmenities);
router.get('/schools/amenities/:id', getAmenitiesById);
router.put('/schools/amenities/:id', updateAmenities);

// Activities
router.post('/schools/activities/', addActivities);
router.get('/schools/activities/:id', getActivitiesById);
router.put('/schools/activities/:id', updateActivities);

//Alumni
router.post("/alumnus", ensureAuthenticated, addAlumni);
router.get("/alumnus/:id", getAlumniBySchool);
router.put("/alumnus/:id", ensureAuthenticated, updateAlumniBySchool);
router.delete("/alumnus/:id", ensureAuthenticated, deleteAlumniBySchool);

//infrastruture
router.post('/schools/infrastructure/', addInfrastructure);
router.get('/schools/infrastructure/:id', getInfrastructureById);
router.put('/schools/infrastructure/:id', updateInfrastructure);

//other-details
router.post('/schools/other-details/', addOtherDetails);
router.get('/schools/other-details/:id', getOtherDetailsById);
router.put('/schools/other-details/:id', updateOtherDetails);

//acedmics-details
router.post('/schools/academics/', addAcademics);
router.get('/schools/academics/:id', getAcademicsById);
router.put('/schools/academics/:id', updateAcademics);

//feesAndScholarship-details
router.post('/schools/fees-scholarships/', addFeesAndScholarships);
router.get('/schools/fees-scholarships/:id', getFeesAndScholarshipsById);
router.put('/schools/fees-scholarships/:id', updateFeesAndScholarships);

//technologyAndAdoption-details
router.post('/schools/technology-adoption/', addTechnologyAdoption);
router.get('/schools/technology-adoption/:id', getTechnologyAdoptionById);
router.put('/schools/technology-adoption/:id', updateTechnologyAdoption);

//safety-security-details
router.post('/schools/safety-security/', addSafetyAndSecurity);
router.get('/schools/safety-security/:id', getSafetyAndSecurityById);
router.put('/schools/safety-security/:id', updateSafetyAndSecurity);

//international-exposure-details
router.post('/schools/international-exposure/', addInternationalExposure);
router.get('/schools/international-exposure/:id', getInternationalExposureById);
router.put('/schools/international-exposure/:id', updateInternationalExposure);

//faculty
router.post('/schools/faculty/', addFaculty);
router.get('/schools/faculty/:id', getFacultyById);
router.put('/schools/faculty/:id', updateFaculty);

//admission-timeline
router.post('/schools/admission-timeline/', addAdmissionTimeline);
router.get('/schools/admission-timeline/:id', getAdmissionTimelineById);
router.put('/schools/admission-timeline/:id', updateAdmissionTimeline);

//admin
router.post('/admin-login', adminLogin);

//Searching Schools
router.get("/search", searchSchool);
router.post("/compare", compareSchools);
router.get('/filter-feeRange', getSchoolByFeeRange);
router.get('/filter-Shift', getSchoolByShift);

router.get("/card/:id", getSchoolCardData);

router.post('/support', ensureAuthenticated, addSupport);
router.get('/support/:studId', getSupportByStudId);
router.get('/support-id/:supportId', getSupportBySupId);
router.delete('/support/:supportId', ensureAuthenticated, deleteSupportBySupId);


router.get('/count/all', getTotalSchoolsCount);

router.post('/predict-schools', predictSchools);

router.post("/blogs", createBlog);
router.get("/blogs", getAllBlogs);
router.get("/blogs/:id", getBlogById);

export default router;