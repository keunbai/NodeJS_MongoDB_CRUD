// 향후 json-server 이용 없이 외부 DB (몽고 DB 등) 와 연결

//! Controller 1
//*   - JSON file 응답 API  
//*   - model 폴더 內 (메모리) 데이터 업데이트 X
/*
const data = {};       
data.employees = require('../model/employees.json');

const getAllEmployees = (_req, res) => {
  res.json(data.employees);
};

const createNewEmployee = (req, res) => {  
  res.json({
    "firstname": req.body.firstname,
    "lastname": req.body.lastname
  });
};

const updateEmployee = (req, res) => {     
  res.json({
    "firstname": req.body.firstname,
    "lastname": req.body.lastname
  });
};

const deleteEmployee = (req, res) => {     
  res.json({
    "id": req.body.id
  });
};

const getEmployee = (req, res) => {  
  console.log(req.params, req.query);

  res.json({"id": req.params.id})
};
*/


//! Controller 2
//*   - 메모리 업데이트 + JSON file 응답 으로 데이터베이스 연결 이전 수준의 API
//?     cf) DB 해당 employees.json 파일 업데이트는 X
/*
const data = {
  employees: require('../model/employees.json'),
  setEmployees: function (_data) { 
    this.employees = _data; 
  }
}

const getAllEmployees = (_req, res) => {
  res.json(data.employees);   // 응답 (http 상태 코드 200 생략)
};

const createNewEmployee = (req, res) => {  
  const newEmployee = {
    id: data.employees?.length ? data.employees[data.employees.length-1].id + 1 : 1,
    firstname: req.body.firstname,
    lastname: req.body.lastname
  };

  if (!newEmployee.firstname || !newEmployee.lastname) {
    return res.status(400).json({ 'message': 'First and last names are required.' });
  }

  //
  data.setEmployees([...data.employees, newEmployee]);   // 데이터 메모리 업데이트
  res.status(201).json(data.employees);                // 업데이트 데이터 응답 
  //res.status(201).json({'success': `New employee ${newEmployee.firstname} ${newEmployee.lastname} created!`});
};

const updateEmployee = (req, res) => {    
  const updatedEmployee = data.employees.find(emp => emp.id === parseInt(req.body.id));
  if (!updatedEmployee) {
    return res.status(400).json({ 'message': `Employee ID ${req.body.id} not found`});
  }
  
  if (req.body.firstname) updatedEmployee.firstname = req.body.firstname;
  if (req.body.lastname) updatedEmployee.lastname = req.body.lastname;

  //
  const filteredEmployees = data.employees.filter(emp => emp.id != parseInt(req.body.id));
  const updatedEmployees = [...filteredEmployees, updatedEmployee];
  updatedEmployees.sort((a, b) => a.id - b.id);   // 오름 차순

  data.setEmployees(updatedEmployees);   // 데이터 메모리 업데이트
  res.json(data.employees);              // 업데이트 데이터 응답
};

const deleteEmployee = (req, res) => {     
  const deletedEmployee = data.employees.find(emp => emp.id === parseInt(req.body.id));
  if (!deletedEmployee) {
    return res.status(400).json({ 'message': `Employ ID ${req.body.id} not found`});
  }
  
  //
  const filteredEmployees = data.employees.filter(emp => emp.id != parseInt(req.body.id));

  data.setEmployees([...filteredEmployees]);   // 데이터 메모리 업데이트
  //data.setEmployees(filteredEmployees)        // (리액트에선 랜더링 미발생이나 여기선 문제 없을 듯)
  res.json(data.employees);                    // 업데이트 데이터 응답
};

const getEmployee = (req, res) => {  
  const employee = data.employees.find(emp => emp.id === parseInt(req.params.id));
  if (!employee) {
      return res.status(400).json({ "message": `Employee ID ${req.params.id} not found` });
  }

  //
  res.json(employee);   // 응답
};
*/


//! Controller 3
//!   - MongoDB 업데이트

const Employee = require('../model/Employee');   //! MongoDB model

const getAllEmployees = async (_req, res) => {
  const employees = await Employee.find();
  if (!employees) {
    //return res.sendStatus(204);
    return res.status(204).json({'message': 'No employees found.'});
  }

  res.json(employees);   // 응답 (http 상태 코드 200 생략)
};

const createNewEmployee = async (req, res) => {  
  if (!req?.body?.firstname || !req?.body?.lastname) {
    return res.status(400).json({'message': 'First and last names are required.'});
  }

  try {
    const newEmployee = await Employee.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname
    });

    res.status(201).json(newEmployee);
    //res.status(201).json({'success': `New employee ${newEmployee.firstname} ${newEmployee.lastname} created!`});
  } catch (err) {
    console.error(err);
  }  
};

const updateEmployee = async (req, res) => {    
  if (!req?.body?.id) {
    return res.status(400).json({'message': 'Employee ID required.'});
  }

  //
  const foundEmployee = await Employee.findOne({_id: req.body.id}).exec();
  if (!foundEmployee) {
    return res.status(204).json({'message': `No employee matches ID ${req.body.id}`});
  }

  if (req.body?.firstname) foundEmployee.firstname = req.body.firstname;
  if (req.body?.lastname) foundEmployee.lastname = req.body.lastname;

  const result = await foundEmployee.save();
  res.json(result);              
};

const deleteEmployee = async (req, res) => {     
  if (!req?.body?.id) {
    return res.status(400).json({'message': 'Employee ID required.'});
  }

  //
  const foundEmployee = await Employee.findOne({_id: req.body.id}).exec();
  if (!foundEmployee) {
    return res.status(204).json({'message': `No employee matches ID ${req.body.id}`});
  }
  
  const result = await foundEmployee.deleteOne();
  res.json(result);              
};

const getEmployee = async (req, res) => {  
  if (!req?.params?.id) {
    return res.status(400).json({'message': 'Employee ID required.'});
  }

  //
  const foundEmployee = await Employee.findOne({_id: req.params.id}).exec();
  if (!foundEmployee) {
    return res.status(204).json({'message': `No employee matches ID ${req.params.id}`});
  }

  res.json(foundEmployee);   // 응답
};


module.exports = {
  getAllEmployees,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee
};


/*
const data1 = {
  employees: require('../model/employees.json'),
  getEmployees: function () { console.log(this.employees) }
};

const data2 = {
  employees: require('../model/employees.json'),
  getEmployees: () => { console.log(this.employees) }
};

data1.getEmployees();
data2.getEmployees();   //? undefined
*/

/*
const arr = [13, 46, 52, 36, 75, 3];

arr.sort((a, b) => a - b);    // 오름차순
console.log(arr);             // [ 3, 13, 36, 46, 52, 75 ]

arr.sort((a, b) => b - a);    // 내림차순
console.log(arr);             // [ 3, 13, 36, 46, 52, 75 ]

const arrObj = [
  {
    id: 1,
    name: 'keunbai'
  },
  {
    id: 3,
    name: 'jeongbeomi'
  },
  {
    id: 2,
    name: 'jungmini'
  }
];

arrObj.sort((a, b) => a.id - b.id);
console.log(arrObj);

arrObj.sort((a, b) => b.id - a.id);
console.log(arrObj);
*/





