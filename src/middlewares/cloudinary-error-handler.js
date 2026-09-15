import multer from 'multer';




export const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      // Check which endpoint the error came from
      if (req.path.includes('/photos')) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Photo too large. Maximum size is 5MB.'
        });
      } else if (req.path.includes('/video')) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Video too large. Maximum size is 20MB.'
        });
      }
    }
  }

  // Handle file type errors
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      status: 'Failed',
      message: 'Only image files are allowed for photos.'
    });
  }

  if (error.message.includes('Only video files')) {
    return res.status(400).json({
      status: 'Failed',
      message: 'Only video files are allowed for videos.'
    });
  }

  // Other errors
  res.status(error.statusCode || 500).json({
    status: 'Failed',
    message: error.message
  });
};

export default errorHandler;