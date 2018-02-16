const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here

// Gets
router.get('/', catchErrors(storeController.getStore));
router.get('/stores', catchErrors(storeController.getStore));
router.get('/add', authController.isLoggedIn, storeController.addStore);
router.get('/stores/:id/edit', catchErrors(storeController.editStore));
router.get('/stores/:slug', catchErrors(storeController.getStoreBySlug));
router.get('/tags', catchErrors(storeController.getStoreByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoreByTag));

router.get('/login', userController.loginForm);
router.get('/register', userController.registerForm);
router.get('/account', userController.account);

router.get('/logout', authController.isLoggedIn, authController.logout);
router.get('/account/reset/:token', catchErrors(authController.resetPassword));

router.get('/map', storeController.mapPage);
router.get(
	'/hearts',
	authController.isLoggedIn,
	catchErrors(storeController.getHearts)
);

// Posts
router.post(
	'/add',
	storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.createStore)
);
router.post(
	'/add/:id',
	storeController.upload,
	catchErrors(storeController.resize),
	catchErrors(storeController.updateStore)
);

router.post(
	'/register',
	userController.validateRegister,
	userController.register,
	authController.login
);

router.post('/login', authController.login);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.post(
	'/account/reset/:token',
	authController.confirmPasswords,
	catchErrors(authController.update)
);

router.post(
	'/reviews/:id',
	authController.isLoggedIn,
	catchErrors(reviewController.addReview)
);

// API
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));

module.exports = router;
