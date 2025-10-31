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
	]
}, {
	timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);