const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: 'Please enter a store name!'
		},
		slug: String,
		description: {
			type: String,
			trim: true
		},
		tags: [String],
		created: {
			type: Date,
			default: Date.now
		},
		location: {
			type: {
				type: String,
				default: 'Point'
			},
			coordinates: [
				{
					type: Number,
					required: 'You must supply coordinates'
				}
			],
			address: {
				type: String,
				required: 'You must supply an address!'
			}
		},
		photo: String,
		author: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: 'You must supply an author'
		}
	},
	{
		toJSON: {
			virtuals: true
		},
		toObject: {
			virtuals: true
		}
	}
);

// Define our index
storeSchema.index({
	name: 'text',
	description: 'text'
});

storeSchema.index({
	location: '2dsphere'
});

storeSchema.pre('save', function(next) {
	if (!this.isModified('name')) {
		return next();
	}
	this.slug = slug(this.name);
	next();
	// Todo - Make more resiliant so slugs are unique
});

storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' },
		{
			$group: {
				_id: '$tags',
				count: {
					$sum: 1
				}
			}
		},
		{
			$sort: {
				count: -1
			}
		}
	]);
};

// Find review where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
	ref: 'Review',
	localField: '_id', //White field on the store
	foreignField: 'store' //Which field on the review
});

module.exports = mongoose.model('Store', storeSchema);
