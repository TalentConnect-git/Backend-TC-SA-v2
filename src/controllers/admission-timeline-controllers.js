import {
  addAdmissionTimelineService,
  getAdmissionTimelineBySchoolIdService,
  updateAdmissionTimelineService,
  getAmountService
} from '../services/admission-timeline-services.js';

/**
 * Controller to add admission timeline details.
 */
export const addAdmissionTimeline = async (req, res) => {
  try {
    const newTimeline = await addAdmissionTimelineService(req.body);
    res.status(201).json({
      status: "success",
      message: "Admission timeline added successfully",
      data: newTimeline
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

export const getApplicationFee = async (req, res) => {
  try {
    const { schoolId, admissionLevel } = req.params; // you're using params in your route

    if (!schoolId || !admissionLevel) {
      return res.status(400).json({
        status: "failed",
        message: "schoolId and admissionLevel are required."
      });
    }

    // pass an object to match service signature
    const fee = await getAmountService({ schoolId, admissionLevel });

    // service throws if not found, so fee should be a number here
    res.status(200).json({
      status: "success",
      message: "Application fee fetched successfully",
      data: { applicationFee: fee }
    });

  } catch (error) {
    // If you want to send 404 for not found use custom error types or parse message
    const isNotFound = /No (admission timelines|timeline) found/i.test(error.message);
    return res.status(isNotFound ? 404 : 500).json({
      status: "Failed",
      message: error.message
    });
  }
};

export const getAdmissionTimelineById = async (req, res) => {
  try {
    const { id: schoolId } = req.params;
    const timeline = await getAdmissionTimelineBySchoolIdService(schoolId);

    if (!timeline) {
      return res.status(404).json({
        status: 'failed',
        message: 'Admission timeline not found for this school.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Admission timeline fetched successfully',
      data: timeline
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};

/**
 * Controller to update admission timeline details.
 */
export const updateAdmissionTimeline = async (req, res) => {
  try {
    const { id: schoolId } = req.params;
    const updatedTimeline = await updateAdmissionTimelineService(schoolId, req.body);

    if (!updatedTimeline) {
      return res.status(404).json({
        status: 'failed',
        message: 'Timeline not found for this school. Please add it first.'
      });
    }

    res.status(200).json({
      status: "success",
      message: "Admission timeline updated successfully",
      data: updatedTimeline
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message
    });
  }
};