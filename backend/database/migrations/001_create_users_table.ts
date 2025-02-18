import db from '../../src/config/database';

const createUsersTable = () => {

	// const dropTableQuery = `DROP TABLE IF EXISTS users;`;

	// db.run(dropTableQuery, (err) => {
	// 	if (err)
	// 		console.error('Erreur lors de la suppression de la table users:', err.message);
	// 	else
	// 		console.log('Table users supprimée avec succès');
	// });


	const query = `
		CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL,
		email TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	`;

	db.run(query, (err) => {
		if (err) {
			console.error('Erreur lors de la création de la table users:', err.message);
		} else {
			console.log('Table users créée avec succès');

		}
	});
	};

export default createUsersTable;
