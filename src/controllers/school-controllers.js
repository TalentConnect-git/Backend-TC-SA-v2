import {
  addSchoolService,
  getSchoolByIdService,
  getSchoolsByStatusService,
  updateSchoolInfoService,
  deleteSchoolService,
  uploadSchoolPhotosService,
  uploadSchoolVideoService,
 getSchoolByAuthIdService,      // <-- service
  addSchoolByAuthService,

  deleteSchoolPhotoService,
  deleteSchoolVideoService,
  getSchoolPhotoService,
  getSchoolPhotosService,
  getSchoolVideoService,
  getNearbySchoolsService,
  getTotalSchoolsCountService,
    getStudentsCountService,
   uploadSchoolLogoService ,
     getSchoolLogoService,
  getSchoolVideosService,
  getSchoolScoreByIdService
} from '../services/school-services.js';
import { toSchoolCardModels } from '../utils/utils.js';

import mongoose from "mongoose";


export const addSchoolByAuth = async (req, res) => {
  try {
    const { authId } = req.params;
    if (!authId || !mongoose.Types.ObjectId.isValid(authId)) {
      return res.status(400).json({ status: 'Failed', message: 'Invalid or missing authId in params' });
    }

    const payload = { ...req.body };
    delete payload.authId; // prevent override

    const savedSchool = await addSchoolByAuthService(authId, payload);

    return res.status(201).json({ status: 'success', message: 'School added successfully', data: savedSchool });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ status: 'Failed', message: error.message });
  }
};

// ---------- Controller: get schools by authId (GET /schools/auth/:authId) ----------
export const getSchoolByAuthId = async (req, res) => {
  try {
    const { authId } = req.params;
    if (!authId || !mongoose.Types.ObjectId.isValid(authId)) {
      return res.status(400).json({ status: 'Failed', message: 'Invalid or missing authId in params' });
    }

    const schools = await getSchoolByAuthIdService(authId);
    return res.status(200).json({ status: 'success', message: 'School fetched successfully', data: schools });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ status: 'Failed', message: error.message });
  }
};

