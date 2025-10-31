const mongoose	= require('mongoose');

const projectSchema = new mongoose.Schema({
	title:{
		type: String,
		required: true
	},
	description:{
		type: String,
		default: ''
	},
	startDate:{
		type: Date
	},
	endDate:{
		type: Date
	},
	status:{
		type: String,
		enum: ['not started', 'in progress', 'completed'],
		default: 'not started'
	},
	tasks:[
		{
			taskName: {
				type: String,
				required: true
			},
			completed: {
				type: Boolean,
				default: false
			}
		}
	],
	files: [
		{
			filename: {
				type: String,
				required: true
			},
			originalName: {
				type: String,
				required: true
			},
			mimetype: {
				type: String,
				required: true
			},
			size: {
				type: Number,
				required: true
			},
			category: {
				type: String,
				enum: ['image', 'document', 'pdf', 'spreadsheet', 'presentation', 'other'],
				required: true
			},
			path: {
				type: String,
				required: true
			},
			uploadedAt: {
				type: Date,
				default: Date.now
			}
		}
	]
}, {
	timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);