//Registra las solicitudes entrantes con la marca de tiempo, el método HTTP y la URL solicitada.
function logger(req, res, next) {
	const now = new Date();
	const formattedDate = now.toLocaleString();

	console.log(`[${formattedDate}] ${req.method} ${req.url}`);
	next();
}

module.exports = logger;