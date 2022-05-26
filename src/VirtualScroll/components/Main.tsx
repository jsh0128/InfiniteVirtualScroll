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

  const Item = ({
    item,
    key,
    className,
  }: {
    item: number | string
    key: React.Key
    className: string
  }) => {
    return (
      <div key={key} className={className}>
        {item}
      </div>
    )
  }

  return (
    <InfiniteVirtualScroll
      data={data}
      defaultCardHeight={300}
      defaultColumnCount={3}
      onFetchMore={onFetchMore}
      itemClassName="GBNFTCard"
      containerClassName="CommonRatioGridContainer"
    >
      {({ style, visibleNodes }: any) => (
        <div style={style} className="Container">
          {visibleNodes.map((data: any, key: React.Key) => (
            <Item className="GBNFTCard" key={key} item={data} />
          ))}
        </div>
      )}
    </InfiniteVirtualScroll>
  )
}