export const getSchoolLogo = async (req, res) => {
  try {
    const logo = await getSchoolLogoService(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Logo retrieved successfully',
      data: logo
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};
// Add school
export const addSchool = async (req, res) => {
  try {
    const saveSchool = await addSchoolService(req.body);
    
    res.status(201).json({
      status: "success",
      message: "School added successfully",
      data: saveSchool
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Failed', 
      message: error.message 
    });
  }
};

// GET /count
export const getStudentsCount = async (req, res) => {
  try {
    const totalStudents = await getStudentsCountService();

    res.status(200).json({
      status: "success",
      totalStudents
    });
  } catch (err) {
    res.status(err.status||500).json({ 
      status: "failed", 
      message: err.message 
    });
  }
};

export const uploadSchoolPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'Failed',
        message: 'No files uploaded'
      });
    }

    // Check if more than 4 files
    if (req.files.length > 4) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Maximum 4 photos allowed per upload'
      });
    }

    const school = await uploadSchoolPhotosService(req.params.id, req.files);
    
    res.status(200).json({
      status: 'success',
      message: 'Photos uploaded successfully',
      data: school
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};
export const getTotalSchoolsCount = async (req, res) => {
  try {
    const count = await getTotalSchoolsCountService();
    
    res.status(200).json({
      status: 'success',
      message: 'Total schools count fetched successfully',
      totalSchools: count
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};
export const uploadSchoolLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'Failed',
        message: 'No file uploaded'
      });
    }

    const school = await uploadSchoolLogoService(req.params.id, req.file);

    res.status(200).json({
      status: 'success',
      message: 'Logo uploaded successfully',
      data: school
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Upload school video (single)
export const uploadSchoolVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'Failed',
        message: 'No file uploaded'
      });
    }
    
    const school = await uploadSchoolVideoService(req.params.id, req.file);
    
    res.status(200).json({
      status: 'success',
      message: 'Video uploaded successfully',
      data: school
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};
// Get school by Id 
export const getSchoolById = async (req, res) => {
  try {
    const school = await getSchoolByIdService(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'School fetched successfully',
      data: school
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Get school by status
export const getSchoolsByStatus = async (req, res) => {
  try {
    const { status } = req.params; 
    const filters = req.query || {};
    
    const schools = await getSchoolsByStatusService(status, filters);
    
    res.status(200).json({
      status: 'success',
      message: `Fetched schools with status: ${status}`,
      data: schools
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Update school info 
export const updateSchoolInfo = async (req, res) => {
  try {
    const updatedSchool = await updateSchoolInfoService(req.params.id, req.body);
    
    res.status(200).json({ 
      status: "success",
      message: 'School info updated successfully', 
      data: updatedSchool 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Failed', 
      message: error.message 
    });
  }
};

// Delete school 
export const deleteSchool = async (req, res) => {
  try {
    const deletedSchool = await deleteSchoolService(req.params.id);
    
    res.status(200).json({
      status: "success",
      message: "School deleted successfully",
      data: deletedSchool
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: error.message
    });
  }
};

// Delete school photo
export const deleteSchoolPhoto = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const school = await deleteSchoolPhotoService(id, publicId);
    
    res.status(200).json({
      status: "success",
      message: "Photo deleted successfully",
      data: school
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Failed",
      message: error.message
    });
  }
};

// Delete school video
export const deleteSchoolVideo = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    const school = await deleteSchoolVideoService(id, publicId);
    
    res.status(200).json({
      status: "success",
      message: "Video deleted successfully",
      data: school
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Failed",
      message: error.message
    });
  }
};

// In school-controllers.js

// Get all photos for a school
export const getSchoolPhotos = async (req, res) => {
  try {
    const photos = await getSchoolPhotosService(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Photos retrieved successfully',
      count: photos.length,
      data: photos
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Get all videos for a school
export const getSchoolVideos = async (req, res) => {
  try {
    const videos = await getSchoolVideosService(req.params.id);
    
    res.status(200).json({
      status: 'success',
      message: 'Videos retrieved successfully',
      count: videos.length,
      data: videos
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Get specific photo by publicId
export const getSchoolPhoto = async (req, res) => {
  try {
    const photo = await getSchoolPhotoService(req.params.id, req.params.publicId);
    
    res.status(200).json({
      status: 'success',
      message: 'Photo retrieved successfully',
      data: photo
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// Get specific video by publicId
export const getSchoolVideo = async (req, res) => {
  try {
    const video = await getSchoolVideoService(req.params.id, req.params.publicId);
    
    res.status(200).json({
      status: 'success',
      message: 'Video retrieved successfully',
      data: video
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

// --- UPDATE THIS CONTROLLER FUNCTION ---
export const getNearbySchools = async (req, res) => {
  try {
    // 1. Get 'state' from the query parameters as well
    const { lat, lon, state } = req.query;

    if (!lat || !lon || !state) {
      return res.status(400).json({ message: 'Latitude, longitude, and state are required.' });
    }

    // 2. Pass all three parameters to the service
    const schools = await getNearbySchoolsService(parseFloat(lon), parseFloat(lat), state);

    const mappedSchools = await toSchoolCardModels(schools);

    res.status(200).json({
      status: 'success',
      message: 'Fetched nearby schools successfully',
      data: mappedSchools
    });

  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

export const getSchoolScoreById = async (schoolId) => {
  try{
    const {score} = await getSchoolScoreByIdService(schoolId);

    return score;

  }catch(err){
    return 0;
  }
};

/* REVERSE GEOCODE */
export const reverseGeocodeSchoolController = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    const latitude = Number(lat).toFixed(6);
    const longitude = Number(lon).toFixed(6);

    let city = "";
    let state = "";
    let country = "India";
    let pincode = "";
    let area = "";
    let address = "";

    // 1. Try Nominatim with timeout and custom User-Agent
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          "User-Agent": "SynzySchoolApp/1.0 (contact@synzy.com)",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
        state = addr.state || "";
        country = addr.country || "India";
        pincode = addr.postcode || "";
        area = addr.suburb || addr.neighbourhood || addr.locality || addr.district || "";
        const street = [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(" ");
        address = [street, area, city, state, pincode].filter(Boolean).join(", ") || data.display_name || "";
      }
    } catch (nomErr) {
      console.warn("Nominatim reverse geocode failed, trying fallbacks:", nomErr.message);
    }

    // 2. Fallback to Photon if pincode or city or address is missing
    if (!pincode || !city || !address) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const photonRes = await fetch(
          `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (photonRes.ok) {
          const photonData = await photonRes.json();
          const props = photonData?.features?.[0]?.properties;
          if (props) {
            if (!pincode && props.postcode) pincode = String(props.postcode);
            if (!city) city = props.city || props.district || props.county || props.locality || "";
            if (!state) state = props.state || "";
            if (!country) country = props.country || "India";
            if (!area) area = props.locality || props.district || props.county || "";
            if (!address && (props.street || props.name)) {
              address = [props.name, props.street, area, city, state, pincode].filter(Boolean).join(", ");
            }
          }
        }
      } catch (photonErr) {
        console.warn("Photon fallback failed:", photonErr.message);
      }
    }

    // 3. Fallback to BigDataCloud for administrative boundaries (city, state, country)
    if (!city || !state || !pincode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const bdcRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (bdcRes.ok) {
          const bdcData = await bdcRes.json();
          if (bdcData) {
            if (!city) city = bdcData.city || bdcData.locality || "";
            if (!state) state = bdcData.principalSubdivision || "";
            if (!country) country = bdcData.countryName || "India";
            if (!pincode && bdcData.postcode) pincode = String(bdcData.postcode);
            if (!area && bdcData.locality) area = bdcData.locality;
          }
        }
      } catch (bdcErr) {
        console.warn("BigDataCloud fallback failed:", bdcErr.message);
      }
    }

    // Ensure address is non-empty if we have area/city/state
    if (!address) {
      address = [area, city, state, pincode].filter(Boolean).join(", ");
    }

    return res.status(200).json({
      success: true,
      status: "success",
      data: {
        latitude,
        longitude,
        address,
        area,
        city,
        state,
        country: country || "India",
        pincode,
      },
    });
  } catch (error) {
    console.error("Reverse geocoding school controller error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};