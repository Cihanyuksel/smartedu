const db = require("../db");

const checkFields = async (req, res, next) => {
  // const column_name = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'");
  // const allowedFields = ["name", "description", "price_range", "category_id"]; // Tabloda bulunan alanlar
  const reqFields = Object.keys(req.body);
  console.log(reqFields);
  const invalidFields = reqFields.filter((field) => !reqFields.includes(field));

  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: "Invalid field(s)",
      message: `The following field(s) are not allowed: ${invalidFields.join(", ")}`,
    });
  }

  next();
};

module.exports = { checkFields };
