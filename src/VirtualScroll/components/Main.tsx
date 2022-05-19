import React from 'react'
import InfiniteVirtualScroll from './InfiniteVirtualScroll'

export default function Main() {
  const data = new Array(100)
  const onFetchMore = () => {}

  const GridContainer = ({
    children,
    style,
  }: {
    children: React.ReactNode
    style?: React.CSSProperties
  }) => {
    return (
      <div className="Grid" style={style}>
        {children}
      </div>
    )
  }

  const Item = ({ item, key }: { item: number | string; key: React.Key }) => {
    return (
      <div key={key} className="Item">
        {item}
      </div>
    )
  }

  return (
    <InfiniteVirtualScroll
      onFetchMore={onFetchMore}
      data={data}
      Container={GridContainer}
      Item={Item}
      itemClassName="Item"
      containerClassName="Grid"
      cardHeight={300}
    />
  )
}
