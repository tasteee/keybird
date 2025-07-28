import { Flex } from './common/Flex'
import { Text, Spinner, Progress } from '@radix-ui/themes'
import { observer } from 'mobx-react-lite'
import { $player } from '#/stores/$player'

export const LoadingOverlay = observer(() => {
	const isActivelyLoading = $player.isLoading || $player.isInitializing
	const hasError = $player.loadingError !== null
	const isFullyLoaded = $player.isFullyLoaded
	const progress = $player.loadingProgress
	const currentStep = $player.currentLoadingStep

	// Only show if we're actively loading or have an error
	if (!isActivelyLoading && !hasError) return null

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.8)',
				zIndex: 1000,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Flex.Column gap="4" align="center" p="6" style={{ background: 'var(--gray-2)', borderRadius: '8px', minWidth: '300px' }}>
				{hasError ? (
					<>
						<Text size="4" weight="bold" color="red">
							Failed to load audio
						</Text>
						<Text size="2" color="gray" align="center">
							{$player.loadingError}
						</Text>
						<Text size="1" color="gray" align="center">
							Please refresh the page to try again
						</Text>
					</>
				) : (
					<>
						<Spinner size="3" />
						<Text size="4" weight="bold" align="center">
							{currentStep || 'Loading audio instruments...'}
						</Text>
						<div style={{ width: '100%', minWidth: '250px' }}>
							<Progress value={progress} size="3" />
						</div>
						<Text size="2" color="gray" align="center">
							{Math.round(progress)}% complete
						</Text>
						<Text size="1" color="gray" align="center">
							This may take a few moments on first load.
						</Text>
					</>
				)}
			</Flex.Column>
		</div>
	)
})
