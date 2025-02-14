const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  }
});

const employeeModel = mongoose.model('Employee', employeeSchema);

module.exports = employeeModel;

//! The model 'Employee' is for 'employees' collection in the MongoDB.