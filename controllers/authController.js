const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed Login!',
	successRedirect: '/',
	successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You are now logged out, catch you soon');
	res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
	// Check if the user is authenticated
	if (req.isAuthenticated()) {
		next(); // Carry on
		return;
	}
	req.flash('error', 'Oops you must be logged in to do that!');
	res.redirect('/login');
};

exports.forgot = async (req, res) => {
	// 1. Check user has an acocunt
	const user = await User.findOne({
		email: req.body.email
	});
	if (!user) {
		req.flash('error', 'No account with that email exists');
		return res.redirect('/login');
	}

	// 2. Create token on their account
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 36000000;
	await user.save();

	// 3. Email them the token
	const resetURL = `http://${req.headers.host}/account/reset/${
		user.resetPasswordToken
	}`;
	await mail.send({
		user,
		subject: 'Password Reset',
		filename: 'password-reset',
		resetURL
	});
	req.flash('success', `You have been emailed a password reset link.`);

	// 4. Redirect ot login page
	res.redirect('/login');
};

exports.resetPassword = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	});

	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	// If there is a user
	res.render('reset', { title: 'Reset your Password' });
};

exports.confirmPasswords = (req, res, next) => {
	if (req.body.password === req.body['password-confirm']) {
		return next();
	}
	req.flash('error', 'Passwords do not match!');
	res.redirect('back');
};

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	});

	if (!user) {
		req.flash('error', 'Password reset is invalid or has expired');
		return res.redirect('/login');
	}

	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash(
		'success',
		'Nice! Your password has been reset! You are now logged in!'
	);
	res.redirect('/');
};
