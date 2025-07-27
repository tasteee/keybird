import { Flex } from '#/components/common/Flex'
import range from 'array-range'
import { Skeleton } from '@radix-ui/themes'

type PropsT = {
	count: number
}

export const ChordSkeletonGrid = (args: PropsT) => {
	const skeletons = range(args.count)

	return (
		<Flex.Row className="ChordGrid" gap="3" p="4" pl="8" wrap="wrap" pb="40px">
			{skeletons.map((index) => (
				<Skeleton key={`skeleton-${index}`} width="200px" height="var(--blockHeight)" className="ChordBlockSkeleton" />
			))}
		</Flex.Row>
	)
}
