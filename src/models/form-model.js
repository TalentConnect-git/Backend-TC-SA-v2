// models/form-model.js
import mongoose from "mongoose";

const FormSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'schools',
    required: true,
  },
  studId: { // keep for backward compatibility (account owner)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
    required: true,
  },
  applicationId: { // NEW - reference to StudentApplication document
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentApplication',
    default: null,
  },

  applicationForm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'pdfs',
    required: true,
  },
  
  payment: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid',
  },

  paymentInfo: {
    orderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    signature: { type: String, default: null },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed'],
      default: 'created'
    }
  },

  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected', 'Interview','WrittenExam'],
    default: 'Pending',
  },
  interviewNote: {
    type: String,
    default: null
  },
}, { timestamps: true });

const Form = mongoose.model('forms', FormSchema);
export default Form;
