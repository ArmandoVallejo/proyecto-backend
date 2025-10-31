const app = require('./index');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Servidor escuchando en el puerto ${PORT}`);
		});
	} catch (error) {
		console.error('Error al iniciar el servidor:', error.message);
		process.exit(1);
	}
};

startServer();