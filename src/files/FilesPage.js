import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { Helmet } from 'react-helmet'
import { connect } from 'redux-bundler-react'
import downloadFile from './download-file'
import { translate } from 'react-i18next'
import { MFS_PATH } from '../bundles/files'
// Components
import ContextMenu from './context-menu/ContextMenu'
import InfoBoxes from './info-boxes/InfoBoxes'
import FilePreview from './file-preview/FilePreview'
import FilesList from './files-list/FilesList'
// Icons
import Modals, { DELETE, NEW_FOLDER, SHARE, RENAME, ADD_BY_PATH } from './modals/Modals'
import Header from './header/Header'

const defaultState = {
  downloadAbort: null,
  downloadProgress: null,
  modals: {
    show: null,
    files: null
  },
  contextMenu: {
    isOpen: false,
    translateX: 0,
    translateY: 0,
    file: null
  }
}

class FilesPage extends React.Component {
  constructor (props) {
    super(props)
    this.contextMenuRef = React.createRef()
  }

  state = defaultState

  componentDidMount () {
    this.props.doFilesFetch()
    this.props.doPinsFetch()
  }

  componentDidUpdate (prev) {
    const { filesPathFromHash } = this.props

    if (prev.files === null || !prev.ipfsConnected || filesPathFromHash !== prev.filesPathFromHash) {
      this.props.doFilesFetch()
    }
  }

  onDownload = async (files) => {
    const { doFilesDownloadLink } = this.props
    const { downloadProgress, downloadAbort } = this.state

    if (downloadProgress !== null) {
      downloadAbort()
      return
    }

    const updater = (v) => this.setState({ downloadProgress: v })
    const { url, filename } = await doFilesDownloadLink(files)
    const { abort } = await downloadFile(url, filename, updater)
    this.setState({ downloadAbort: abort })
  }

  onAddFiles = (raw, root = '') => {
    if (root === '') {
      root = this.props.files.path
    }

    this.props.doFilesWrite(raw, root)
  }

  onAddByPath = (path) => {
    this.props.doFilesAddPath(this.props.files.path, path)
  }

  onInspect = (hash) => {
    this.props.doUpdateHash(`/explore/ipfs/${hash}`)
  }

  showModal = (modal, files = null) => {
    this.setState({ modals: { show: modal, files: files } })
  }

  hideModal = () => {
    this.setState({ modals: { } })
  }

  handleContextMenu = (ev, clickType, file, pos) => {
    // This is needed to disable the native OS right-click menu
    // and deal with the clicking on the ContextMenu options
    if (ev !== undefined && typeof ev !== 'string') {
      ev.preventDefault()
      ev.persist()
    }

    const ctxMenu = findDOMNode(this.contextMenuRef.current)
    const ctxMenuPosition = ctxMenu.getBoundingClientRect()

    let translateX = 0
    let translateY = 0

    switch (clickType) {
      case 'RIGHT':
        const rightPadding = window.innerWidth - ctxMenu.parentNode.getBoundingClientRect().right
        translateX = (window.innerWidth - ev.clientX) - rightPadding - 20
        translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - ev.clientY - 10
        break
      case 'TOP':
        const pagePositions = ctxMenu.parentNode.getBoundingClientRect()
        translateX = pagePositions.right - pos.right
        translateY = -(pos.bottom - pagePositions.top + 11)
        break
      default:
        translateX = 1
        translateY = (ctxMenuPosition.y + ctxMenuPosition.height / 2) - (pos && pos.y) - 30
    }

    this.setState({
      contextMenu: {
        isOpen: !this.state.contextMenu.isOpen,
        translateX,
        translateY,
        file
      }
    })
  }

  get mainView () {
    const { files } = this.props

    if (!files) {
      return (<div></div>)
    }

    if (files.type !== 'directory') {
      return (
        <FilePreview {...files} />
      )
    }

    return (
      <FilesList
        key={window.encodeURIComponent(files.path)}
        root={files.path}
        updateSorting={this.props.doFilesUpdateSorting}
        files={files.content}
        upperDir={files.upper}
        downloadProgress={this.state.downloadProgress}
        onShare={(files) => this.showModal(SHARE, files)}
        onRename={(files) => this.showModal(RENAME, files)}
        onDelete={(files) => this.showModal(DELETE, files)}
        onInspect={this.onInspect}
        onDownload={this.onDownload}
        onAddFiles={this.onAddFiles}
        onNavigate={this.props.doFilesNavigateTo}
        onMove={this.props.doFilesMove}
        handleContextMenuClick={this.handleContextMenu} />
    )
  }

