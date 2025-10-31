const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI);
		console.log(`MongoDB conectado: ${conn.connection.name}`);

	} catch (error) {
		console.error('Error al conectar a la base de datos:', error.message);
		process.exit(1);
	}
};

module.exports = connectDB;
