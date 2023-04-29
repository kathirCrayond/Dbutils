const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const knex = require('knex')({
	client: 'pg',
	connection: {
		host: '216.48.181.125',
		port: 1997,
		user: 'postgres',
		password: 'crayond@123',
		database: 'restore_points',
	},
});

async function backup({
	remoteDbUser,
	remoteDbHost,
	remoteDbPort,
	remoteDbName,
	remoteDbPassword,
	filePath,
	fileName,
}) {
	exec(
		`PGPASSWORD=${remoteDbPassword} pg_dump -U ${remoteDbUser} -h ${remoteDbHost} -p ${remoteDbPort} -F c -b -v -f ${filePath} ${remoteDbName}`,
		(err, stdout, stderr) => {
			if (err) {
				console.error('Backup failed:', err);
				return;
			}
			console.log('Backup successful');
		},
	);

	await knex.table('restore_points').insert({
		db_name: remoteDbName,
		tag: fileName,
	});
}
		

async function restore({
	remoteDbUser,
	remoteDbHost,
	remoteDbPort,
	remoteDbName,
	remoteDbPassword,
	filePath,
}) {
	exec(
		`PGPASSWORD=${remoteDbPassword} pg_restore -U ${remoteDbUser} -h ${remoteDbHost} -p ${remoteDbPort} -c -O -d ${remoteDbName} ${filePath}`,
		(err, stdout, stderr) => {
			if (err) {
				console.error('Restore failed:', err);
				return;
			}

			console.log('Restore successful');
		},
	);
}
		

async function main() {
	const remoteDbUser = 'postgres';
	const remoteDbHost = '216.48.181.125';
	const remoteDbPort = 1997;
	const remoteDbName = 'test';
	const fileName = `${remoteDbName}_${Date.now()}.backup`;
	const filePath = `./backup/${fileName}`;
	const remoteDbPassword = 'crayond@123';

	// await backup({
	// 	remoteDbUser,
	// 	remoteDbHost,
	// 	remoteDbPort,
	// 	remoteDbName,
	// 	remoteDbPassword,
	// 	filePath,
	// 	fileName,
	// });

	// const { tag } = await knex
	// 	.table('restore_points')
	// 	.select('tag')
	// 	.where({ id: 3 })
	// 	.first();

	// await restore({
	// 	remoteDbUser,
	// 	remoteDbHost,
	// 	remoteDbPort,
	// 	remoteDbName,
	// 	remoteDbPassword,
	// 	filePath: `backup/${tag}`,
	// });
}

main();
