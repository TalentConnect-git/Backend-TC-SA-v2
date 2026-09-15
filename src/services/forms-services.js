// services/forms-services.js
import Form from "../models/form-model.js";
import Student from "../models/user-model.js";
import School from "../models/school-model.js";
import StudentApplication from "../models/application-model.js";
import { createNotificationService } from "./notification-services.js";

/**
 * Get forms for a studId (all forms created by that account).
 * Optional `status` to filter.
 */
export const getFormsByStudentService = async (studId, status) => {
  const query = { studId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'applicationId', select: 'name studId' })
    .populate({ path: 'schoolId', select: 'name schoolMode genderType shifts state city' })
    .populate({ path: 'studId', select: 'name' })
    .sort({ createdAt: -1 });

  return forms;
};

/**
 * Get forms submitted to a school (optionally filtered by status).
 */
export const getFormsBySchoolService = async (schoolId, status) => {
  const query = { schoolId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'applicationId', select: 'name studId' })
    .populate({ path: 'studId', select: 'name email' })
    .sort({ createdAt: -1 });

  return forms;
};

export const trackFormService = async (formId) => {
  const form = await Form.findById(formId)
    .populate({ path: "schoolId", select: "name" })
    .populate({ path: "studId", select: "pdfFile" })
    .populate({ path: "applicationId", select: "name" });

  if (!form) throw { status: 404, message: "Form not found" };
  return form;
};

export const getFormDetailsService = async (formId) => {
  const form = await Form.findById(formId)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'schoolId', select: 'name schoolMode genderType shifts state city' })
    .populate({ path: 'studId', select: 'name email contactNo dateOfBirth gender' })
    .populate({ path: 'applicationId' });

  if (!form) throw { status: 404, message: "Form not found" };
  return form;
};

/**
 * Submit a single form to a school.
 * Prefer `applicationId` if provided (ties the form to a particular StudentApplication),
 * otherwise fallback to old behavior using studId only.
 *
 * @param {ObjectId} formId - pdf/form template id
 * @param {ObjectId} schoolId
 * @param {ObjectId} studId - account owner
 * @param {ObjectId|null} applicationId - StudentApplication _id (optional)
 */
export const submitFormService = async (formId, schoolId, studId, applicationId = null, amount) => {
  // Validate student & school exist
  const student = await Student.findById(studId);
  if (!student) throw { status: 404, message: "Student not found" };

  const school = await School.findById(schoolId);
  if (!school) throw { status: 404, message: "School not found" };

  // If applicationId provided, ensure it exists and belongs to studId
  if (applicationId) {
    const app = await StudentApplication.findById(applicationId);
    if (!app) throw { status: 404, message: "Student application not found" };
    if (app.studId.toString() !== studId.toString()) {
      throw { status: 400, message: "applicationId does not belong to the studId" };
    }
  }

  // Check existing submission (prefer applicationId)
  let existingForm;
  if (applicationId) {
    existingForm = await Form.findOne({ applicationForm: formId, schoolId, applicationId });
  } else {
    existingForm = await Form.findOne({ applicationForm: formId, schoolId, studId });
  }
  if (existingForm) throw { status: 409, message: "Form already submitted to this school for this application" };

  const form = await Form.create({ applicationForm: formId, schoolId, studId, applicationId: applicationId || null, amount });

  // Notification
  await createNotificationService({
    title: `Form Submitted`,
    body: `You have successfully submitted a form to ${school.name}`,
    authId: student.authId,
    notificationType: 'Submitted'
  });

  return form;
};

/**
 * Bulk submit: `forms` is array of schoolIds.
 * Optional `applicationId` to submit for a particular StudentApplication.
 */
export const submitBulkFormsService = async (studId, forms, formId, applicationId = null) => {
  if (!Array.isArray(forms) || forms.length === 0) {
    throw { status: 400, message: "Forms must be a non-empty array" };
  }

  const submittedForms = [];
  for (const schoolId of forms) {
    // check duplicates per school
    let existing;
    if (applicationId) {
      existing = await Form.findOne({ applicationForm: formId, schoolId, applicationId });
    } else {
      existing = await Form.findOne({ applicationForm: formId, schoolId, studId });
    }
    if (existing) continue; // skip duplicate
    const created = await Form.create({ applicationForm: formId, schoolId, studId, applicationId: applicationId || null });
    submittedForms.push(created);
  }

  return submittedForms;
};

/**
 * Update status (and optional interview note)
 */
export const updateFormStatusService = async (formId, status, note) => {
  const updateData = { status };
  if ((status === 'Interview' || status === 'WrittenExam') && note) {
    updateData.interviewNote = note;
  }

  const form = await Form.findByIdAndUpdate(formId, updateData, { new: true });
  if (!form) throw { status: 404, message: "Form not found" };

  const student = await Student.findById(form.studId);
  if (!student) throw { status: 404, message: "Student not found for this form" };

  const school = await School.findById(form.schoolId);
  if (!school) throw { status: 404, message: "School not found for this form" };

  switch (status) {
    case 'Accepted':
      await createNotificationService({ title: 'Application Accepted', body: `Your application to ${school.name} has been accepted`, authId: student.authId, notificationType: 'Accepted' });
      break;
    case 'Rejected':
      await createNotificationService({ title: 'Application Rejected', body: `Your application to ${school.name} has been rejected`, authId: student.authId, notificationType: 'Rejected' });
      break;
    case 'Reviewed':
      await createNotificationService({ title: 'Application Under Review', body: `Your application to ${school.name} is under review`, authId: student.authId, notificationType: 'Reviewed' });
      break;
    case 'Interview':
      await createNotificationService({
        title: 'Interview Invitation',
        body: `You've been invited for an interview at ${school.name}. Note: "${note}"`,
        authId: student.authId,
        notificationType: 'Interview'
      });
      break;
    case 'WrittenExam':
      await createNotificationService({
        title: 'Written Exam Invitation',
        body: `You've been invited for a Written Exam at ${school.name}. Note: "${note}"`,
        authId: student.authId,
        notificationType: 'WrittenExam'
      });
      break;
    default:
      break;
  }

  return form;
};

export const deleteFormService = async (formId) => {
  const result = await Form.findByIdAndDelete(formId);
  if (!result) throw { status: 404, message: "Form not found" };
  return result;
};

/**
 * Check if a form is applied:
 * Prefer applicationId (if provided) otherwise fallback to studId.
 * Returns { isApplied: true, formId, status }
 */
export const getIsFormApplied = async (studId, schoolId, applicationId = null) => {
  let query;
  if (applicationId) {
    query = { applicationId, schoolId };
  } else {
    query = { studId, schoolId };
  }

  const form = await Form.findOne(query);
  if (!form) throw { status: 404, message: "No form application found for this student and school" };
  return { isApplied: true, formId: form._id, status: form.status };
};


export const getFormsByApplicationService = async (applicationId, status = null) => {
  if (!applicationId) {
    throw { status: 400, message: "applicationId is required" };
  }

  const query = { applicationId };
  if (status) query.status = status;

  const forms = await Form.find(query)
    .populate({ path: 'applicationForm', select: 'pdfFile' })
    .populate({ path: 'applicationId', select: 'name studId' })
    .populate({ path: 'schoolId', select: 'name schoolMode genderType shifts state city' })
    .populate({ path: 'studId', select: 'name email' })
    .sort({ createdAt: -1 });

  return forms;
};