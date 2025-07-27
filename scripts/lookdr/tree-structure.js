import fs from 'fs'
import path from 'path'

// Folders and files to exclude from the tree
const EXCLUDED_FOLDERS = new Set([
	'node_modules',
	'.git',
	'.github',
	'dist',
	'build',
	'.next',
	'.vscode',
	'coverage',
	'.nyc_output',
	'.cache',
	'tmp',
	'temp'
])

const EXCLUDED_FILES = new Set([
	'.DS_Store',
	'Thumbs.db',
	'.gitignore',
	'.env',
	'.env.local',
	'.env.development',
	'.env.production'
])

const shouldExclude = (itemName) => {
	return EXCLUDED_FOLDERS.has(itemName) || EXCLUDED_FILES.has(itemName)
}

const generateTreeStructure = (dirPath, prefix = '', isRoot = true) => {
	const items = []

	try {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true })

		// Sort entries: directories first, then files, both alphabetically
		const sortedEntries = entries
			.filter((entry) => !shouldExclude(entry.name))
			.sort((a, b) => {
				if (a.isDirectory() && !b.isDirectory()) return -1
				if (!a.isDirectory() && b.isDirectory()) return 1
				return a.name.localeCompare(b.name)
			})

		sortedEntries.forEach((entry, index) => {
			const isLast = index === sortedEntries.length - 1
			const currentPrefix = isRoot ? '' : prefix
			const itemPrefix = isRoot ? '' : isLast ? '└── ' : '├── '
			const nextPrefix = isRoot ? '' : prefix + (isLast ? '    ' : '│   ')

			const itemPath = path.join(dirPath, entry.name)

			if (entry.isDirectory()) {
				const folderLine = `${currentPrefix}${itemPrefix}${entry.name}/`
				items.push(folderLine)

				// Recursively process subdirectory
				const subItems = generateTreeStructure(itemPath, nextPrefix, false)
				items.push(...subItems)
			} else {
				const fileLine = `${currentPrefix}${itemPrefix}${entry.name}`
				items.push(fileLine)
			}
		})
	} catch (error) {
		console.error(`Error reading directory ${dirPath}:`, error.message)
	}

	return items
}

const generateProjectTree = (rootPath, outputFile = null) => {
	const projectName = path.basename(rootPath)
	const treeLines = [`${projectName}/`]

	const structure = generateTreeStructure(rootPath)
	treeLines.push(...structure)

	const output = treeLines.join('\n')

	if (outputFile) {
		fs.writeFileSync(outputFile, output, 'utf8')
		console.log(`Tree structure written to: ${outputFile}`)
	} else {
		console.log(output)
	}

	return output
}

// Main execution
const main = () => {
	const args = process.argv.slice(2)
	const rootPath = args[0] || process.cwd()
	const outputFile = args[1] || null

	if (!fs.existsSync(rootPath)) {
		console.error(`Error: Path "${rootPath}" does not exist`)
		process.exit(1)
	}

	if (!fs.statSync(rootPath).isDirectory()) {
		console.error(`Error: Path "${rootPath}" is not a directory`)
		process.exit(1)
	}

	console.log(`Generating tree structure for: ${rootPath}`)
	console.log('Excluding:', Array.from(EXCLUDED_FOLDERS).join(', '))
	console.log('---')

	generateProjectTree(rootPath, outputFile)
}

// Run if this script is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`
if (isMainModule) {
	main()
}

export { generateProjectTree, generateTreeStructure }
