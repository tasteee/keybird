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
					discardDuplicates: true,
					discardOverridden: true,
					discardEmpty: true,
					discardComments: {
						removeAll: true
					},
					calc: false,
					normalizeUrl: false
				}
			]
		})
	]
}
