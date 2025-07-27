import { Text, Select, TextField, DropdownMenu, ChevronDownIcon } from '@radix-ui/themes'
import classNames from 'classnames'
import { useState, useMemo } from 'react'

type SelectPropsT = {
	value: string
	label: string
	options: OptionsT
	onChange: (value: string) => void
	style?: React.CSSProperties
	className?: string
	id?: string
}

export const SheSelect = (props: SelectPropsT) => {
	const options = getOptionsArray(props.options)

	return (
		<Select.Root size="1" value={props.value} onValueChange={props.onChange}>
			<Select.Trigger variant="soft" style={props.style} className={props.className} id={props.id}>
				<Text>{props.label}</Text>
			</Select.Trigger>
			<Select.Content highContrast>
				{options.map(([value, label]) => (
					<Select.Item key={value} value={value}>
						{label}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

type OptionsT = string[] | [string, string][] | Record<string, string>

const getOptionsArray = (options: OptionsT): [string, string][] => {
	const isArray = Array.isArray(options)
	const isObject = typeof options === 'object' && !isArray

	if (isArray && !isObject) {
		return options.map((option) => {
			const isArray = Array.isArray(option)
			const final = isArray ? option : [option, option]
			return final as [string, string]
		})
	}

	return Object.entries(options).map(([value, label]) => [value, label])
}

type SearchableSelectPropsT = {
	value: string
	options: OptionsT
	label: string
	onChange: (value: string) => void
	style?: React.CSSProperties
	className?: string
	id?: string
}

SheSelect.Searchable = (props: SearchableSelectPropsT) => {
	const options = getOptionsArray(props.options)
	const [searchTerm, setSearchTerm] = useState('')
	const className = classNames('SearchableSelect', 'SheSelectTrigger', props.className)

	const filteredOptions = useMemo(() => {
		const trimmedSearch = searchTerm.trim().toLowerCase()
		if (!trimmedSearch) return options

		return options.filter(([, label]) => label.toLowerCase().includes(trimmedSearch))
	}, [options, searchTerm])

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value)
	}

	return (
		<Select.Root size="1" value={props.value} onValueChange={props.onChange}>
			<Select.Trigger variant="soft" style={props.style} className={className} id={props.id}>
				<Text>{props.label}</Text>
			</Select.Trigger>
			<Select.Content highContrast>
				<div style={{ padding: '8px' }}>
					<TextField.Root placeholder="Search..." value={searchTerm} onChange={handleSearchChange} size="1" />
				</div>
				{filteredOptions.map(([value, label]) => (
					<Select.Item key={value} value={value}>
						{label}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	)
}

type PaginatedSelectPropsT = {
	value: string
	options: OptionsT
	label: string
	onChange: (value: string) => void
	style?: React.CSSProperties
	className?: string
	id?: string
	itemsPerPage?: number
}

SheSelect.Paginated = (props: PaginatedSelectPropsT) => {
	const className = classNames('PaginatedSelect', 'SheSelectTrigger', props.className)
	const options = getOptionsArray(props.options)
	const itemsPerPage = props.itemsPerPage || 10
	const [currentPage, setCurrentPage] = useState(1)
	const [isOpen, setIsOpen] = useState(false)

	const totalPages = Math.ceil(options.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const paginatedOptions = options.slice(startIndex, endIndex)

	const handlePageChange = (page: number) => {
		setCurrentPage(page)
	}

	const handleItemSelect = (value: string) => {
		setIsOpen(false)
		props.onChange(value)
	}

	const renderPaginationButtons = () => {
		const buttons = []
		for (let page = 1; page <= totalPages; page++) {
			const isCurrentPage = currentPage === page
			buttons.push(
				<button
					key={page}
					onClick={() => handlePageChange(page)}
					style={{
						padding: '2px 6px',
						margin: '0 1px',
						border: 'none',
						backgroundColor: isCurrentPage ? 'var(--accent-9)' : 'transparent',
						color: isCurrentPage ? 'var(--accent-9-contrast)' : 'var(--gray-11)',
						borderRadius: '2px',
						cursor: 'pointer',
						fontSize: '11px',
						fontWeight: isCurrentPage ? '500' : '400',
						minWidth: '20px',
						height: '20px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
					onMouseEnter={(e) => {
						if (!isCurrentPage) {
							e.currentTarget.style.backgroundColor = 'var(--gray-3)'
						}
					}}
					onMouseLeave={(e) => {
						if (!isCurrentPage) {
							e.currentTarget.style.backgroundColor = 'transparent'
						}
					}}
				>
					{page}
				</button>
			)
		}
		return buttons
	}

	return (
		<DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenu.Trigger>
				<button className={className} id={props.id}>
					<>
						<Text size="1">{props.label}</Text>
						<ChevronDownIcon style={{ color: 'var(--accent-11)' }} />
					</>
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content highContrast style={{ minWidth: '200px', maxHeight: '300px', overflow: 'visible' }}>
				{paginatedOptions.map(([value, label]) => (
					<DropdownMenu.Item
						key={value}
						onSelect={() => handleItemSelect(value)}
						style={{
							fontSize: '12px',
							padding: '4px 8px',
							cursor: 'pointer'
						}}
					>
						{label}
					</DropdownMenu.Item>
				))}
				{totalPages > 1 && (
					<div
						style={{
							padding: '6px 8px 4px 8px',
							borderTop: '1px solid var(--gray-6)',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: '1px',
							backgroundColor: 'var(--gray-1)'
						}}
					>
						{renderPaginationButtons()}
					</div>
				)}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	)
}
