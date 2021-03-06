'use strict'

module.exports = {
	debug: process.env.NODE_ENV === 'development',
	port: process.env.SERVER_PORT || 3030,
	path: '/panel',
	staticDir: '/dist/',
	baseUrl: process.env.BASE_URL || '0.0.0.0:3030',
	testFinanceApiHost: "127.0.0.1",
	financeApiHost: "127.0.0.1",
}