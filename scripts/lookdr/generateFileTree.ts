#!/usr/bin/env node

import { readdirSync, statSync, readFileSync } from 'fs'
import { join, relative, extname, basename, resolve } from 'path'
import { globSync } from 'glob'

type TreeOptionsT = {
	excludeDirs: string[]
	maxDepth: number
	showFiles: boolean
	analyzeDependencies: boolean
	targetPath: string
	globPattern?: string
}

type DependencyMapT = {
	[filePath: string]: number
}

const defaultOptions: TreeOptionsT = {
	excludeDirs: ['node_modules', '.github', '.git', 'dist', 'build', '.next'],
	maxDepth: 10,
	showFiles: true,
	analyzeDependencies: true,
	targetPath: process.cwd()
}

const analyzeDependencies = (rootPath: string, options: TreeOptionsT): DependencyMapT => {
	const dependencyMap: DependencyMapT = {}
	const allFiles: string[] = []

	// First, collect all files
	const collectFiles = (currentPath: string, depth: number): void => {
		if (depth > options.maxDepth) return

		try {
			const items = readdirSync(currentPath)
			items.forEach((item) => {
				const fullPath = join(currentPath, item)
				const isDirectory = statSync(fullPath).isDirectory()

				if (isDirectory && options.excludeDirs.includes(item)) {
					return
				}

				if (isDirectory) {
					collectFiles(fullPath, depth + 1)
				} else {
					const ext = extname(item)
					if (['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'].includes(ext)) {
						allFiles.push(fullPath)
						dependencyMap[fullPath] = 0
					}
				}
			})
		} catch (error) {
			// Skip files that can't be read
		}
	}

	collectFiles(rootPath, 0)

	// Analyze each file for references to other files
	allFiles.forEach((filePath) => {
		try {
			const content = readFileSync(filePath, 'utf-8')

			// Patterns to match imports/requires
			const importPatterns = [
				// ES6 imports: import ... from './path'
				/import\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g,
				// CommonJS: require('./path')
				/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
				// Dynamic imports: import('./path')
				/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
			]

			importPatterns.forEach((pattern) => {
				let match
				while ((match = pattern.exec(content)) !== null) {
					const importPath = match[1]

					// Skip external packages (no relative path indicators)
					if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
						continue
					}

					// Resolve the import path
					const resolvedPath = resolveImportPath(filePath, importPath, allFiles)
					if (resolvedPath && dependencyMap.hasOwnProperty(resolvedPath)) {
						dependencyMap[resolvedPath]++
					}
				}
			})
		} catch (error) {
			// Skip files that can't be read
		}
	})

	return dependencyMap
}

const resolveImportPath = (fromFile: string, importPath: string, allFiles: string[]): string | null => {
	const fromDir = fromFile.replace(/[^/\\]+$/, '')
	let resolvedPath = join(fromDir, importPath)

	// Try different extensions if no extension provided
	const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte']
	const indexFiles = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx']

	for (const ext of extensions) {
		const testPath = resolvedPath + ext
		if (allFiles.includes(testPath)) {
			return testPath
		}
	}

	// Try index files for directory imports
	for (const indexFile of indexFiles) {
		const testPath = resolvedPath + indexFile
		if (allFiles.includes(testPath)) {
			return testPath
		}
	}

	return null
}

const getDependencyIndicator = (count: number): string => {
	return count === 0 ? ' ❓' : ''
}

const generateFileTree = (rootPath: string, options: TreeOptionsT = defaultOptions): string => {
	const lines: string[] = []
	const dependencyMap = options.analyzeDependencies ? analyzeDependencies(rootPath, options) : {}

	const traverse = (currentPath: string, prefix: string, depth: number): void => {
		if (depth > options.maxDepth) return

		try {
			const items = readdirSync(currentPath)
			const filteredItems = items.filter((item) => {
				const fullPath = join(currentPath, item)
				const isDirectory = statSync(fullPath).isDirectory()

				if (isDirectory && options.excludeDirs.includes(item)) {
					return false
				}

				return true
			})

			filteredItems.forEach((item, index) => {
				const fullPath = join(currentPath, item)
				const isLast = index === filteredItems.length - 1
				const isDirectory = statSync(fullPath).isDirectory()

				const connector = isLast ? '└──' : '├──'
				const itemPrefix = isDirectory ? '📁 ' : '📄 '

				let dependencyInfo = ''
				if (!isDirectory && options.analyzeDependencies && dependencyMap.hasOwnProperty(fullPath)) {
					const count = dependencyMap[fullPath]
					const indicator = getDependencyIndicator(count)
					dependencyInfo = ` [${count}]${indicator}`
				}

				lines.push(`${prefix}${connector} ${itemPrefix}${item}${dependencyInfo}`)

				if (isDirectory) {
					const nextPrefix = prefix + (isLast ? '    ' : '│   ')
					traverse(fullPath, nextPrefix, depth + 1)
				}
			})
		} catch (error) {
			console.error(`Error reading directory ${currentPath}:`, error)
		}
	}

	const rootName = rootPath.split(/[/\\]/).pop() || 'root'
	lines.push(`📁 ${rootName}`)
	traverse(rootPath, '', 0)

	return lines.join('\n')
}

const main = (): void => {
	const rootPath = process.cwd()
	const tree = generateFileTree(rootPath)

	console.log('File Tree Structure with Dependency Analysis:')
	console.log('===========================================')
	console.log('')
	console.log('Legend:')
	console.log('[number] - How many files reference this file')
	console.log('❓ - File is not referenced by any other files')
	console.log('')
	console.log(tree)

	// Optional: Write to file
	// import { writeFileSync } from 'fs'
	// writeFileSync('file-tree.txt', tree)
	// console.log('\nTree saved to file-tree.txt')
}

main()
