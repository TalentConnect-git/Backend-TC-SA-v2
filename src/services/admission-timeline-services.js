import mongoose from 'mongoose';
import AdmissionTimeline from '../models/admission-timeline-model.js';

/**
 * Adds a new admission timeline for a school.
 */
export const addAdmissionTimelineService = async (data) => {
  const newTimeline = new AdmissionTimeline(data);
  return await newTimeline.save();
};


export const getAmountService = async ({ schoolId, admissionLevel }) => {
  // convert to ObjectId safely
  const objectId = mongoose.Types.ObjectId.isValid(schoolId)
    ? new mongoose.Types.ObjectId(schoolId)
    : null;

  if (!objectId) {
    throw new Error('Invalid schoolId');
  }

  const model = await AdmissionTimeline.findOne({ schoolId: objectId });

  if (!model) {
    throw new Error("No admission timelines found for this school.");
  }

  const timelineEntry = model.timelines.find(
    (entry) => entry.eligibility?.admissionLevel === admissionLevel
  );

  if (!timelineEntry) {
    throw new Error("No timeline found for the specified admission level.");
  }

  return timelineEntry.applicationFee;
};


/**
 * Retrieves the admission timeline by schoolId.
 */
export const getAdmissionTimelineBySchoolIdService = async (schoolId) => {
  return await AdmissionTimeline.findOne({ schoolId });
};

/**
 * Updates the admission timeline by schoolId.
 */
export const updateAdmissionTimelineService = async (schoolId, updateData) => {
  return await AdmissionTimeline.findOneAndUpdate(
    { schoolId },
    { $set: updateData },
    { new: true, runValidators: true }
  );
};