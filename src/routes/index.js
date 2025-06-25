const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const billController = require('../controllers/billController');

// User routes
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUser);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Bill routes
router.get('/bills', billController.getBills);
router.get('/bills/:id', billController.getBill);
router.post('/bills', billController.createBill);
router.put('/bills/:id', billController.updateBill);
router.delete('/bills/:id', billController.deleteBill);
router.get('/bills/stats', billController.getStats);

module.exports = router; 