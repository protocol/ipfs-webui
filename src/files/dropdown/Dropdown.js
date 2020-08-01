import React, { forwardRef } from 'react'
import { Dropdown as Drop, DropdownMenu as Menu } from '@tableflip/react-dropdown'
import CopyIcon from '../../icons/CopyIcon'

export const Option = ({ children, onClick, className = '', isCliTutorModeEnabled, onCliTutorMode, ...props }) => (
  isCliTutorModeEnabled
    ? <div className='flex items-center justify-between'>
      <button role="menuitem" className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`} onClick={onClick} {...props}>
        {children}
      </button>
      <a {...props} className={`bg-animate hover-bg-near-white pa2 pointer flex items-center  ${className}`}>
        <CopyIcon onClick={onCliTutorMode} className='dib fill-current-color ph2 glow o-80 pointer'
          style={{ height: '28px', transform: 'scale(1.5)', verticalAlign: 'bottom', color: 'dodgerblue' }}
        />
      </a>
    </div>
    : <button role="menuitem" className={`bg-animate hover-bg-near-white pa2 pointer flex items-center ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
)

export const DropdownMenu = forwardRef((props, ref) => {
  const { children, arrowMarginRight, width = 200, translateX = 0, translateY = 0, ...rest } = props

  return (
    <Menu
      className='sans-serif br2 charcoal'
      boxShadow='rgba(105, 196, 205, 0.5) 0px 1px 10px 0px'
      width={width}
      arrowAlign='right'
      arrowMarginRight={arrowMarginRight || '13px'}
      left={`calc(100% - ${width}px)`}
      translateX={translateX}
      translateY={translateY}
      {...rest}>
      <div className='flex flex-column' ref={ref} role="menu">
        {children}
      </div>
    </Menu>
  )
})

export const Dropdown = Drop
