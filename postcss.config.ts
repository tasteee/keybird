module.exports = {
	plugins: [
		require('postcss-preset-env')({
			autoprefixer: false,
			stage: 0
		}),
		require('cssnano')({
			preset: [
				'default',
				{
					discardComments: {
						removeAll: true
					}
				}
			]
		})
	]
}
