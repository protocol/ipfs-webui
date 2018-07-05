import React from 'react'
import PropTypes from 'prop-types'
import isIPFS from 'is-ipfs'
import Icon from '../../icons/StrokeDecentralization'
import TextInputModal from '../../components/text-input-modal/TextInputModal'

function ByPathModal ({ onCancel, onSubmit, className, ...props }) {
  const onPaste = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const val = e.clipboardData.getData('text').trim()
    const selection = window.getSelection().toString()

    if (selection === '') {
      return e.target.value + val
    } else {
      return e.target.value.replace(selection, val)
    }
  }

  return (
    <TextInputModal
      validate={isIPFS.ipfsPath}
      onCancel={onCancel}
      onSubmit={onSubmit}
      onPaste={onPaste}
      className={className}
      title='Add by path'
      description='Insert the path to add.'
      icon={Icon}
      submitText='Add'
      {...props}
    />
  )
}

ByPathModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
}

export default ByPathModal
