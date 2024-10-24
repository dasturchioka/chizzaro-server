const express = require("express");
const {
  createCategory,
  getItemTypes,
  deleteCategory,
} = require("../../controllers/admin/category.controller");
const router = express.Router();

router.post("/create", createCategory);
router.get("/get-category-types", getItemTypes);
router.delete("/delete-category/:id", deleteCategory);

module.exports = router;
