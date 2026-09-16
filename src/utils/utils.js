import Review from '../models/reviews-model.js';
import Amenities from '../models/amenities-model.js';
import { getSchoolScoreById } from '../controllers/school-controllers.js';

export const toSchoolCardModel = (school, ratings = 0, amenities = [], schoolScore) => {
    return {
        _id: school._id,
        id: school._id,
        schoolId: school._id,
        name: school.name,
        feeRange: school.feeRange,
        location: `${school.city}, ${school.state}`,
        city: school.city,
        state: school.state,
        area: school.area,
        board: school.board,
        genderType: school.genderType,
        shifts: school.shifts,
        schoolMode: school.schoolMode,
        schoolType: school.schoolMode,
        latitude: school.latitude,
        longitude: school.longitude,
        score: schoolScore || 0,
        logo: school.logo ?? (school.photos?.length > 0 ? school.photos[0] : null),
        coverImage: school.logo ?? (school.photos?.length > 0 ? school.photos[0] : null),
        photos: school.photos || [],
        amenities,
        ratings,
    };
};

export const toSchoolCardModels = async (schools = []) => {
    const mapped = await Promise.all(
        schools.map(async (school) => {
            try {
                const score = await getSchoolScoreById(school._id);
                const review = await Review.findOne({ schoolId: school._id }).catch(() => null);
                const amenities = await Amenities.findOne({ schoolId: school._id }).catch(() => null);
                return toSchoolCardModel(school, review?.ratings || 0, amenities?.predefinedAmenities || amenities?.customAmenities || [], score);
            } catch (e) {
                return toSchoolCardModel(school, 0, [], 0);
            }
        })
    );
    return mapped;
};
