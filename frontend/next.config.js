/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

module.exports = {
	async rewrites() {
	  return [
		{
		  source: '/api/:path*',
		  destination: 'http://backend:9000/:path*',
		},
	  ];
	},
  };