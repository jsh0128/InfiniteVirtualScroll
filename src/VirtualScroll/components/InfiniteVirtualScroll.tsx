import React, { memo, useMemo, useState, useEffect, useCallback } from 'react'

import { debounce } from 'lodash'

interface Props {
  onFetchMore: () => void
  renderAhread?: number
  data: Array<any>
  itemClassName: string
  containerClassName: string
  children: (props: any) => JSX.Element
  defaultCardHeight: number
  defaultColumnCount: number
}

const InfiniteVirtualScroll = ({
  onFetchMore,
  renderAhread = 15,
  data,
  itemClassName,
  containerClassName,
  children,
  defaultCardHeight,
  defaultColumnCount,
}: Props) => {
  const [columnCount, setColumnCount] = useState(defaultColumnCount)
  const [scrollTop, setScrollTop] = useState(0)
  const [cardHeight, setCardHeight] = useState(defaultCardHeight)
  const [viewportHeight, setViewPortHeight] = useState(
    document.body.clientHeight,
  )

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

  const visibleNodesCount = useMemo(() => {
    let visibleNodesCount = Math.ceil(
      (viewportHeight / cardHeight) * renderAhread,
    )
    visibleNodesCount = Math.min(itemCount - startNode, visibleNodesCount)

    return visibleNodesCount
  }, [cardHeight, itemCount, renderAhread, startNode, viewportHeight])

  const visibleNodes = useMemo(
    () =>
      data.slice(
        startNode * columnCount,
        (startNode + visibleNodesCount + 1) * columnCount,
      ),
    [columnCount, data, startNode, visibleNodesCount],
  )

  const updateItemCount = useCallback(
    () =>
      debounce(() => {
        if (window) {
          const card = document.getElementsByClassName(itemClassName)[0]
          const grid = document.getElementsByClassName(containerClassName)[0]
          if (grid?.clientWidth && card?.clientWidth) {
            setColumnCount(Math.floor(grid.clientWidth / card.clientWidth))
            card?.clientHeight &&
              setCardHeight(
                card.clientHeight + parseInt(window.getComputedStyle(grid).gap),
              )
            setViewPortHeight(document.body.clientHeight + 500)
          }
        }
      }, 50)(),
    [containerClassName, itemClassName],
  )

  const onScroll = () => {
    return requestAnimationFrame(() => {
      setScrollTop(window.scrollY)
    })
  }

  const infinityScroll = useCallback(() => {
    if (document.body.scrollHeight - 400 < window.scrollY + viewportHeight) {
      onFetchMore()
    }
  }, [onFetchMore, viewportHeight])

  useEffect(() => {
    window.addEventListener('scroll', infinityScroll)
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      window.removeEventListener('scroll', infinityScroll)
    }
  }, [infinityScroll])

  useEffect(() => {
    setScrollTop(window.scrollY)
    window.addEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', updateItemCount)
    return () => {
      window.removeEventListener('resize', updateItemCount)
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
      {React.createElement(children as any, {
        style: {
          willChange: 'transform',
          transform: `translateY(${offsetY}px)`,
        },
        visibleNodes,
      })}
    </div>
  )
}

export default memo(InfiniteVirtualScroll)
