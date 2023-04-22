// function checkDuplicateData(error, req, res, next) {
//   if (error.code === "23505" && error.constraint === "unique_course_name") {
//     const error = new Error("The course is already available!");
//     error.status = 409;
//     res.status(409).json({
//       status: "fail",
//       error: error.message,
//     });
//     next(error);
//   }
//   next();
// }

// module.exports = { checkDuplicateData };
