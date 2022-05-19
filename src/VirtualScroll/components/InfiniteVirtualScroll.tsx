import { useMemo, useRef, useState, useEffect, useCallback, memo } from 'react'

const useScrollAware = () => {
  const [scrollTop, setScrollTop] = useState(0)
  const windowRef = useRef<Window>(
    typeof window !== 'undefined' ? window : null,
  )
  const infinityScrollRef = useRef<HTMLElement>(
    typeof window !== 'undefined' ? document.body : null,
  )

  const onScroll = () => {
    return requestAnimationFrame(() => {
      windowRef.current && setScrollTop(windowRef.current.scrollY)
    })
  }

  useEffect(() => {
    windowRef.current && setScrollTop(windowRef.current.scrollY)
    windowRef.current && windowRef.current.addEventListener('scroll', onScroll)
    return () => {
      windowRef.current &&
        // eslint-disable-next-line react-hooks/exhaustive-deps
        windowRef.current.removeEventListener('scroll', onScroll)
    }
  }, [])

  return { scrollTop, infinityScrollRef }
}

interface Props {
  onFetchMore: () => void
  renderAhread?: number
  data: any[]
  Container: (props: any) => JSX.Element
  Item: (props: any) => JSX.Element
  itemClassName: string
  containerClassName: string
  cardHeight: number
}

const InfiniteVirtualScroll = ({
  onFetchMore,
  renderAhread = 10,
  data,
  Item,
  Container,
  itemClassName,
  containerClassName,
  cardHeight,
}: Props) => {
  const { scrollTop, infinityScrollRef } = useScrollAware()
  const [columnCount, setColumnCount] = useState(3)
  const viewportHeight =
    infinityScrollRef.current && infinityScrollRef.current.clientHeight
  const itemCount = useMemo(() => Math.ceil(data.length / columnCount), [
    data.length,
    columnCount,
  ])

  const totalHeight = useMemo(() => itemCount * cardHeight, [
    cardHeight,
    itemCount,
  ])
  const startNode = useMemo(() => {
    const startNode = Math.floor(scrollTop / cardHeight - renderAhread)
    return Math.max(0, startNode)
  }, [cardHeight, renderAhread, scrollTop])

  const offsetY = useMemo(() => startNode * cardHeight, [cardHeight, startNode])

  let visibleNodesCount =
    viewportHeight &&
    Math.ceil((viewportHeight / cardHeight) * renderAhread * columnCount)
  visibleNodesCount =
    visibleNodesCount && Math.min(itemCount - startNode, visibleNodesCount)

  const scrollPositionChecking = useCallback(async () => {
    if (
      infinityScrollRef.current &&
      viewportHeight &&
      infinityScrollRef.current.scrollHeight - 700 <
        window.scrollY + viewportHeight
    ) {
      onFetchMore()
    }
  }, [infinityScrollRef, onFetchMore, viewportHeight])

  const visibleChildren = useMemo(() => {
    const visibleNodes =
      visibleNodesCount &&
      data.slice(
        startNode * columnCount,
        (startNode + visibleNodesCount + 1) * columnCount,
      )

    return visibleNodes ? (
      visibleNodes.map((nft) => (
        <Item className={itemClassName} key={nft?.nftId} />
      ))
    ) : (
      <></>
    )
  }, [visibleNodesCount, data, startNode, columnCount, Item, itemClassName])

  const infinityScroll = useMemo(() => () => scrollPositionChecking(), [
    scrollPositionChecking,
  ])

  const updateItemCount = useCallback(() => {
    if (window) {
      const item = document.getElementsByClassName(itemClassName)[0]
      const grid = document.getElementsByClassName(containerClassName)[0]
      grid.clientWidth &&
        setColumnCount(Math.floor(grid.clientWidth / item.clientWidth))
    }
  }, [containerClassName, itemClassName, setColumnCount])

  useEffect(() => {
    if (window) {
      window.addEventListener('scroll', infinityScroll)
    }
    return () => {
      window &&
        // eslint-disable-next-line react-hooks/exhaustive-deps
        window.removeEventListener('scroll', infinityScroll)
    }
  }, [infinityScroll, infinityScrollRef])

  useEffect(() => {
    window && window.addEventListener('resize', updateItemCount)
    return () => {
      window && window.removeEventListener('resize', updateItemCount)
    }
  }, [updateItemCount])

  useEffect(() => {
    updateItemCount()
  }, [updateItemCount])

  return (
    <div
      className="viewport"
      style={{
        willChange: 'transform',
        height: totalHeight,
        position: 'relative',
      }}
    >
      <Container
        style={{
          willChange: 'transform',
          transform: `translateY(${offsetY}px)`,
        }}
      >
        {visibleChildren}
      </Container>
    </div>
  )
}

export default memo(InfiniteVirtualScroll)
