import mongoose from 'mongoose';

const StudentApplicationSchema = new mongoose.Schema({

  studId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  motherTongue: { type: String, required: true },
  placeOfBirth: { type: String, default: null },
  speciallyAbled: { type: Boolean, default: false },
  standard: { type: String, required: true, enum: ['kg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'] },
  speciallyAbledType: {
    type: String,
    default: null
  },
  nationality: { type: String, required: true },
  religion: { type: String, required: true },
  caste: { type: String, required: true },
  subcaste: { type: String, default: null },
  aadharNo: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  allergicTo: { type: String, default: null },
  interest: { type: String, required: true },

  // Last school/play school [if attended]
  lastSchoolName: { type: String, default: null },
  classCompleted: { type: String, default: null },
  lastAcademicYear: { type: String, default: null },
  reasonForLeaving: { type: String, default: null },
  board: { type: String, default: null },

  // Father Details
  fatherName: { type: String, required: true },
  fatherAge: { type: Number, required: true },
  fatherQualification: { type: String, required: true },
  fatherProfession: { type: String, required: true },
  fatherAnnualIncome: { type: String, required: true },
  fatherPhoneNo: { type: String, required: true },
  fatherAadharNo: { type: String, required: true },
  fatherEmail: { type: String, required: true },

  // Mother Details
  motherName: { type: String, required: true },
  motherAge: { type: Number, required: true },
  motherQualification: { type: String, required: true },
  motherProfession: { type: String, required: true },
  motherAnnualIncome: { type: String, required: true },
  motherPhoneNo: { type: String, required: true },
  motherAadharNo: { type: String, required: true },
  motherEmail: { type: String, required: true },

  relationshipStatus: { type: String, enum: ['Married', 'Divorced', 'Single Mother', 'Single Father', 'Widowed', 'Other'], required: true },

  // if divorced
  guardianName: { type: String, default: null },
  guardianContactNo: { type: String, default: null },
  guardianRelationToStudent: { type: String, default: null },
  guardianQualification: { type: String, default: null },
  guardianProfession: { type: String, default: null },
  guardianEmail: { type: String, default: null },
  guardianAadharNo: { type: String, default: null },

  presentAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },

  // Sibling Info (Array of objects)
  siblings: [{
    name: String,
    age: Number,
    sex: String,
    nameOfInstitute: String,
    className: String
  }],

  homeLanguage: { type: String, required: true },
  yearlyBudget: { type: String, required: true }

  // photo: { type: String, required: true },
  // dobCertificate: { type: String, required: true },
  // casteCertificate: { type: String, required: true }, // Certificate if from reserverd category
  // reportCard: { type: String, required: true },
  // transferCertificate: { type: String, required: true },
  // migrationCertificate: { type: String, required: true },

  // fatherPhoto: { type: String, required: true }, 
  // motherPhoto: { type: String, required: true },

}, { timestamps: true });

StudentApplicationSchema.pre('save', function (next) {
  if (this.dob) {
    const today = new Date();
    let age = today.getFullYear() - this.dob.getFullYear();
    const m = today.getMonth() - this.dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < this.dob.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});


const StudentApplication = mongoose.model("StudentApplication", StudentApplicationSchema);
export default StudentApplication;