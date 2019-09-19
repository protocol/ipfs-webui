import React from 'react'
import Multiaddr from 'multiaddr'

const Address = ({ value }) => {
  if (!value) return null

  const ma = Multiaddr(value)
  const protos = ma.protoNames().concat('ipfs')
  const parts = value.split('/')

  return (
    <div className='charcoal-muted monospace'>
      {parts.map((chunk, i) => (
        <span key={i}>
          <span className={protos.includes(chunk) ? 'force-select' : 'force-select charcoal'}>{chunk}</span>
          {i < parts.length - 1 ? '/' : ''}
        </span>
      ))}
    </div>
  )
}

export default Address
