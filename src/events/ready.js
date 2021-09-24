module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

        client.user.setActivity('ElyasAsmad', { type: 'WATCHING' })
        console.log('Updated bot activity!')
	},
};