  get title () {
    const { files, t } = this.props

    if (files) {
      return `${files.path} - ${t('title')} - IPFS`
    }

    return `${t('title')} - IPFS`
  }

  render () {
    const { files } = this.props
    const { contextMenu } = this.state

    return (
      <div data-id='FilesPage' className='mw9 center'>
        <Helmet>
          <title>{this.title}</title>
        </Helmet>

        <ContextMenu
          ref={this.contextMenuRef}
          isOpen={contextMenu.isOpen}
          translateX={contextMenu.translateX}
          translateY={contextMenu.translateY}
          handleClick={this.handleContextMenu}
          isUpperDir={contextMenu.file && contextMenu.file.name === '..'}
          isMfs={this.props.filesIsMfs}
          pinned={contextMenu.file && contextMenu.file.pinned}
          showDots={false}
          hash={contextMenu.file && contextMenu.file.hash}
          onShare={() => this.showModal(SHARE, [contextMenu.file])}
          onDelete={() => this.showModal(DELETE, [contextMenu.file])}
          onRename={() => this.showModal(RENAME, [contextMenu.file])}
          onInspect={() => this.onInspect(contextMenu.file.hash)}
          onDownload={() => this.onDownload([contextMenu.file])}
          onPin={() => this.props.doFilesPin(contextMenu.file.hash)}
          onUnpin={() => this.props.doFilesUnpin(contextMenu.file.hash)} />

        <Header
          files={files}
          onNavigate={this.props.doFilesNavigateTo}
          onAddFiles={this.onAddFiles}
          onAddByPath={(files) => this.showModal(ADD_BY_PATH, files)}
          onNewFolder={(files) => this.showModal(NEW_FOLDER, files)}
          handleContextMenu={(...args) => this.handleContextMenu(...args, true)} />

        { this.mainView }

        <InfoBoxes isRoot={!!(files && files.path === MFS_PATH)}
          isCompanion={this.props.ipfsProvider === 'window.ipfs'}
          filesExist={!!(files && files.content && files.content.length)} />

        <Modals
          done={this.hideModal}
          root={files ? files.path : null}
          onMove={this.props.doFilesMove}
          onMakeDir={this.props.doFilesMakeDir}
          onShareLink={this.props.doFilesShareLink}
          onDelete={this.props.doFilesDelete}
          onAddByPath={this.onAddByPath}
          { ...this.state.modals } />
      </div>
    )
  }
}

FilesPage.propTypes = {
  t: PropTypes.func.isRequired,
  tReady: PropTypes.bool.isRequired,
  ipfsConnected: PropTypes.bool,
  ipfsProvider: PropTypes.string,
  files: PropTypes.object,
  filesIsMfs: PropTypes.bool,
  filesPathFromHash: PropTypes.string.isRequired,
  doUpdateHash: PropTypes.func.isRequired,
  doPinsFetch: PropTypes.func.isRequired,
  doFilesFetch: PropTypes.func.isRequired,
  doFilesMove: PropTypes.func.isRequired,
  doFilesMakeDir: PropTypes.func.isRequired,
  doFilesShareLink: PropTypes.func.isRequired,
  doFilesDelete: PropTypes.func.isRequired,
  doFilesAddPath: PropTypes.func.isRequired,
  doFilesNavigateTo: PropTypes.func.isRequired,
  doFilesPin: PropTypes.func.isRequired,
  doFilesUnpin: PropTypes.func.isRequired,
  doFilesUpdateSorting: PropTypes.func.isRequired,
  doFilesWrite: PropTypes.func.isRequired,
  doFilesDownloadLink: PropTypes.func.isRequired
}

export default connect(
  'selectIpfsProvider',
  'selectIpfsConnected',
  'selectFiles',
  'selectFilesIsMfs',
  'selectFilesPathFromHash',
  'doUpdateHash',
  'doPinsFetch',
  'doFilesFetch',
  'doFilesMove',
  'doFilesMakeDir',
  'doFilesShareLink',
  'doFilesDelete',
  'doFilesAddPath',
  'doFilesNavigateTo',
  'doFilesPin',
  'doFilesUnpin',
  'doFilesUpdateSorting',
  'doFilesWrite',
  'doFilesDownloadLink',
  translate('files')(FilesPage)
)
