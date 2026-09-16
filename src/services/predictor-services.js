import School from '../models/school-model.js';
import Activities from '../models/activities-model.js';
import { parseFeeRange, parseClassLevel } from '../utils/fee-parsing.js';

export const predictSchoolsService = async (filters) => {
  const {
    board,
    state,
    city,
    schoolMode,
    genderType,
    shifts = [],
    feeRange,
    upto,
    standard,
    specialist = [], //Optional
    languageMedium = [],
    transportAvailable,
    activities = []
  } = filters;

  const query = {
    status: 'accepted',
  };

  if (board && typeof board === 'string' && board.trim()) {
    query.board = { $regex: new RegExp(`^${board.trim()}$`, 'i') };
  }

  if (state && typeof state === 'string' && state.trim()) {
    query.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') };
  }

  if (city && typeof city === 'string' && city.trim()) {
    query.city = { $regex: new RegExp(city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
  }

  if (schoolMode && typeof schoolMode === 'string' && schoolMode.trim()) {
    query.schoolMode = { $regex: new RegExp(`^${schoolMode.trim()}$`, 'i') };
  }

  if (genderType && typeof genderType === 'string') {
    const normalizedGender = genderType.toLowerCase().trim();
    if (normalizedGender === 'boy' || normalizedGender === 'male') {
      // Boys can attend boys-only or co-educational schools
      query.genderType = { $in: ['boy', 'co-ed'] };
    } else if (normalizedGender === 'girl' || normalizedGender === 'female') {
      // Girls can attend girls-only or co-educational schools
      query.genderType = { $in: ['girl', 'co-ed'] };
    } else if (normalizedGender === 'co-ed' || normalizedGender === 'co-educational') {
      query.genderType = 'co-ed';
    }
  }

  const shiftList = Array.isArray(shifts) ? shifts : (shifts ? [shifts] : []);
  const cleanShifts = shiftList.filter(Boolean).map(s => String(s).toLowerCase().trim());
  if (cleanShifts.length > 0) {
    query.shifts = { $in: cleanShifts };
  }

  const specList = Array.isArray(specialist) ? specialist : (specialist ? [specialist] : []);
  if (specList.length > 0) {
    query.specialist = { $in: specList };
  }

  const langList = Array.isArray(languageMedium) ? languageMedium : (languageMedium ? [languageMedium] : []);
  if (langList.length > 0) {
    query.languageMedium = { $in: langList };
  }

  if (transportAvailable) {
    query.transportAvailable = transportAvailable;
  }

  let matchedSchools = await School.find(query);

  // If city was specified but yielded 0 results, fallback to matching schools across the state
  if (matchedSchools.length === 0 && city && state) {
    const fallbackQuery = { ...query };
    delete fallbackQuery.city;
    const stateMatched = await School.find(fallbackQuery);
    if (stateMatched.length > 0) {
      matchedSchools = stateMatched;
    }
  }

  // Class level filter (support both upto and standard keys)
  const targetClass = upto || standard;
  if (targetClass) {
    const userClassLevel = parseClassLevel(targetClass);
    if (userClassLevel !== null) {
      const filteredByClass = matchedSchools.filter((school) => {
        const schoolClassLevel = parseClassLevel(school.upto);
        return schoolClassLevel !== null ? schoolClassLevel >= userClassLevel : true;
      });
      if (filteredByClass.length > 0) {
        matchedSchools = filteredByClass;
      }
    }
  }

  // Fee range filter
  if (feeRange) {
    const userRange = parseFeeRange(feeRange);
    if (userRange) {
      const filteredByFee = matchedSchools.filter((school) => {
        const schoolRange = parseFeeRange(school.feeRange);
        if (!schoolRange) return true;
        return (
          schoolRange.max >= userRange.min && schoolRange.min <= userRange.max
        );
      });
      if (filteredByFee.length > 0) {
        matchedSchools = filteredByFee;
      }
    }
  }

  // Activities / Interests filter
  const activityList = Array.isArray(activities) ? activities : (activities ? [activities] : []);
  if (activityList.length > 0 && matchedSchools.length > 0) {
    const activityPatterns = activityList
      .map(a => typeof a === 'string' ? a.trim() : '')
      .filter(Boolean)
      .map(a => new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));

    if (activityPatterns.length > 0) {
      const activityDocs = await Activities.find({
        activities: { $in: activityPatterns },
        schoolId: { $in: matchedSchools.map((s) => s._id) },
      });

      const schoolIdsWithActivities = activityDocs.map((a) =>
        a.schoolId.toString()
      );

      const filteredByActivities = matchedSchools.filter((s) =>
        schoolIdsWithActivities.includes(s._id.toString())
      );

      // If schools with requested activities exist, refine the list
      if (filteredByActivities.length > 0) {
        matchedSchools = filteredByActivities;
      }
    }
  }

  return matchedSchools;
};

// import School from '../models/school-model.js';
// import Activities from '../models/activities-model.js';
// import { parseFeeRange, parseClassLevel } from '../utils/fee-parsing.js';

// export const predictSchoolsService = async (filters) => {
//   const {
//     board,
//     state,
//     city,
//     schoolMode,
//     genderType,
//     shifts = [],
//     feeRange,
//     upto,
//     specialist = [],
//     languageMedium = [],
//     transportAvailable,
//     activities = []
//   } = filters;

//   // Build OR query correctly
//   const orConditions = [];
  
//   if (board) orConditions.push({ board });
//   if (state) orConditions.push({ state });
//   if (city) orConditions.push({ city });
//   if (schoolMode) orConditions.push({ schoolMode });
//   if (genderType) orConditions.push({ genderType });
//   if (shifts.length > 0) orConditions.push({ shifts: { $in: shifts } });
//   if (specialist.length > 0) orConditions.push({ specialist: { $in: specialist } });
//   if (languageMedium.length > 0) orConditions.push({ languageMedium: { $in: languageMedium } });
//   if (transportAvailable !== undefined && transportAvailable !== null) {
//     orConditions.push({ transportAvailable });
//   }

//   const query = { status: 'accepted' };
//   if (orConditions.length > 0) query.$or = orConditions;

//   try {
//     let matchedSchools = await School.find(query);

//     // Class level filter
//     if (upto) {
//       const userClassLevel = parseClassLevel(upto);
//       matchedSchools = matchedSchools.filter((school) => {
//         const schoolClassLevel = parseClassLevel(school.upto);
//         return schoolClassLevel && schoolClassLevel >= userClassLevel;
//       });
//     }

//     // Fee range filter
//     if (feeRange) {
//       const userRange = parseFeeRange(feeRange);
//       matchedSchools = matchedSchools.filter((school) => {
//         const schoolRange = parseFeeRange(school.feeRange);
//         if (!schoolRange) return false;
//         return schoolRange.max >= userRange.min && schoolRange.min <= userRange.max;
//       });
//     }

//     // Activities filter
//     if (activities.length > 0) {
//       const activityDocs = await Activities.find({
//         activities: { $in: activities },
//         schoolId: { $in: matchedSchools.map((s) => s._id) },
//       });

//       const schoolIdsWithActivities = activityDocs.map((a) => a.schoolId.toString());
//       matchedSchools = matchedSchools.filter((s) =>
//         schoolIdsWithActivities.includes(s._id.toString())
//       );
//     }

//     return matchedSchools;
//   } catch (error) {
//     throw error;
//   }
// };
