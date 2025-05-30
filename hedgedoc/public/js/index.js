/* eslint no-console: ["error", { allow: ["warn", "error", "debug"] }] */
/* global Cookies, moment, serverurl,
   key, Dropbox, Visibility */

import TurndownService from 'turndown'
import CodeMirror from '@hedgedoc/codemirror-5/lib/codemirror.js'

import 'jquery-ui/ui/widgets/resizable'
import 'jquery-ui/themes/base/resizable.css'

import Idle from 'Idle.Js'

import '../vendor/jquery-textcomplete/jquery.textcomplete'

import { ot } from '../vendor/ot/ot.min.js'
import hex2rgb from '../vendor/ot/hex2rgb'

import { saveAs } from 'file-saver'
import randomColor from 'randomcolor'
import store from 'store'
import url from 'wurl'
import { Spinner } from 'spin.js'

import _ from 'lodash'

import List from 'list.js'

import {
  checkLoginStateChanged,
  setloginStateChangeEvent
} from './lib/common/login'

import {
  debug,
  DROPBOX_APP_KEY,
  noteid,
  noteurl,
  urlpath,
  version
} from './lib/config'

import {
  autoLinkify,
  deduplicatedHeaderId,
  exportToHTML,
  exportToRawHTML,
  removeDOMEvents,
  finishView,
  generateToc,
  isValidURL,
  md,
  parseMeta,
  postProcess,
  renderFilename,
  renderTOC,
  renderTags,
  renderTitle,
  scrollToHash,
  smoothHashScroll,
  updateLastChange,
  updateLastChangeUser,
  updateOwner
} from './extra'

import {
  clearMap,
  setupSyncAreas,
  syncScrollToEdit,
  syncScrollToView
} from './lib/syncscroll'

import {
  writeHistory,
  deleteServerHistory,
  getHistory,
  saveHistory,
  removeHistory
} from './history'

import { preventXSS } from './render'

import Editor from './lib/editor'

import getUIElements from './lib/editor/ui-elements'
import modeType from './lib/modeType'
import appState from './lib/appState'

require('../vendor/showup/showup')

require('../css/index.css')
require('../css/extra.css')
require('../css/slide-preview.css')
require('../css/site.css')

require('highlight.js/styles/github-gist.css')
require('./fix-aria-hidden-for-modals')

let defaultTextHeight = 20
let viewportMargin = 20
const defaultEditorMode = 'gfm'

const idleTime = 300000 // 5 mins
const updateViewDebounce = 100
const cursorMenuThrottle = 50
const cursorActivityDebounce = 50
const cursorAnimatePeriod = 100
const supportContainers = ['success', 'info', 'warning', 'danger']
const supportCodeModes = [
  '1c',
  'abnf',
  'accesslog',
  'actionscript',
  'ada',
  'angelscript',
  'apache',
  'applescript',
  'arcade',
  'arduino',
  'armasm',
  'asciidoc',
  'aspectj',
  'autohotkey',
  'autoit',
  'avrasm',
  'awk',
  'axapta',
  'bash',
  'basic',
  'bnf',
  'brainfuck',
  'cal',
  'capnproto',
  'ceylon',
  'c',
  'clean',
  'c-like',
  'clojure',
  'clojure-repl',
  'cmake',
  'coffeescript',
  'coq',
  'cos',
  'cpp',
  'crmsh',
  'crystal',
  'csharp',
  'csp',
  'css',
  'dart',
  'delphi',
  'diff',
  'django',
  'd',
  'dns',
  'dockerfile',
  'dos',
  'dsconfig',
  'dts',
  'dust',
  'ebnf',
  'elixir',
  'elm',
  'erb',
  'erlang',
  'erlang-repl',
  'excel',
  'fix',
  'flix',
  'fortran',
  'fsharp',
  'gams',
  'gauss',
  'gcode',
  'gherkin',
  'glsl',
  'gml',
  'go',
  'golo',
  'gradle',
  'groovy',
  'haml',
  'handlebars',
  'haskell',
  'haxe',
  'hsp',
  'htmlbars',
  'http',
  'hy',
  'inform7',
  'ini',
  'irpf90',
  'isbl',
  'java',
  'javascript',
  'jboss-cli',
  'json',
  'julia',
  'julia-repl',
  'kotlin',
  'lasso',
  'latex',
  'ldif',
  'leaf',
  'less',
  'lisp',
  'livecodeserver',
  'livescript',
  'llvm',
  'lsl',
  'lua',
  'makefile',
  'markdown',
  'mathematica',
  'matlab',
  'maxima',
  'mel',
  'mercury',
  'mipsasm',
  'mizar',
  'mojolicious',
  'monkey',
  'moonscript',
  'n1ql',
  'nginx',
  'nim',
  'nix',
  'node-repl',
  'nsis',
  'objectivec',
  'ocaml',
  'openscad',
  'oxygene',
  'parser3',
  'perl',
  'pf',
  'pgsql',
  'php',
  'php-template',
  'plaintext',
  'pony',
  'powershell',
  'processing',
  'profile',
  'prolog',
  'properties',
  'protobuf',
  'puppet',
  'purebasic',
  'python',
  'python-repl',
  'q',
  'qml',
  'reasonml',
  'rib',
  'r',
  'roboconf',
  'routeros',
  'rsl',
  'ruby',
  'ruleslanguage',
  'rust',
  'sas',
  'scala',
  'scheme',
  'scilab',
  'scss',
  'shell',
  'smali',
  'smalltalk',
  'sml',
  'sqf',
  'sql',
  'sql_more',
  'stan',
  'stata',
  'step21',
  'stylus',
  'subunit',
  'swift',
  'taggerscript',
  'tap',
  'tcl',
  'thrift',
  'tp',
  'twig',
  'typescript',
  'vala',
  'vbnet',
  'vbscript-html',
  'vbscript',
  'verilog',
  'vhdl',
  'vim',
  'x86asm',
  'xl',
  'xml',
  'xquery',
  'yaml',
  'zephir'
]
const supportCharts = ['sequence', 'flow', 'graphviz', 'mermaid', 'abc']
const supportHeaders = [
  {
    text: '# h1',
    search: '#'
  },
  {
    text: '## h2',
    search: '##'
  },
  {
    text: '### h3',
    search: '###'
  },
  {
    text: '#### h4',
    search: '####'
  },
  {
    text: '##### h5',
    search: '#####'
  },
  {
    text: '###### h6',
    search: '######'
  },
  {
    text: '###### tags: `example`',
    search: '###### tags:'
  }
]
const supportReferrals = [
  {
    text: '[reference link]',
    search: '[]'
  },
  {
    text: '[reference]: https:// "title"',
    search: '[]:'
  },
  {
    text: '[^footnote link]',
    search: '[^]'
  },
  {
    text: '[^footnote reference]: https:// "title"',
    search: '[^]:'
  },
  {
    text: '^[inline footnote]',
    search: '^[]'
  },
  {
    text: '[link text][reference]',
    search: '[][]'
  },
  {
    text: '[link text](https:// "title")',
    search: '[]()'
  },
  {
    text: '![image alt][reference]',
    search: '![][]'
  },
  {
    text: '![image alt](https:// "title")',
    search: '![]()'
  },
  {
    text: '![image alt](https:// "title" =WidthxHeight)',
    search: '![]()'
  },
  {
    text: '[TOC]',
    search: '[]'
  }
]
const supportExternals = [
  {
    text: '{%youtube youtubeid %}',
    search: 'youtube'
  },
  {
    text: '{%vimeo vimeoid %}',
    search: 'vimeo'
  },
  {
    text: '{%gist gistid %}',
    search: 'gist'
  },
  {
    text: '{%slideshare slideshareid %}',
    search: 'slideshare'
  },
  {
    text: '{%speakerdeck speakerdeckid %}',
    search: 'speakerdeck'
  },
  {
    text: '{%pdf pdfurl %}',
    search: 'pdf'
  }
]
const supportExtraTags = [
  {
    text: '[name tag]',
    search: '[]',
    command: function () {
      return '[name=' + personalInfo.name + ']'
    }
  },
  {
    text: '[time tag]',
    search: '[]',
    command: function () {
      return '[time=' + moment().format('llll') + ']'
    }
  },
  {
    text: '[my color tag]',
    search: '[]',
    command: function () {
      return '[color=' + personalInfo.color + ']'
    }
  },
  {
    text: '[random color tag]',
    search: '[]',
    command: function () {
      const color = randomColor()
      return '[color=' + color + ']'
    }
  }
]
const statusType = {
  connected: {
    msg: 'CONNECTED',
    label: 'label-warning',
    fa: 'fa-wifi'
  },
  online: {
    msg: 'ONLINE',
    label: 'label-primary',
    fa: 'fa-users'
  },
  offline: {
    msg: 'OFFLINE',
    label: 'label-danger',
    fa: 'fa-plug'
  }
}

// global vars
window.loaded = false
let needRefresh = false
let isDirty = false
let editShown = false
let visibleXS = false
let visibleSM = false
let visibleMD = false
let visibleLG = false
const isTouchDevice = 'ontouchstart' in document.documentElement
let currentStatus = statusType.offline
const lastInfo = {
  needRestore: false,
  cursor: null,
  scroll: null,
  edit: {
    scroll: {
      left: null,
      top: null
    },
    cursor: {
      line: null,
      ch: null
    },
    selections: null
  },
  view: {
    scroll: {
      left: null,
      top: null
    }
  },
  history: null
}
let personalInfo = {}
let onlineUsers = []
const fileTypes = {
  pl: 'perl',
  cgi: 'perl',
  js: 'javascript',
  php: 'php',
  sh: 'bash',
  rb: 'ruby',
  html: 'html',
  py: 'python'
}

// editor settings
const textit = document.getElementById('textit')
if (!textit) {
  throw new Error('There was no textit area!')
}

const editorInstance = new Editor()
const editor = editorInstance.init(textit)

// FIXME: global referncing in jquery-textcomplete patch
window.editor = editor

defaultTextHeight = parseInt($('.CodeMirror').css('line-height'))

//  initalize ui reference
const ui = getUIElements()

// page actions
const opts = {
  lines: 11, // The number of lines to draw
  length: 20, // The length of each line
  width: 2, // The line thickness
  radius: 30, // The radius of the inner circle
  corners: 0, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#000', // #rgb or #rrggbb or array of colors
  speed: 1.1, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: true, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
}

/* eslint-disable no-unused-vars */
const spinner = new Spinner(opts).spin(ui.spinner[0])
/* eslint-enable no-unused-vars */

// idle
const idle = new Idle({
  onAway: function () {
    idle.isAway = true
    emitUserStatus()
    updateOnlineStatus()
  },
  onAwayBack: function () {
    idle.isAway = false
    emitUserStatus()
    updateOnlineStatus()
    setHaveUnreadChanges(false)
    updateTitleReminder()
  },
  awayTimeout: idleTime
})
ui.area.codemirror.on('touchstart', function () {
  idle.onActive()
})

let haveUnreadChanges = false

function setHaveUnreadChanges (bool) {
  if (!window.loaded) return
  if (bool && (idle.isAway || Visibility.hidden())) {
    haveUnreadChanges = true
  } else if (!bool && !idle.isAway && !Visibility.hidden()) {
    haveUnreadChanges = false
  }
}

function updateTitleReminder () {
  if (!window.loaded) return
  if (haveUnreadChanges) {
    document.title = '• ' + renderTitle(ui.area.markdown)
  } else {
    document.title = renderTitle(ui.area.markdown)
  }
}

function setRefreshModal (status) {
  $('#refreshModal').modal('show')
  $('#refreshModal').find('.modal-body > div').hide()
  $('#refreshModal')
    .find('.' + status)
    .show()
}

function setNeedRefresh () {
  needRefresh = true
  editor.setOption('readOnly', true)
  socket.disconnect()
  showStatus(statusType.offline)
}

setloginStateChangeEvent(function () {
  setRefreshModal('user-state-changed')
  setNeedRefresh()
})

// visibility
let wasFocus = false
Visibility.change(function (e, state) {
  const hidden = Visibility.hidden()
  if (hidden) {
    if (editorHasFocus()) {
      wasFocus = true
      editor.getInputField().blur()
    }
  } else {
    if (wasFocus) {
      if (!visibleXS) {
        editor.focus()
        editor.refresh()
      }
      wasFocus = false
    }
    setHaveUnreadChanges(false)
  }
  updateTitleReminder()
})

// when page ready
$(document).ready(function () {
  // set global ajax timeout
  $.ajaxSetup({
    timeout: 10000
  })

  idle.checkAway()
  checkResponsive()
  // if in smaller screen, we don't need advanced scrollbar
  let scrollbarStyle
  if (visibleXS) {
    scrollbarStyle = 'native'
  } else {
    scrollbarStyle = 'overlay'
  }
  if (scrollbarStyle !== editor.getOption('scrollbarStyle')) {
    editor.setOption('scrollbarStyle', scrollbarStyle)
    clearMap()
  }
  checkEditorStyle()

  /* cache dom references */
  const $body = $('body')

  /* we need this only on touch devices */
  if (isTouchDevice) {
    /* bind events */
    $(document)
      .on('focus', 'textarea, input', function () {
        $body.addClass('fixfixed')
      })
      .on('blur', 'textarea, input', function () {
        $body.removeClass('fixfixed')
      })
  }

  if (Cookies.get('nightMode') !== undefined) {
    store.set('nightMode', Cookies.get('nightMode') === 'true')
    Cookies.remove('nightMode')
  }

  // Re-enable nightmode
  if (store.get('nightMode') === true) {
    $body.addClass('night')
    ui.toolbar.night.addClass('active')
  }

  // showup
  $().showUp('.navbar', {
    upClass: 'navbar-hide',
    downClass: 'navbar-show'
  })
  // tooltip
  $('[data-toggle="tooltip"]').tooltip()
  // shortcuts
  // allow on all tags
  key.filter = function (e) {
    return true
  }
  key('ctrl+alt+e', function (e) {
    changeMode(modeType.edit)
  })
  key('ctrl+alt+v', function (e) {
    changeMode(modeType.view)
  })
  key('ctrl+alt+b', function (e) {
    changeMode(modeType.both)
  })
  // toggle-dropdown
  $(document).on('click', '.toggle-dropdown .dropdown-menu', function (e) {
    e.stopPropagation()
  })
})
// when page resize
$(window).resize(function () {
  checkLayout()
  checkEditorStyle()
  checkTocStyle()
  checkCursorMenu()
  windowResize()
})
// when page unload
$(window).on('unload', function () {
  // updateHistoryInner();
})
$(window).on('error', function () {
  // setNeedRefresh();
})

setupSyncAreas(
  ui.area.codemirrorScroll,
  ui.area.view,
  ui.area.markdown,
  editor
)

function autoSyncscroll () {
  if (editorHasFocus()) {
    syncScrollToView()
  } else {
    syncScrollToEdit()
  }
}

const windowResizeDebounce = 200
const windowResize = _.debounce(windowResizeInner, windowResizeDebounce)

function windowResizeInner (callback) {
  checkLayout()
  checkResponsive()
  checkEditorStyle()
  checkTocStyle()
  checkCursorMenu()
  // refresh editor
  if (window.loaded) {
    if (editor.getOption('scrollbarStyle') === 'native') {
      setTimeout(function () {
        clearMap()
        autoSyncscroll()
        updateScrollspy()
        if (callback && typeof callback === 'function') {
          callback()
        }
      }, 1)
    } else {
      // force it load all docs at once to prevent scroll knob blink
      editor.setOption('viewportMargin', Infinity)
      setTimeout(function () {
        clearMap()
        autoSyncscroll()
        editor.setOption('viewportMargin', viewportMargin)
        // add or update user cursors
        for (let i = 0; i < onlineUsers.length; i++) {
          if (onlineUsers[i].id !== personalInfo.id) {
            buildCursor(onlineUsers[i])
          }
        }
        updateScrollspy()
        if (callback && typeof callback === 'function') {
          callback()
        }
      }, 1)
    }
  }
}

function checkLayout () {
  const navbarHieght = $('.navbar').outerHeight()
  $('body').css('padding-top', navbarHieght + 'px')
}

function editorHasFocus () {
  return $(editor.getInputField()).is(':focus')
}

// 768-792px have a gap
function checkResponsive () {
  visibleXS = $('.visible-xs').is(':visible')
  visibleSM = $('.visible-sm').is(':visible')
  visibleMD = $('.visible-md').is(':visible')
  visibleLG = $('.visible-lg').is(':visible')

  if (visibleXS && appState.currentMode === modeType.both) {
    if (editorHasFocus()) {
      changeMode(modeType.edit)
    } else {
      changeMode(modeType.view)
    }
  }

  emitUserStatus()
}

let lastEditorWidth = 0
let previousFocusOnEditor = null

function checkEditorStyle () {
  let desireHeight = editorInstance.statusBar
    ? ui.area.edit.height() - editorInstance.statusBar.outerHeight()
    : ui.area.edit.height()
  if (editorInstance.toolBar) {
    desireHeight = desireHeight - editorInstance.toolBar.outerHeight()
  }
  // set editor height and min height based on scrollbar style and mode
  const scrollbarStyle = editor.getOption('scrollbarStyle')
  if (scrollbarStyle === 'overlay' || appState.currentMode === modeType.both) {
    ui.area.codemirrorScroll.css('height', desireHeight + 'px')
    ui.area.codemirrorScroll.css('min-height', '')
    checkEditorScrollbar()
  } else if (scrollbarStyle === 'native') {
    ui.area.codemirrorScroll.css('height', '')
    ui.area.codemirrorScroll.css('min-height', desireHeight + 'px')
  }
  // workaround editor will have wrong doc height when editor height changed
  editor.setSize(null, ui.area.edit.height())
  // make editor resizable
  if (!ui.area.resize.handle.length) {
    ui.area.edit.resizable({
      handles: 'e',
      maxWidth: $(window).width() * 0.7,
      minWidth: $(window).width() * 0.2,
      create: function (e, ui) {
        $(this)
          .parent()
          .on('resize', function (e) {
            e.stopPropagation()
          })
      },
      start: function (e) {
        editor.setOption('viewportMargin', Infinity)
      },
      resize: function (e) {
        ui.area.resize.syncToggle.stop(true, true).show()
        checkTocStyle()
      },
      stop: function (e) {
        lastEditorWidth = ui.area.edit.width()
        // workaround that scroll event bindings
        window.preventSyncScrollToView = 2
        window.preventSyncScrollToEdit = true
        editor.setOption('viewportMargin', viewportMargin)
        if (editorHasFocus()) {
          windowResizeInner(function () {
            ui.area.codemirrorScroll.scroll()
          })
        } else {
          windowResizeInner(function () {
            ui.area.view.scroll()
          })
        }
        checkEditorScrollbar()
      }
    })
    ui.area.resize.handle = $('.ui-resizable-handle')
  }
  if (!ui.area.resize.syncToggle.length) {
    ui.area.resize.syncToggle = $(
      '<button class="btn btn-lg btn-default ui-sync-toggle" title="Toggle sync scrolling"><i class="fa fa-link fa-fw"></i></button>'
    )
    ui.area.resize.syncToggle.hover(
      function () {
        previousFocusOnEditor = editorHasFocus()
      },
      function () {
        previousFocusOnEditor = null
      }
    )
    ui.area.resize.syncToggle.click(function () {
      appState.syncscroll = !appState.syncscroll
      checkSyncToggle()
    })
    ui.area.resize.handle.append(ui.area.resize.syncToggle)
    ui.area.resize.syncToggle.hide()
    ui.area.resize.handle.hover(
      function () {
        ui.area.resize.syncToggle.stop(true, true).delay(200).fadeIn(100)
      },
      function () {
        ui.area.resize.syncToggle.stop(true, true).delay(300).fadeOut(300)
      }
    )
  }
}

function checkSyncToggle () {
  if (appState.syncscroll) {
    if (previousFocusOnEditor) {
      window.preventSyncScrollToView = false
      syncScrollToView()
    } else {
      window.preventSyncScrollToEdit = false
      syncScrollToEdit()
    }
    ui.area.resize.syncToggle
      .find('i')
      .removeClass('fa-unlink')
      .addClass('fa-link')
  } else {
    ui.area.resize.syncToggle
      .find('i')
      .removeClass('fa-link')
      .addClass('fa-unlink')
  }
}

const checkEditorScrollbar = _.debounce(function () {
  editor.operation(checkEditorScrollbarInner)
}, 50)

function checkEditorScrollbarInner () {
  // workaround simple scroll bar knob
  // will get wrong position when editor height changed
  const scrollInfo = editor.getScrollInfo()
  editor.scrollTo(null, scrollInfo.top - 1)
  editor.scrollTo(null, scrollInfo.top)
}

function checkTocStyle () {
  // toc right
  const paddingRight = parseFloat(ui.area.markdown.css('padding-right'))
  const right =
    $(window).width() -
    (ui.area.markdown.offset().left +
      ui.area.markdown.outerWidth() -
      paddingRight)
  ui.toc.toc.css('right', right + 'px')
  // affix toc left
  let newbool
  const rightMargin =
    (ui.area.markdown.parent().outerWidth() - ui.area.markdown.outerWidth()) /
    2
  // for ipad or wider device
  if (rightMargin >= 133) {
    newbool = true
    const affixLeftMargin =
      (ui.toc.affix.outerWidth() - ui.toc.affix.width()) / 2
    const left =
      ui.area.markdown.offset().left +
      ui.area.markdown.outerWidth() -
      affixLeftMargin
    ui.toc.affix.css('left', left + 'px')
    ui.toc.affix.css('width', rightMargin + 'px')
  } else {
    newbool = false
  }
  // toc scrollspy
  ui.toc.toc.removeClass('scrollspy-body, scrollspy-view')
  ui.toc.affix.removeClass('scrollspy-body, scrollspy-view')
  if (appState.currentMode === modeType.both) {
    ui.toc.toc.addClass('scrollspy-view')
    ui.toc.affix.addClass('scrollspy-view')
  } else if (appState.currentMode !== modeType.both && !newbool) {
    ui.toc.toc.addClass('scrollspy-body')
    ui.toc.affix.addClass('scrollspy-body')
  } else {
    ui.toc.toc.addClass('scrollspy-view')
    ui.toc.affix.addClass('scrollspy-body')
  }
  if (newbool !== enoughForAffixToc) {
    enoughForAffixToc = newbool
    generateScrollspy()
  }
}

function showStatus (type, num) {
  currentStatus = type
  const shortStatus = ui.toolbar.shortStatus
  const status = ui.toolbar.status
  const label = $('<span class="label"></span>')
  const fa = $('<i class="fa"></i>')
  let msg = ''
  let shortMsg = ''

  shortStatus.html('')
  status.html('')

  switch (currentStatus) {
    case statusType.connected:
      label.addClass(statusType.connected.label)
      fa.addClass(statusType.connected.fa)
      msg = statusType.connected.msg
      break
    case statusType.online:
      label.addClass(statusType.online.label)
      fa.addClass(statusType.online.fa)
      shortMsg = num
      msg = num + ' ' + statusType.online.msg
      break
    case statusType.offline:
      label.addClass(statusType.offline.label)
      fa.addClass(statusType.offline.fa)
      msg = statusType.offline.msg
      break
  }

  label.append(fa)
  const shortLabel = label.clone()

  shortLabel.append(' ' + shortMsg)
  shortStatus.append(shortLabel)

  label.append(' ' + msg)
  status.append(label)
}

function toggleMode () {
  switch (appState.currentMode) {
    case modeType.edit:
      changeMode(modeType.view)
      break
    case modeType.view:
      changeMode(modeType.edit)
      break
    case modeType.both:
      changeMode(modeType.view)
      break
  }
}

let lastMode = null

function changeMode (type) {
  // lock navbar to prevent it hide after changeMode
  lockNavbar()
  saveInfo()
  if (type) {
    lastMode = appState.currentMode
    appState.currentMode = type
  }
  const responsiveClass = 'col-lg-6 col-md-6 col-sm-6'
  const scrollClass = 'ui-scrollable'
  ui.area.codemirror.removeClass(scrollClass)
  ui.area.edit.removeClass(responsiveClass)
  ui.area.view.removeClass(scrollClass)
  ui.area.view.removeClass(responsiveClass)
  switch (appState.currentMode) {
    case modeType.edit:
      ui.area.edit.show()
      ui.area.view.hide()
      if (!editShown) {
        editor.refresh()
        editShown = true
      }
      break
    case modeType.view:
      ui.area.edit.hide()
      ui.area.view.show()
      break
    case modeType.both:
      ui.area.codemirror.addClass(scrollClass)
      ui.area.edit.addClass(responsiveClass).show()
      ui.area.view.addClass(scrollClass)
      ui.area.view.show()
      break
  }
  // save mode to url
  if (history.replaceState && window.loaded) {
    history.replaceState(
      null,
      '',
      serverurl + '/' + noteid + '?' + appState.currentMode.name
    )
  }
  if (appState.currentMode === modeType.view) {
    editor.getInputField().blur()
  }
  if (
    appState.currentMode === modeType.edit ||
    appState.currentMode === modeType.both
  ) {
    // add and update status bar
    if (!editorInstance.statusBar) {
      editorInstance.addStatusBar()
      editorInstance.updateStatusBar()
    }
    // add and update tool bar
    if (!editorInstance.toolBar) {
      editorInstance.addToolBar()
    }
    // work around foldGutter might not init properly
    editor.setOption('foldGutter', false)
    editor.setOption('foldGutter', true)
  }
  if (appState.currentMode !== modeType.edit) {
    $(document.body).css('background-color', 'white')
    refreshView()
  } else {
    $(document.body).css(
      'background-color',
      ui.area.codemirror.css('background-color')
    )
  }
  // check resizable editor style
  if (appState.currentMode === modeType.both) {
    if (lastEditorWidth > 0) {
      ui.area.edit.css('width', lastEditorWidth + 'px')
    } else {
      ui.area.edit.css('width', '')
    }
    ui.area.resize.handle.show()
  } else {
    ui.area.edit.css('width', '')
    ui.area.resize.handle.hide()
  }

  windowResizeInner()

  restoreInfo()

  if (lastMode === modeType.view && appState.currentMode === modeType.both) {
    window.preventSyncScrollToView = 2
    syncScrollToEdit(null, true)
  }

  if (lastMode === modeType.edit && appState.currentMode === modeType.both) {
    window.preventSyncScrollToEdit = 2
    syncScrollToView(null, true)
  }

  if (lastMode === modeType.both && appState.currentMode !== modeType.both) {
    window.preventSyncScrollToView = false
    window.preventSyncScrollToEdit = false
  }

  if (lastMode !== modeType.edit && appState.currentMode === modeType.edit) {
    editor.refresh()
  }

  $(document.body).scrollspy('refresh')
  ui.area.view.scrollspy('refresh')

  ui.toolbar.both.removeClass('active')
  ui.toolbar.edit.removeClass('active')
  ui.toolbar.view.removeClass('active')
  const modeIcon = ui.toolbar.mode.find('i')
  modeIcon.removeClass('fa-pencil').removeClass('fa-eye')
  if (ui.area.edit.is(':visible') && ui.area.view.is(':visible')) {
    // both
    ui.toolbar.both.addClass('active')
    modeIcon.addClass('fa-eye')
  } else if (ui.area.edit.is(':visible')) {
    // edit
    ui.toolbar.edit.addClass('active')
    modeIcon.addClass('fa-eye')
  } else if (ui.area.view.is(':visible')) {
    // view
    ui.toolbar.view.addClass('active')
    modeIcon.addClass('fa-pencil')
  }
  unlockNavbar()
}

function lockNavbar () {
  $('.navbar').addClass('locked')
}

const unlockNavbar = _.debounce(function () {
  $('.navbar').removeClass('locked')
}, 200)

function showMessageModal (title, header, href, text, success) {
  const modal = $('.message-modal')
  modal.find('.modal-title').html(title)
  modal.find('.modal-body h5').html(header)
  if (href) {
    modal.find('.modal-body a').attr('href', href).text(text)
  } else {
    modal.find('.modal-body a').removeAttr('href').text(text)
  }
  modal
    .find('.modal-footer button')
    .removeClass('btn-default btn-success btn-danger')
  if (success) {
    modal.find('.modal-footer button').addClass('btn-success')
  } else {
    modal.find('.modal-footer button').addClass('btn-danger')
  }
  modal.modal('show')
}

// check if dropbox app key is set and load scripts
if (DROPBOX_APP_KEY) {
  $('<script>')
    .attr('type', 'text/javascript')
    .attr('src', 'https://www.dropbox.com/static/api/2/dropins.js')
    .attr('id', 'dropboxjs')
    .attr('data-app-key', DROPBOX_APP_KEY)
    .prop('async', true)
    .prop('defer', true)
    .appendTo('body')
} else {
  ui.toolbar.import.dropbox.hide()
  ui.toolbar.export.dropbox.hide()
}

// button actions
// share
ui.toolbar.publish.attr('href', noteurl + '/publish')
// extra
// slide
ui.toolbar.extra.slide.attr('href', noteurl + '/slide')
// download
// markdown
ui.toolbar.download.markdown.click(function (e) {
  e.preventDefault()
  e.stopPropagation()
  const filename = renderFilename(ui.area.markdown) + '.md'
  const markdown = editor.getValue()
  const blob = new Blob([markdown], {
    type: 'text/markdown;charset=utf-8'
  })
  saveAs(blob, filename, true)
})
// html
ui.toolbar.download.html.click(function (e) {
  e.preventDefault()
  e.stopPropagation()
  exportToHTML(ui.area.markdown)
})
// raw html
ui.toolbar.download.rawhtml.click(function (e) {
  e.preventDefault()
  e.stopPropagation()
  exportToRawHTML(ui.area.markdown)
})
// export to dropbox
ui.toolbar.export.dropbox.click(function (event) {
  event.preventDefault()
  const filename = renderFilename(ui.area.markdown) + '.md'
  const options = {
    files: [
      {
        url: noteurl + '/download',
        filename
      }
    ],
    error: function (errorMessage) {
      console.error(errorMessage)
    }
  }
  Dropbox.save(options)
})
// export to gist
ui.toolbar.export.gist.attr('href', noteurl + '/gist')
// export to snippet
ui.toolbar.export.snippet.click(function () {
  ui.spinner.show()
  $.get(serverurl + '/auth/gitlab/callback/' + noteid + '/projects')
    .done(function (data) {
      $('#snippetExportModalAccessToken').val(data.accesstoken)
      $('#snippetExportModalBaseURL').val(data.baseURL)
      $('#snippetExportModalVersion').val(data.version)
      $('#snippetExportModalLoading').hide()
      $('#snippetExportModal').modal('toggle')
      $('#snippetExportModalProjects')
        .find('option')
        .remove()
        .end()
        .append(
          '<option value="init" selected="selected" disabled="disabled">Select From Available Projects</option>'
        )
      if (data.projects) {
        data.projects.sort(function (a, b) {
          return a.path_with_namespace < b.path_with_namespace
            ? -1
            : a.path_with_namespace > b.path_with_namespace
              ? 1
              : 0
        })
        data.projects.forEach(function (project) {
          if (
            !project.snippets_enabled ||
            (project.permissions.project_access === null &&
              project.permissions.group_access === null) ||
            (project.permissions.project_access !== null &&
              project.permissions.project_access.access_level < 20)
          ) {
            return
          }
          $('<option>')
            .val(project.id)
            .text(project.path_with_namespace)
            .appendTo('#snippetExportModalProjects')
        })
        $('#snippetExportModalProjects').prop('disabled', false)
      }
      $('#snippetExportModalLoading').hide()
    })
    .fail(function (data) {
      showMessageModal(
        '<i class="fa fa-gitlab"></i> Import from Snippet',
        'Unable to fetch gitlab parameters :(',
        '',
        '',
        false
      )
    })
    .always(function () {
      ui.spinner.hide()
    })
})
// import from dropbox
ui.toolbar.import.dropbox.click(function (event) {
  event.preventDefault()
  const options = {
    success: function (files) {
      ui.spinner.show()
      const url = files[0].link
      importFromUrl(url)
    },
    linkType: 'direct',
    multiselect: false,
    extensions: ['.md', '.html']
  }
  Dropbox.choose(options)
})
// import from gist
ui.toolbar.import.gist.click(function () {
  // na
})
// import from snippet
ui.toolbar.import.snippet.click(function () {
  ui.spinner.show()
  $.get(serverurl + '/auth/gitlab/callback/' + noteid + '/projects')
    .done(function (data) {
      $('#snippetImportModalAccessToken').val(data.accesstoken)
      $('#snippetImportModalBaseURL').val(data.baseURL)
      $('#snippetImportModalVersion').val(data.version)
      $('#snippetImportModalContent').prop('disabled', false)
      $('#snippetImportModalConfirm').prop('disabled', false)
      $('#snippetImportModalLoading').hide()
      $('#snippetImportModal').modal('toggle')
      $('#snippetImportModalProjects')
        .find('option')
        .remove()
        .end()
        .append(
          '<option value="init" selected="selected" disabled="disabled">Select From Available Projects</option>'
        )
      if (data.projects) {
        data.projects.sort(function (a, b) {
          return a.path_with_namespace < b.path_with_namespace
            ? -1
            : a.path_with_namespace > b.path_with_namespace
              ? 1
              : 0
        })
        data.projects.forEach(function (project) {
          if (
            !project.snippets_enabled ||
            (project.permissions.project_access === null &&
              project.permissions.group_access === null) ||
            (project.permissions.project_access !== null &&
              project.permissions.project_access.access_level < 20)
          ) {
            return
          }
          $('<option>')
            .val(project.id)
            .text(project.path_with_namespace)
            .appendTo('#snippetImportModalProjects')
        })
        $('#snippetImportModalProjects').prop('disabled', false)
      }
      $('#snippetImportModalLoading').hide()
    })
    .fail(function (data) {
      showMessageModal(
        '<i class="fa fa-gitlab"></i> Import from Snippet',
        'Unable to fetch gitlab parameters :(',
        '',
        '',
        false
      )
    })
    .always(function () {
      ui.spinner.hide()
    })
})
// toc
ui.toc.dropdown.click(function (e) {
  e.stopPropagation()
})
// prevent empty link change hash
$('a[href="#"]').click(function (e) {
  e.preventDefault()
})

// modal actions
let revisions = []
let revisionViewer = null
let revisionInsert = []
let revisionDelete = []
let revisionInsertAnnotation = null
let revisionDeleteAnnotation = null
const revisionList = ui.modal.revision.find('.ui-revision-list')
let revision = null
let revisionTime = null
ui.modal.revision.on('show.bs.modal', function (e) {
  $.get(noteurl + '/revision')
    .done(function (data) {
      parseRevisions(data.revision)
      initRevisionViewer()
    })
    .fail(function (err) {
      if (debug) {
        console.debug(err)
      }
    })
    .always(function () {
      // na
    })
})
function checkRevisionViewer () {
  if (revisionViewer) {
    const container = $(revisionViewer.display.wrapper).parent()
    $(revisionViewer.display.scroller).css('height', container.height() + 'px')
    revisionViewer.refresh()
  }
}
ui.modal.revision.on('shown.bs.modal', checkRevisionViewer)
$(window).resize(checkRevisionViewer)
function parseRevisions (_revisions) {
  if (_revisions.length !== revisions) {
    revisions = _revisions
    let lastRevision = null
    if (revisionList.children().length > 0) {
      lastRevision = revisionList.find('.active').attr('data-revision-time')
    }
    revisionList.html('')
    for (let i = 0; i < revisions.length; i++) {
      const revision = revisions[i]
      const item = $('<a class="list-group-item"></a>')
      item.attr('data-revision-time', revision.time)
      if (lastRevision === revision.time) item.addClass('active')
      const itemHeading = $('<h5 class="list-group-item-heading"></h5>')
      itemHeading.html(
        '<i class="fa fa-clock-o"></i> ' + moment(revision.time).format('llll')
      )
      const itemText = $('<p class="list-group-item-text"></p>')
      itemText.html(
        '<i class="fa fa-file-text"></i> Length: ' + revision.length
      )
      item.append(itemHeading).append(itemText)
      item.click(function (e) {
        const time = $(this).attr('data-revision-time')
        selectRevision(time)
      })
      revisionList.append(item)
    }
    if (!lastRevision) {
      selectRevision(revisions[0].time)
    }
  }
}
function selectRevision (time) {
  if (time === revisionTime) return
  $.get(noteurl + '/revision/' + time)
    .done(function (data) {
      revision = data
      revisionTime = time
      const lastScrollInfo = revisionViewer.getScrollInfo()
      revisionList.children().removeClass('active')
      revisionList
        .find('[data-revision-time="' + time + '"]')
        .addClass('active')
      const content = revision.content
      revisionViewer.setValue(content)
      revisionViewer.scrollTo(null, lastScrollInfo.top)
      revisionInsert = []
      revisionDelete = []
      // mark the text which have been insert or delete
      if (revision.patch.length > 0) {
        let bias = 0
        for (let j = 0; j < revision.patch.length; j++) {
          const patch = revision.patch[j]
          let currIndex = patch.start1 + bias
          for (let i = 0; i < patch.diffs.length; i++) {
            const diff = patch.diffs[i]
            // ignore if diff only contains line breaks
            if ((diff[1].match(/\n/g) || []).length === diff[1].length) { continue }
            let prePos, postPos
            switch (diff[0]) {
              case 0: // retain
                currIndex += diff[1].length
                break
              case 1: // insert
                prePos = revisionViewer.posFromIndex(currIndex)
                postPos = revisionViewer.posFromIndex(
                  currIndex + diff[1].length
                )
                revisionInsert.push({
                  from: prePos,
                  to: postPos
                })
                revisionViewer.markText(prePos, postPos, {
                  css:
                    'background-color: rgba(230,255,230,0.7); text-decoration: underline;'
                })
                currIndex += diff[1].length
                break
              case -1: // delete
                prePos = revisionViewer.posFromIndex(currIndex)
                revisionViewer.replaceRange(diff[1], prePos)
                postPos = revisionViewer.posFromIndex(
                  currIndex + diff[1].length
                )
                revisionDelete.push({
                  from: prePos,
                  to: postPos
                })
                revisionViewer.markText(prePos, postPos, {
                  css:
                    'background-color: rgba(255,230,230,0.7); text-decoration: line-through;'
                })
                bias += diff[1].length
                currIndex += diff[1].length
                break
            }
          }
        }
      }
      revisionInsertAnnotation.update(revisionInsert)
      revisionDeleteAnnotation.update(revisionDelete)
    })
    .fail(function (err) {
      if (debug) {
        console.debug(err)
      }
    })
    .always(function () {
      // na
    })
}
function initRevisionViewer () {
  if (revisionViewer) return
  const revisionViewerTextArea = document.getElementById('revisionViewer')
  revisionViewer = CodeMirror.fromTextArea(revisionViewerTextArea, {
    mode: defaultEditorMode,
    viewportMargin,
    lineNumbers: true,
    lineWrapping: true,
    showCursorWhenSelecting: true,
    inputStyle: 'textarea',
    gutters: ['CodeMirror-linenumbers'],
    flattenSpans: true,
    addModeClass: true,
    readOnly: true,
    autoRefresh: true,
    scrollbarStyle: 'overlay'
  })
  revisionInsertAnnotation = revisionViewer.annotateScrollbar({
    className: 'CodeMirror-insert-match'
  })
  revisionDeleteAnnotation = revisionViewer.annotateScrollbar({
    className: 'CodeMirror-delete-match'
  })
  checkRevisionViewer()
}
$('#revisionModalDownload').click(function () {
  if (!revision) return
  const filename =
    renderFilename(ui.area.markdown) + '_' + revisionTime + '.md'
  const blob = new Blob([revision.content], {
    type: 'text/markdown;charset=utf-8'
  })
  saveAs(blob, filename, true)
})
$('#revisionModalRevert').click(function () {
  if (!revision) return
  editor.setValue(revision.content)
  ui.modal.revision.modal('hide')
})
// snippet projects
ui.modal.snippetImportProjects.change(function () {
  const accesstoken = $('#snippetImportModalAccessToken').val()
  const baseURL = $('#snippetImportModalBaseURL').val()
  const project = $('#snippetImportModalProjects').val()
  const version = $('#snippetImportModalVersion').val()
  $('#snippetImportModalLoading').show()
  $('#snippetImportModalContent').val('/projects/' + project)
  $.get(
    baseURL +
      '/api/' +
      version +
      '/projects/' +
      project +
      '/snippets?access_token=' +
      accesstoken
  )
    .done(function (data) {
      $('#snippetImportModalSnippets')
        .find('option')
        .remove()
        .end()
        .append(
          '<option value="init" selected="selected" disabled="disabled">Select From Available Snippets</option>'
        )
      data.forEach(function (snippet) {
        $('<option>')
          .val(snippet.id)
          .text(snippet.title)
          .appendTo($('#snippetImportModalSnippets'))
      })
      $('#snippetImportModalLoading').hide()
      $('#snippetImportModalSnippets').prop('disabled', false)
    })
    .fail(function (err) {
      if (debug) {
        console.debug(err)
      }
    })
    .always(function () {
      // na
    })
})
// snippet snippets
ui.modal.snippetImportSnippets.change(function () {
  const snippet = $('#snippetImportModalSnippets').val()
  $('#snippetImportModalContent').val(
    $('#snippetImportModalContent').val() + '/snippets/' + snippet
  )
})

function scrollToTop () {
  if (appState.currentMode === modeType.both) {
    if (editor.getScrollInfo().top !== 0) {
      editor.scrollTo(0, 0)
    } else {
      ui.area.view.animate(
        {
          scrollTop: 0
        },
        100,
        'linear'
      )
    }
  } else {
    $('body, html').stop(true, true).animate(
      {
        scrollTop: 0
      },
      100,
      'linear'
    )
  }
}

function scrollToBottom () {
  if (appState.currentMode === modeType.both) {
    const scrollInfo = editor.getScrollInfo()
    const scrollHeight = scrollInfo.height
    if (scrollInfo.top !== scrollHeight) {
      editor.scrollTo(0, scrollHeight * 2)
    } else {
      ui.area.view.animate(
        {
          scrollTop: ui.area.view[0].scrollHeight
        },
        100,
        'linear'
      )
    }
  } else {
    $('body, html')
      .stop(true, true)
      .animate(
        {
          scrollTop: $(document.body)[0].scrollHeight
        },
        100,
        'linear'
      )
  }
}

window.scrollToTop = scrollToTop
window.scrollToBottom = scrollToBottom

let enoughForAffixToc = true

// scrollspy
function generateScrollspy () {
  $(document.body).scrollspy({
    target: '.scrollspy-body'
  })
  ui.area.view.scrollspy({
    target: '.scrollspy-view'
  })
  $(document.body).scrollspy('refresh')
  ui.area.view.scrollspy('refresh')
  if (enoughForAffixToc) {
    ui.toc.toc.hide()
    ui.toc.affix.show()
  } else {
    ui.toc.affix.hide()
    ui.toc.toc.show()
  }
  // $(document.body).scroll();
  // ui.area.view.scroll();
}

function updateScrollspy () {
  const headers = ui.area.markdown.find('h1, h2, h3').toArray()
  const headerMap = []
  for (let i = 0; i < headers.length; i++) {
    headerMap.push(
      $(headers[i]).offset().top - parseInt($(headers[i]).css('margin-top'))
    )
  }
  applyScrollspyActive(
    $(window).scrollTop(),
    headerMap,
    headers,
    $('.scrollspy-body'),
    0
  )
  const offset = ui.area.view.scrollTop() - ui.area.view.offset().top
  applyScrollspyActive(
    ui.area.view.scrollTop(),
    headerMap,
    headers,
    $('.scrollspy-view'),
    offset - 10
  )
}

function applyScrollspyActive (top, headerMap, headers, target, offset) {
  let index = 0
  for (let i = headerMap.length - 1; i >= 0; i--) {
    if (
      top >= headerMap[i] + offset &&
      headerMap[i + 1] &&
      top < headerMap[i + 1] + offset
    ) {
      index = i
      break
    }
  }
  const header = $(headers[index])
  const active = target.find('a[href="#' + header.attr('id') + '"]')
  active
    .closest('li')
    .addClass('active')
    .parent()
    .closest('li')
    .addClass('active')
    .parent()
    .closest('li')
    .addClass('active')
}

// clipboard modal
// fix for wrong autofocus
$('#clipboardModal').on('shown.bs.modal', function () {
  $('#clipboardModal').blur()
})
$('#clipboardModalClear').click(function () {
  $('#clipboardModalContent').html('')
})
$('#clipboardModalConfirm').click(function () {
  const data = $('#clipboardModalContent').text()
  if (data) {
    parseToEditor(data)
    $('#clipboardModal').modal('hide')
    $('#clipboardModalContent').html('')
  }
})

// refresh modal
$('#refreshModalRefresh').click(function () {
  location.reload(true)
})

// gist import modal
$('#gistImportModalClear').click(function () {
  $('#gistImportModalContent').val('')
})
$('#gistImportModalConfirm').click(function () {
  const gisturl = $('#gistImportModalContent').val()
  if (!gisturl) return
  $('#gistImportModal').modal('hide')
  $('#gistImportModalContent').val('')
  if (!isValidURL(gisturl)) {
    showMessageModal(
      '<i class="fa fa-github"></i> Import from Gist',
      'Not a valid URL :(',
      '',
      '',
      false
    )
  } else {
    const hostname = url('hostname', gisturl)
    if (hostname !== 'gist.github.com') {
      showMessageModal(
        '<i class="fa fa-github"></i> Import from Gist',
        'Not a valid Gist URL :(',
        '',
        '',
        false
      )
    } else {
      ui.spinner.show()
      $.get('https://api.github.com/gists/' + url('-1', gisturl))
        .done(function (data) {
          if (data.files) {
            let contents = ''
            Object.keys(data.files).forEach(function (key) {
              contents += key
              contents += '\n---\n'
              contents += data.files[key].content
              contents += '\n\n'
            })
            replaceAll(contents)
          } else {
            showMessageModal(
              '<i class="fa fa-github"></i> Import from Gist',
              'Unable to fetch gist files :(',
              '',
              '',
              false
            )
          }
        })
        .fail(function (data) {
          showMessageModal(
            '<i class="fa fa-github"></i> Import from Gist',
            'Not a valid Gist URL :(',
            '',
            JSON.stringify(data),
            false
          )
        })
        .always(function () {
          ui.spinner.hide()
        })
    }
  }
})

// snippet import modal
$('#snippetImportModalClear').click(function () {
  $('#snippetImportModalContent').val('')
  $('#snippetImportModalProjects').val('init')
  $('#snippetImportModalSnippets').val('init')
  $('#snippetImportModalSnippets').prop('disabled', true)
})
$('#snippetImportModalConfirm').click(function () {
  const snippeturl = $('#snippetImportModalContent').val()
  if (!snippeturl) return
  $('#snippetImportModal').modal('hide')
  $('#snippetImportModalContent').val('')
  if (!/^.+\/snippets\/.+$/.test(snippeturl)) {
    showMessageModal(
      '<i class="fa fa-github"></i> Import from Snippet',
      'Not a valid Snippet URL :(',
      '',
      '',
      false
    )
  } else {
    ui.spinner.show()
    const accessToken =
      '?access_token=' + $('#snippetImportModalAccessToken').val()
    const fullURL =
      $('#snippetImportModalBaseURL').val() +
      '/api/' +
      $('#snippetImportModalVersion').val() +
      snippeturl
    $.get(fullURL + accessToken)
      .done(function (data) {
        let content = '# ' + (data.title || 'Snippet Import')
        const fileInfo = data.file_name.split('.')
        fileInfo[1] = fileInfo[1] ? fileInfo[1] : 'md'
        $.get(fullURL + '/raw' + accessToken)
          .done(function (raw) {
            if (raw) {
              content += '\n\n'
              if (fileInfo[1] !== 'md') {
                content += '```' + fileTypes[fileInfo[1]] + '\n'
              }
              content += raw
              if (fileInfo[1] !== 'md') {
                content += '\n```'
              }
              replaceAll(content)
            }
          })
          .fail(function (data) {
            showMessageModal(
              '<i class="fa fa-gitlab"></i> Import from Snippet',
              'Not a valid Snippet URL :(',
              '',
              JSON.stringify(data),
              false
            )
          })
          .always(function () {
            ui.spinner.hide()
          })
      })
      .fail(function (data) {
        showMessageModal(
          '<i class="fa fa-gitlab"></i> Import from Snippet',
          'Not a valid Snippet URL :(',
          '',
          JSON.stringify(data),
          false
        )
      })
  }
})

// snippet export modal
$('#snippetExportModalConfirm').click(function () {
  const accesstoken = $('#snippetExportModalAccessToken').val()
  const baseURL = $('#snippetExportModalBaseURL').val()
  const version = $('#snippetExportModalVersion').val()
  const projectId = $('#snippetExportModalProjects').val()
  const visibilityValue = $('#snippetExportModalVisibility').val()

  const data = {
    title: $('#snippetExportModalTitle').val(),
    files: [
      {
        file_path: $('#snippetExportModalFileName').val(),
        content: editor.getValue()
      }
    ],
    visibility:
      visibilityValue === '0'
        ? 'private'
        : visibilityValue === '10'
          ? 'internal'
          : 'private'
  }

  if (
    !data.title ||
    !data.files[0].file_path ||
    !data.files[0].content ||
    !projectId
  ) { return }
  $('#snippetExportModalLoading').show()
  const fullURL = `${baseURL}/api/${version}/projects/${projectId}/snippets?access_token=${accesstoken}`
  $.ajax(fullURL, {
    data: JSON.stringify(data),
    contentType: 'application/json',
    type: 'POST',
    success: function (ret) {
      $('#snippetExportModalLoading').hide()
      $('#snippetExportModal').modal('hide')
      showMessageModal(
        '<i class="fa fa-gitlab"></i> Export to Snippet',
        'Export Successful!',
        ret.web_url,
        'View Snippet Here',
        true
      )
    }
  })
})

function parseToEditor (data) {
  const turndownService = new TurndownService({
    defaultReplacement: function (innerHTML, node) {
      return node.isBlock ? '\n\n' + node.outerHTML + '\n\n' : node.outerHTML
    }
  })
  const parsed = turndownService.turndown(data)
  if (parsed) {
    replaceAll(parsed)
  }
}

function replaceAll (data) {
  editor.replaceRange(
    data,
    {
      line: 0,
      ch: 0
    },
    {
      line: editor.lastLine(),
      ch: editor.lastLine().length
    },
    '+input'
  )
}

function importFromUrl (url) {
  // console.debug(url);
  if (!url) return
  if (!isValidURL(url)) {
    showMessageModal(
      '<i class="fa fa-cloud-download"></i> Import from URL',
      'Not a valid URL :(',
      '',
      '',
      false
    )
    return
  }
  $.ajax({
    method: 'GET',
    url,
    success: function (data) {
      const extension = url.split('.').pop()
      if (extension === 'html') {
        parseToEditor(data)
      } else {
        replaceAll(data)
      }
    },
    error: function (data) {
      showMessageModal(
        '<i class="fa fa-cloud-download"></i> Import from URL',
        'Import failed :(',
        '',
        JSON.stringify(data),
        false
      )
    },
    complete: function () {
      ui.spinner.hide()
    }
  })
}

// mode
ui.toolbar.mode.click(function () {
  toggleMode()
})
// edit
ui.toolbar.edit.click(function () {
  changeMode(modeType.edit)
})
// view
ui.toolbar.view.click(function () {
  changeMode(modeType.view)
})
// both
ui.toolbar.both.click(function () {
  changeMode(modeType.both)
})

ui.toolbar.night.click(function () {
  toggleNightMode()
})
// permission
// freely
ui.infobar.permission.freely.click(function () {
  emitPermission('freely')
})
// editable
ui.infobar.permission.editable.click(function () {
  emitPermission('editable')
})
// locked
ui.infobar.permission.locked.click(function () {
  emitPermission('locked')
})
// private
ui.infobar.permission.private.click(function () {
  emitPermission('private')
})
// limited
ui.infobar.permission.limited.click(function () {
  emitPermission('limited')
})
// protected
ui.infobar.permission.protected.click(function () {
  emitPermission('protected')
})
// delete note
ui.infobar.delete.click(function () {
  $('.delete-modal').modal('show')
})
$('.ui-delete-modal-confirm').click(function () {
  socket.emit('delete')
})

function toggleNightMode () {
  const $body = $('body')
  const isActive = store.get('nightMode') === true
  $body.toggleClass('night', !isActive)
  ui.toolbar.night.toggleClass('active', !isActive)
  store.set('nightMode', !isActive)
}

function emitPermission (_permission) {
  if (_permission !== permission) {
    socket.emit('permission', _permission)
  }
}

function updatePermission (newPermission) {
  if (permission !== newPermission) {
    permission = newPermission
    if (window.loaded) refreshView()
  }
  let label = null
  let title = null
  switch (permission) {
    case 'freely':
      label = '<i class="fa fa-leaf"></i> Freely'
      title = 'Anyone can edit'
      break
    case 'editable':
      label = '<i class="fa fa-shield"></i> Editable'
      title = 'Signed people can edit'
      break
    case 'limited':
      label = '<i class="fa fa-id-card"></i> Limited'
      title = 'Signed people can edit (forbid guest)'
      break
    case 'locked':
      label = '<i class="fa fa-lock"></i> Locked'
      title = 'Only owner can edit'
      break
    case 'protected':
      label = '<i class="fa fa-umbrella"></i> Protected'
      title = 'Only owner can edit (forbid guest)'
      break
    case 'private':
      label = '<i class="fa fa-hand-stop-o"></i> Private'
      title = 'Only owner can view & edit'
      break
  }
  if (
    personalInfo.userid &&
    window.owner &&
    personalInfo.userid === window.owner
  ) {
    label += ' <i class="fa fa-caret-down"></i>'
    ui.infobar.permission.label.removeClass('disabled')
  } else {
    ui.infobar.permission.label.addClass('disabled')
  }
  ui.infobar.permission.label.html(label).attr('title', title)
}

function havePermission () {
  let bool = false
  switch (permission) {
    case 'freely':
      bool = true
      break
    case 'editable':
    case 'limited':
      if (!personalInfo.login) {
        bool = false
      } else {
        bool = true
      }
      break
    case 'locked':
    case 'private':
    case 'protected':
      if (!window.owner || personalInfo.userid !== window.owner) {
        bool = false
      } else {
        bool = true
      }
      break
  }
  return bool
}
// global module workaround
window.havePermission = havePermission

// socket.io actions
const io = require('socket.io-client')
const socket = io.connect({
  path: urlpath ? '/' + urlpath + '/socket.io/' : '',
  query: {
    noteId: noteid
  },
  timeout: 5000, // 5 secs to timeout,
  reconnectionAttempts: 20 // retry 20 times on connect failed
})
// overwrite original event for checking login state
const on = socket.on
socket.on = function () {
  if (!checkLoginStateChanged() && !needRefresh) {
    return on.apply(socket, arguments)
  }
}
const emit = socket.emit
socket.emit = function () {
  if (!checkLoginStateChanged() && !needRefresh) {
    emit.apply(socket, arguments)
  }
}
socket.on('info', function (data) {
  console.error(data)
  switch (data.code) {
    case 403:
      location.href = serverurl + '/403'
      break
    case 404:
      location.href = serverurl + '/404'
      break
    case 500:
      location.href = serverurl + '/500'
      break
  }
})
socket.on('error', function (data) {
  console.error(data)
  if (data.message && data.message.indexOf('AUTH failed') === 0) {
    location.href = serverurl + '/403'
  }
})
socket.on('delete', function () {
  if (personalInfo.login) {
    deleteServerHistory(noteid, function (err, data) {
      if (!err) location.href = serverurl
    })
  } else {
    getHistory(function (notehistory) {
      const newnotehistory = removeHistory(noteid, notehistory)
      saveHistory(newnotehistory)
      location.href = serverurl
    })
  }
})
let retryTimer = null
socket.on('maintenance', function () {
  cmClient.revision = -1
})
socket.on('disconnect', function (data) {
  showStatus(statusType.offline)
  if (window.loaded) {
    saveInfo()
    lastInfo.history = editor.getHistory()
  }
  if (!editor.getOption('readOnly')) {
    editor.setOption('readOnly', true)
  }
  if (!retryTimer) {
    retryTimer = setInterval(function () {
      if (!needRefresh) socket.connect()
    }, 1000)
  }
})
socket.on('reconnect', function (data) {
  // sync back any change in offline
  emitUserStatus(true)
  cursorActivity(editor)
  socket.emit('online users')
})
socket.on('connect', function (data) {
  clearInterval(retryTimer)
  retryTimer = null
  personalInfo.id = socket.id
  showStatus(statusType.connected)
  socket.emit('version')
})
socket.on('version', function (data) {
  if (version !== data.version) {
    if (version < data.minimumCompatibleVersion) {
      setRefreshModal('incompatible-version')
      setNeedRefresh()
    } else {
      setRefreshModal('new-version')
    }
  }
})
let authors = []
let authorship = []
let authorMarks = {} // temp variable
let addTextMarkers = [] // temp variable
function updateInfo (data) {
  // console.debug(data);
  if (
    Object.prototype.hasOwnProperty.call(data, 'createtime') &&
    window.createtime !== data.createtime
  ) {
    window.createtime = data.createtime
    updateLastChange()
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'updatetime') &&
    window.lastchangetime !== data.updatetime
  ) {
    window.lastchangetime = data.updatetime
    updateLastChange()
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'owner') &&
    window.owner !== data.owner
  ) {
    window.owner = data.owner
    window.ownerprofile = data.ownerprofile
    updateOwner()
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'lastchangeuser') &&
    window.lastchangeuser !== data.lastchangeuser
  ) {
    window.lastchangeuser = data.lastchangeuser
    window.lastchangeuserprofile = data.lastchangeuserprofile
    updateLastChangeUser()
    updateOwner()
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'authors') &&
    authors !== data.authors
  ) {
    authors = data.authors
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'authorship') &&
    authorship !== data.authorship
  ) {
    authorship = data.authorship
    updateAuthorship()
  }
}
const updateAuthorship = _.debounce(function () {
  editor.operation(updateAuthorshipInner)
}, 50)
function initMark () {
  return {
    gutter: {
      userid: null,
      timestamp: null
    },
    textmarkers: []
  }
}
function initMarkAndCheckGutter (mark, author, timestamp) {
  if (!mark) mark = initMark()
  if (!mark.gutter.userid || mark.gutter.timestamp > timestamp) {
    mark.gutter.userid = author.userid
    mark.gutter.timestamp = timestamp
  }
  return mark
}
const addStyleRule = (function () {
  const added = {}
  const styleElement = document.createElement('style')
  document.documentElement
    .getElementsByTagName('head')[0]
    .appendChild(styleElement)
  const styleSheet = styleElement.sheet

  return function (css) {
    if (added[css]) {
      return
    }
    added[css] = true
    styleSheet.insertRule(
      css,
      (styleSheet.cssRules || styleSheet.rules).length
    )
  }
})()
function updateAuthorshipInner () {
  // ignore when ot not synced yet
  if (havePendingOperation()) return
  authorMarks = {}
  for (let i = 0; i < authorship.length; i++) {
    const atom = authorship[i]
    const author = authors[atom[0]]
    if (author) {
      const prePos = editor.posFromIndex(atom[1])
      const preLine = editor.getLine(prePos.line)
      const postPos = editor.posFromIndex(atom[2])
      const postLine = editor.getLine(postPos.line)
      if (prePos.ch === 0 && postPos.ch === postLine.length) {
        for (let j = prePos.line; j <= postPos.line; j++) {
          if (editor.getLine(j)) {
            authorMarks[j] = initMarkAndCheckGutter(
              authorMarks[j],
              author,
              atom[3]
            )
          }
        }
      } else if (postPos.line - prePos.line >= 1) {
        let startLine = prePos.line
        let endLine = postPos.line
        if (prePos.ch === preLine.length) {
          startLine++
        } else if (prePos.ch !== 0) {
          const mark = initMarkAndCheckGutter(
            authorMarks[prePos.line],
            author,
            atom[3]
          )
          const _postPos = {
            line: prePos.line,
            ch: preLine.length
          }
          if (JSON.stringify(prePos) !== JSON.stringify(_postPos)) {
            mark.textmarkers.push({
              userid: author.userid,
              pos: [prePos, _postPos]
            })
            startLine++
          }
          authorMarks[prePos.line] = mark
        }
        if (postPos.ch === 0) {
          endLine--
        } else if (postPos.ch !== postLine.length) {
          const mark = initMarkAndCheckGutter(
            authorMarks[postPos.line],
            author,
            atom[3]
          )
          const _prePos = {
            line: postPos.line,
            ch: 0
          }
          if (JSON.stringify(_prePos) !== JSON.stringify(postPos)) {
            mark.textmarkers.push({
              userid: author.userid,
              pos: [_prePos, postPos]
            })
            endLine--
          }
          authorMarks[postPos.line] = mark
        }
        for (let j = startLine; j <= endLine; j++) {
          if (editor.getLine(j)) {
            authorMarks[j] = initMarkAndCheckGutter(
              authorMarks[j],
              author,
              atom[3]
            )
          }
        }
      } else {
        const mark = initMarkAndCheckGutter(
          authorMarks[prePos.line],
          author,
          atom[3]
        )
        if (JSON.stringify(prePos) !== JSON.stringify(postPos)) {
          mark.textmarkers.push({
            userid: author.userid,
            pos: [prePos, postPos]
          })
        }
        authorMarks[prePos.line] = mark
      }
    }
  }
  addTextMarkers = []
  editor.eachLine(iterateLine)
  const allTextMarks = editor.getAllMarks()
  for (let i = 0; i < allTextMarks.length; i++) {
    const _textMarker = allTextMarks[i]
    const pos = _textMarker.find()
    let found = false
    for (let j = 0; j < addTextMarkers.length; j++) {
      const textMarker = addTextMarkers[j]
      const author = authors[textMarker.userid]
      const className = 'authorship-inline-' + author.color.substr(1)
      const obj = {
        from: textMarker.pos[0],
        to: textMarker.pos[1]
      }
      if (
        JSON.stringify(pos) === JSON.stringify(obj) &&
        _textMarker.className &&
        _textMarker.className.indexOf(className) > -1
      ) {
        addTextMarkers.splice(j, 1)
        j--
        found = true
        break
      }
    }
    if (
      !found &&
      _textMarker.className &&
      _textMarker.className.indexOf('authorship-inline') > -1
    ) {
      _textMarker.clear()
    }
  }
  for (let i = 0; i < addTextMarkers.length; i++) {
    const textMarker = addTextMarkers[i]
    const author = authors[textMarker.userid]
    const rgbcolor = hex2rgb(author.color)
    const colorString = `rgba(${rgbcolor.red},${rgbcolor.green},${rgbcolor.blue},0.7)`
    const styleString = `background-image: linear-gradient(to top, ${colorString} 1px, transparent 1px);`
    const className = `authorship-inline-${author.color.substr(1)}`
    const rule = `.${className} { ${styleString} }`
    addStyleRule(rule)
    editor.markText(textMarker.pos[0], textMarker.pos[1], {
      className: 'authorship-inline ' + className,
      title: author.name
    })
  }
}
function iterateLine (line) {
  const lineNumber = line.lineNo()
  const currMark = authorMarks[lineNumber]
  const author = currMark ? authors[currMark.gutter.userid] : null
  if (currMark && author) {
    const className = 'authorship-gutter-' + author.color.substr(1)
    const gutters = line.gutterMarkers
    if (
      !gutters ||
      !gutters['authorship-gutters'] ||
      !gutters['authorship-gutters'].className ||
      !gutters['authorship-gutters'].className.indexOf(className) < 0
    ) {
      const styleString = `border-left: 3px solid ${author.color}; height: ${defaultTextHeight}px; margin-left: 3px;`
      const rule = `.${className} { ${styleString} }`
      addStyleRule(rule)
      const gutter = $('<div>', {
        class: 'authorship-gutter ' + className,
        title: author.name
      })
      editor.setGutterMarker(line, 'authorship-gutters', gutter[0])
    }
  } else {
    editor.setGutterMarker(line, 'authorship-gutters', null)
  }
  if (currMark && currMark.textmarkers.length > 0) {
    for (let i = 0; i < currMark.textmarkers.length; i++) {
      const textMarker = currMark.textmarkers[i]
      if (textMarker.userid !== currMark.gutter.userid) {
        addTextMarkers.push(textMarker)
      }
    }
  }
}
editorInstance.on('update', function () {
  $('.authorship-gutter:not([data-original-title])').tooltip({
    container: '.CodeMirror-lines',
    placement: 'right',
    delay: { show: 500, hide: 100 }
  })
  $('.authorship-inline:not([data-original-title])').tooltip({
    container: '.CodeMirror-lines',
    placement: 'bottom',
    delay: { show: 500, hide: 100 }
  })
  // clear tooltip which described element has been removed
  $('[id^="tooltip"]').each(function (index, element) {
    const $ele = $(element)
    if ($('[aria-describedby="' + $ele.attr('id') + '"]').length <= 0) { $ele.remove() }
  })
})
socket.on('check', function (data) {
  // console.debug(data);
  updateInfo(data)
})
socket.on('permission', function (data) {
  updatePermission(data.permission)
})

let permission = null
socket.on('refresh', function (data) {
  // console.debug(data);
  editorInstance.config.docmaxlength = data.docmaxlength
  editor.setOption('maxLength', editorInstance.config.docmaxlength)
  updateInfo(data)
  updatePermission(data.permission)
  if (!window.loaded) {
    // auto change mode if no content detected
    const nocontent = editor.getValue().length <= 0
    if (nocontent) {
      if (visibleXS) {
        appState.currentMode = modeType.edit
      } else {
        appState.currentMode = modeType.both
      }
    }
    // parse mode from url
    if (window.location.search.length > 0) {
      const urlMode = modeType[window.location.search.substr(1)]
      if (urlMode) appState.currentMode = urlMode
    }
    changeMode(appState.currentMode)
    if (nocontent && !visibleXS) {
      editor.focus()
      editor.refresh()
    }
    updateViewInner() // bring up view rendering earlier
    updateHistory() // update history whether have content or not
    window.loaded = true
    emitUserStatus() // send first user status
    updateOnlineStatus() // update first online status
    setTimeout(function () {
      // work around editor not refresh or doc not fully loaded
      windowResizeInner()
      // work around might not scroll to hash
      scrollToHash()
    }, 1)
  }
  if (editor.getOption('readOnly')) {
    editor.setOption('readOnly', false)
  }
})

const EditorClient = ot.EditorClient
const SocketIOAdapter = ot.SocketIOAdapter
const CodeMirrorAdapter = ot.CodeMirrorAdapter
let cmClient = null
let synchronized_ = null

function havePendingOperation () {
  return !!(
    cmClient &&
    cmClient.state &&
    Object.prototype.hasOwnProperty.call(cmClient, 'outstanding')
  )
}

socket.on('doc', function (obj) {
  const body = obj.str
  const bodyMismatch = editor.getValue() !== body
  const setDoc =
    !cmClient ||
    (cmClient &&
      (cmClient.revision === -1 ||
        (cmClient.revision !== obj.revision && !havePendingOperation()))) ||
    obj.force

  saveInfo()
  if (setDoc && bodyMismatch) {
    if (cmClient) cmClient.editorAdapter.ignoreNextChange = true
    if (body) editor.setValue(body)
    else editor.setValue('')
  }

  if (!window.loaded) {
    editor.clearHistory()
    ui.spinner.hide()
    ui.content.fadeIn()
  } else {
    // if current doc is equal to the doc before disconnect
    if (setDoc && bodyMismatch) editor.clearHistory()
    else if (lastInfo.history) editor.setHistory(lastInfo.history)
    lastInfo.history = null
  }

  if (!cmClient) {
    cmClient = window.cmClient = new EditorClient(
      obj.revision,
      obj.clients,
      new SocketIOAdapter(socket),
      new CodeMirrorAdapter(editor)
    )
    synchronized_ = cmClient.state
  } else if (setDoc) {
    if (bodyMismatch) {
      cmClient.undoManager.undoStack.length = 0
      cmClient.undoManager.redoStack.length = 0
    }
    cmClient.revision = obj.revision
    cmClient.setState(synchronized_)
    cmClient.initializeClientList()
    cmClient.initializeClients(obj.clients)
  } else if (havePendingOperation()) {
    cmClient.serverReconnect()
  }

  if (setDoc && bodyMismatch) {
    isDirty = true
    updateView()
  }

  restoreInfo()
})

socket.on('ack', function () {
  isDirty = true
  updateView()
})

socket.on('operation', function () {
  isDirty = true
  updateView()
})

socket.on('online users', function (data) {
  if (debug) {
    console.debug(data)
  }
  onlineUsers = data.users
  updateOnlineStatus()
  $('.CodeMirror-other-cursors')
    .children()
    .each(function (key, value) {
      let found = false
      for (let i = 0; i < data.users.length; i++) {
        const user = data.users[i]
        if ($(this).attr('id') === user.id) {
          found = true
        }
      }
      if (!found) {
        $(this)
          .stop(true)
          .fadeOut('normal', function () {
            $(this).remove()
          })
      }
    })
  for (let i = 0; i < data.users.length; i++) {
    const user = data.users[i]
    if (user.id !== socket.id) {
      buildCursor(user)
    } else {
      personalInfo = user
    }
  }
})
socket.on('user status', function (data) {
  if (debug) {
    console.debug(data)
  }
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === data.id) {
      onlineUsers[i] = data
    }
  }
  updateOnlineStatus()
  if (data.id !== socket.id) {
    buildCursor(data)
  }
})
socket.on('cursor focus', function (data) {
  if (debug) {
    console.debug(data)
  }
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === data.id) {
      onlineUsers[i].cursor = data.cursor
    }
  }
  if (data.id !== socket.id) {
    buildCursor(data)
  }
  // force show
  const cursor = $('div[data-clientid="' + data.id + '"]')
  if (cursor.length > 0) {
    cursor.stop(true).fadeIn()
  }
})
socket.on('cursor activity', function (data) {
  if (debug) {
    console.debug(data)
  }
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === data.id) {
      onlineUsers[i].cursor = data.cursor
    }
  }
  if (data.id !== socket.id) {
    buildCursor(data)
  }
})
socket.on('cursor blur', function (data) {
  if (debug) {
    console.debug(data)
  }
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === data.id) {
      onlineUsers[i].cursor = null
    }
  }
  if (data.id !== socket.id) {
    buildCursor(data)
  }
  // force hide
  const cursor = $('div[data-clientid="' + data.id + '"]')
  if (cursor.length > 0) {
    cursor.stop(true).fadeOut()
  }
})

const options = {
  valueNames: ['id', 'name'],
  item:
    '<li class="ui-user-item">' +
    '<span class="id" style="display:none;"></span>' +
    '<a href="#">' +
    '<span class="pull-left"><i class="ui-user-icon"></i></span><span class="ui-user-name name"></span><span class="pull-right"><i class="fa fa-circle ui-user-status"></i></span>' +
    '</a>' +
    '</li>'
}
const onlineUserList = new List('online-user-list', options)
const shortOnlineUserList = new List('short-online-user-list', options)

function updateOnlineStatus () {
  if (!window.loaded || !socket.connected) return
  const _onlineUsers = deduplicateOnlineUsers(onlineUsers)
  showStatus(statusType.online, _onlineUsers.length)
  const items = onlineUserList.items
  // update or remove current list items
  for (let i = 0; i < items.length; i++) {
    let found = false
    let foundindex = null
    for (let j = 0; j < _onlineUsers.length; j++) {
      if (items[i].values().id === _onlineUsers[j].id) {
        foundindex = j
        found = true
        break
      }
    }
    const id = items[i].values().id
    if (found) {
      onlineUserList.get('id', id)[0].values(_onlineUsers[foundindex])
      shortOnlineUserList.get('id', id)[0].values(_onlineUsers[foundindex])
    } else {
      onlineUserList.remove('id', id)
      shortOnlineUserList.remove('id', id)
    }
  }
  // add not in list items
  for (let i = 0; i < _onlineUsers.length; i++) {
    let found = false
    for (let j = 0; j < items.length; j++) {
      if (items[j].values().id === _onlineUsers[i].id) {
        found = true
        break
      }
    }
    if (!found) {
      onlineUserList.add(_onlineUsers[i])
      shortOnlineUserList.add(_onlineUsers[i])
    }
  }
  // sorting
  sortOnlineUserList(onlineUserList)
  sortOnlineUserList(shortOnlineUserList)
  // render list items
  renderUserStatusList(onlineUserList)
  renderUserStatusList(shortOnlineUserList)
}

function sortOnlineUserList (list) {
  // sort order by isSelf, login state, idle state, alphabet name, color brightness
  list.sort('', {
    sortFunction: function (a, b) {
      const usera = a.values()
      const userb = b.values()
      const useraIsSelf =
        usera.id === personalInfo.id ||
        (usera.login && usera.userid === personalInfo.userid)
      const userbIsSelf =
        userb.id === personalInfo.id ||
        (userb.login && userb.userid === personalInfo.userid)
      if (useraIsSelf && !userbIsSelf) {
        return -1
      } else if (!useraIsSelf && userbIsSelf) {
        return 1
      } else {
        if (usera.login && !userb.login) {
          return -1
        } else if (!usera.login && userb.login) {
          return 1
        } else {
          if (!usera.idle && userb.idle) {
            return -1
          } else if (usera.idle && !userb.idle) {
            return 1
          } else {
            if (
              usera.name &&
              userb.name &&
              usera.name.toLowerCase() < userb.name.toLowerCase()
            ) {
              return -1
            } else if (
              usera.name &&
              userb.name &&
              usera.name.toLowerCase() > userb.name.toLowerCase()
            ) {
              return 1
            } else {
              if (
                usera.color &&
                userb.color &&
                usera.color.toLowerCase() < userb.color.toLowerCase()
              ) {
                return -1
              } else if (
                usera.color &&
                userb.color &&
                usera.color.toLowerCase() > userb.color.toLowerCase()
              ) {
                return 1
              } else {
                return 0
              }
            }
          }
        }
      }
    }
  })
}

function renderUserStatusList (list) {
  const items = list.items
  for (let j = 0; j < items.length; j++) {
    const item = items[j]
    const userstatus = $(item.elm).find('.ui-user-status')
    const usericon = $(item.elm).find('.ui-user-icon')
    if (item.values().login && item.values().photo) {
      usericon.css('background-image', 'url(' + item.values().photo + ')')
      // add 1px more to right, make it feel aligned
      usericon.css('margin-right', '6px')
      $(item.elm).css('border-left', '4px solid ' + item.values().color)
      usericon.css('margin-left', '-4px')
    } else {
      usericon.css('background-color', item.values().color)
    }
    userstatus.removeClass(
      'ui-user-status-offline ui-user-status-online ui-user-status-idle'
    )
    if (item.values().idle) {
      userstatus.addClass('ui-user-status-idle')
    } else {
      userstatus.addClass('ui-user-status-online')
    }
  }
}

function deduplicateOnlineUsers (list) {
  const _onlineUsers = []
  for (let i = 0; i < list.length; i++) {
    const user = $.extend({}, list[i])
    if (!user.userid) {
      _onlineUsers.push(user)
    } else {
      let found = false
      for (let j = 0; j < _onlineUsers.length; j++) {
        if (_onlineUsers[j].userid === user.userid) {
          // keep self color when login
          if (user.id === personalInfo.id) {
            _onlineUsers[j].color = user.color
          }
          // keep idle state if any of self client not idle
          if (!user.idle) {
            _onlineUsers[j].idle = user.idle
            _onlineUsers[j].color = user.color
          }
          found = true
          break
        }
      }
      if (!found) {
        _onlineUsers.push(user)
      }
    }
  }
  return _onlineUsers
}

let userStatusCache = null

function emitUserStatus (force) {
  if (!window.loaded) return
  let type = null
  if (visibleXS) {
    type = 'xs'
  } else if (visibleSM) {
    type = 'sm'
  } else if (visibleMD) {
    type = 'md'
  } else if (visibleLG) {
    type = 'lg'
  }

  personalInfo.idle = idle.isAway
  personalInfo.type = type

  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === personalInfo.id) {
      onlineUsers[i] = personalInfo
    }
  }

  const userStatus = {
    idle: idle.isAway,
    type
  }

  if (force || JSON.stringify(userStatus) !== JSON.stringify(userStatusCache)) {
    socket.emit('user status', userStatus)
    userStatusCache = userStatus
  }
}

function checkCursorTag (coord, ele) {
  if (!ele) return // return if element not exists
  // set margin
  const tagRightMargin = 0
  const tagBottomMargin = 2
  // use sizer to get the real doc size (won't count status bar and gutters)
  const docWidth = ui.area.codemirrorSizer.width()
  // get editor size (status bar not count in)
  const editorHeight = ui.area.codemirror.height()
  // get element size
  const width = ele.outerWidth()
  const height = ele.outerHeight()
  const padding = (ele.outerWidth() - ele.width()) / 2
  // get coord position
  const left = coord.left
  const top = coord.top
  // get doc top offset (to workaround with viewport)
  const docTopOffset = ui.area.codemirrorSizerInner.position().top
  // set offset
  let offsetLeft = -3
  let offsetTop = defaultTextHeight
  // only do when have width and height
  if (width > 0 && height > 0) {
    // flip x when element right bound larger than doc width
    if (left + width + offsetLeft + tagRightMargin > docWidth) {
      offsetLeft = -(width + tagRightMargin) + padding + offsetLeft
    }
    // flip y when element bottom bound larger than doc height
    // and element top position is larger than element height
    if (
      top + docTopOffset + height + offsetTop + tagBottomMargin >
        Math.max(editor.doc.height, editorHeight) &&
      top + docTopOffset > height + tagBottomMargin
    ) {
      offsetTop = -height
    }
  }
  // set position
  ele[0].style.left = offsetLeft + 'px'
  ele[0].style.top = offsetTop + 'px'
}

function buildCursor (user) {
  if (appState.currentMode === modeType.view) return
  if (!user.cursor) return
  const coord = editor.charCoords(user.cursor, 'windows')
  coord.left = coord.left < 4 ? 4 : coord.left
  coord.top = coord.top < 0 ? 0 : coord.top
  let iconClass = 'fa-user'
  switch (user.type) {
    case 'xs':
      iconClass = 'fa-mobile'
      break
    case 'sm':
      iconClass = 'fa-tablet'
      break
    case 'md':
      iconClass = 'fa-desktop'
      break
    case 'lg':
      iconClass = 'fa-desktop'
      break
  }
  if ($('div[data-clientid="' + user.id + '"]').length <= 0) {
    const cursor = $(
      '<div data-clientid="' +
        user.id +
        '" class="CodeMirror-other-cursor" style="display:none;"></div>'
    )
    cursor.attr('data-line', user.cursor.line)
    cursor.attr('data-ch', user.cursor.ch)
    cursor.attr('data-offset-left', 0)
    cursor.attr('data-offset-top', 0)

    const cursorbar = $('<div class="cursorbar">&nbsp;</div>')
    cursorbar[0].style.height = defaultTextHeight + 'px'
    cursorbar[0].style.borderLeft = '2px solid ' + user.color

    const icon = '<i class="fa ' + iconClass + '"></i>'

    const cursortag = $(
      '<div class="cursortag">' +
        icon +
        '&nbsp;<span class="name">' +
        user.name +
        '</span></div>'
    )
    // cursortag[0].style.background = color;
    cursortag[0].style.color = user.color

    cursor.attr('data-mode', 'hover')
    cursortag.delay(2000).fadeOut('fast')
    cursor.hover(
      function () {
        if (cursor.attr('data-mode') === 'hover') {
          cursortag.stop(true).fadeIn('fast')
        }
      },
      function () {
        if (cursor.attr('data-mode') === 'hover') {
          cursortag.stop(true).fadeOut('fast')
        }
      }
    )

    const hideCursorTagDelay = 2000
    let hideCursorTagTimer = null

    const switchMode = function (ele) {
      if (ele.attr('data-mode') === 'state') {
        ele.attr('data-mode', 'hover')
      } else if (ele.attr('data-mode') === 'hover') {
        ele.attr('data-mode', 'state')
      }
    }

    const switchTag = function (ele) {
      if (ele.css('display') === 'none') {
        ele.stop(true).fadeIn('fast')
      } else {
        ele.stop(true).fadeOut('fast')
      }
    }

    const hideCursorTag = function () {
      if (cursor.attr('data-mode') === 'hover') {
        cursortag.fadeOut('fast')
      }
    }
    cursor.on('touchstart', function (e) {
      const display = cursortag.css('display')
      cursortag.stop(true).fadeIn('fast')
      clearTimeout(hideCursorTagTimer)
      hideCursorTagTimer = setTimeout(hideCursorTag, hideCursorTagDelay)
      if (display === 'none') {
        e.preventDefault()
        e.stopPropagation()
      }
    })
    cursortag.on('mousedown touchstart', function (e) {
      if (cursor.attr('data-mode') === 'state') {
        switchTag(cursortag)
      }
      switchMode(cursor)
      e.preventDefault()
      e.stopPropagation()
    })

    cursor.append(cursorbar)
    cursor.append(cursortag)

    cursor[0].style.left = coord.left + 'px'
    cursor[0].style.top = coord.top + 'px'
    $('.CodeMirror-other-cursors').append(cursor)

    if (!user.idle) {
      cursor.stop(true).fadeIn()
    }

    checkCursorTag(coord, cursortag)
  } else {
    const cursor = $('div[data-clientid="' + user.id + '"]')
    cursor.attr('data-line', user.cursor.line)
    cursor.attr('data-ch', user.cursor.ch)

    const cursorbar = cursor.find('.cursorbar')
    cursorbar[0].style.height = defaultTextHeight + 'px'
    cursorbar[0].style.borderLeft = '2px solid ' + user.color

    const cursortag = cursor.find('.cursortag')
    cursortag.find('i').removeClass().addClass('fa').addClass(iconClass)
    cursortag.find('.name').text(user.name)

    if (cursor.css('display') === 'none') {
      cursor[0].style.left = coord.left + 'px'
      cursor[0].style.top = coord.top + 'px'
    } else {
      cursor.animate(
        {
          left: coord.left,
          top: coord.top
        },
        {
          duration: cursorAnimatePeriod,
          queue: false
        }
      )
    }

    if (user.idle && cursor.css('display') !== 'none') {
      cursor.stop(true).fadeOut()
    } else if (!user.idle && cursor.css('display') === 'none') {
      cursor.stop(true).fadeIn()
    }

    checkCursorTag(coord, cursortag)
  }
}

// editor actions
function removeNullByte (cm, change) {
  const str = change.text.join('\n')
  // eslint-disable-next-line no-control-regex
  if (/\u0000/g.test(str) && change.update) {
    change.update(
      change.from,
      change.to,
      // eslint-disable-next-line no-control-regex
      str.replace(/\u0000/g, '').split('\n')
    )
  }
}
function enforceMaxLength (cm, change) {
  const maxLength = cm.getOption('maxLength')
  if (maxLength && change.update) {
    let str = change.text.join('\n')
    let delta =
      str.length - (cm.indexFromPos(change.to) - cm.indexFromPos(change.from))
    if (delta <= 0) {
      return false
    }
    delta = cm.getValue().length + delta - maxLength
    if (delta > 0) {
      str = str.substr(0, str.length - delta)
      change.update(change.from, change.to, str.split('\n'))
      return true
    }
  }
  return false
}
const ignoreEmitEvents = ['setValue', 'ignoreHistory']
editorInstance.on('beforeChange', function (cm, change) {
  if (debug) {
    console.debug(change)
  }
  removeNullByte(cm, change)
  if (enforceMaxLength(cm, change)) {
    $('.limit-modal').modal('show')
  }
  const isIgnoreEmitEvent = ignoreEmitEvents.indexOf(change.origin) !== -1
  if (!isIgnoreEmitEvent) {
    if (!havePermission()) {
      change.canceled = true
      switch (permission) {
        case 'editable':
          $('.signin-modal').modal('show')
          break
        case 'locked':
        case 'private':
          $('.locked-modal').modal('show')
          break
      }
    }
  } else {
    if (change.origin === 'ignoreHistory') {
      setHaveUnreadChanges(true)
      updateTitleReminder()
    }
  }
  if (cmClient && !socket.connected) {
    cmClient.editorAdapter.ignoreNextChange = true
  }
})
editorInstance.on('cut', function () {
  // na
})
editorInstance.on('paste', function () {
  // na
})
editorInstance.on('changes', function (editor, changes) {
  updateHistory()
  const docLength = editor.getValue().length
  // workaround for big documents
  let newViewportMargin = 20
  if (docLength > 20000) {
    newViewportMargin = 1
  } else if (docLength > 10000) {
    newViewportMargin = 10
  } else if (docLength > 5000) {
    newViewportMargin = 15
  }
  if (newViewportMargin !== viewportMargin) {
    viewportMargin = newViewportMargin
    windowResize()
  }
  checkEditorScrollbar()
  if (
    ui.area.codemirrorScroll[0].scrollHeight > ui.area.view[0].scrollHeight &&
    editorHasFocus()
  ) {
    postUpdateEvent = function () {
      syncScrollToView()
      postUpdateEvent = null
    }
  }
})
editorInstance.on('focus', function (editor) {
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === personalInfo.id) {
      onlineUsers[i].cursor = editor.getCursor()
    }
  }
  personalInfo.cursor = editor.getCursor()
  socket.emit('cursor focus', editor.getCursor())
})

const cursorActivity = _.debounce(cursorActivityInner, cursorActivityDebounce)

function cursorActivityInner (editor) {
  if (editorHasFocus() && !Visibility.hidden()) {
    for (let i = 0; i < onlineUsers.length; i++) {
      if (onlineUsers[i].id === personalInfo.id) {
        onlineUsers[i].cursor = editor.getCursor()
      }
    }
    personalInfo.cursor = editor.getCursor()
    socket.emit('cursor activity', editor.getCursor())
  }
}

editorInstance.on('cursorActivity', editorInstance.updateStatusBar)
editorInstance.on('cursorActivity', cursorActivity)

editorInstance.on('beforeSelectionChange', editorInstance.updateStatusBar)
editorInstance.on('beforeSelectionChange', function (doc, selections) {
  // check selection and whether the statusbar has added
  if (selections && editorInstance.statusSelection) {
    const selection = selections.ranges[0]

    const anchor = selection.anchor
    const head = selection.head
    const start = head.line <= anchor.line ? head : anchor
    const end = head.line >= anchor.line ? head : anchor
    const selectionCharCount = Math.abs(head.ch - anchor.ch)

    let selectionText = ' — Selected '

    // borrow from brackets EditorStatusBar.js
    if (start.line !== end.line) {
      let lines = end.line - start.line + 1
      if (end.ch === 0) {
        lines--
      }
      selectionText += lines + ' lines'
    } else if (selectionCharCount > 0) {
      selectionText += selectionCharCount + ' columns'
    }

    if (start.line !== end.line || selectionCharCount > 0) {
      editorInstance.statusSelection.text(selectionText)
    } else {
      editorInstance.statusSelection.text('')
    }
  }
})

editorInstance.on('blur', function (cm) {
  for (let i = 0; i < onlineUsers.length; i++) {
    if (onlineUsers[i].id === personalInfo.id) {
      onlineUsers[i].cursor = null
    }
  }
  personalInfo.cursor = null
  socket.emit('cursor blur')
})

function saveInfo () {
  const scrollbarStyle = editor.getOption('scrollbarStyle')
  const left = $(window).scrollLeft()
  const top = $(window).scrollTop()
  switch (appState.currentMode) {
    case modeType.edit:
      if (scrollbarStyle === 'native') {
        lastInfo.edit.scroll.left = left
        lastInfo.edit.scroll.top = top
      } else {
        lastInfo.edit.scroll = editor.getScrollInfo()
      }
      break
    case modeType.view:
      lastInfo.view.scroll.left = left
      lastInfo.view.scroll.top = top
      break
    case modeType.both:
      lastInfo.edit.scroll = editor.getScrollInfo()
      lastInfo.view.scroll.left = ui.area.view.scrollLeft()
      lastInfo.view.scroll.top = ui.area.view.scrollTop()
      break
  }
  lastInfo.edit.cursor = editor.getCursor()
  lastInfo.edit.selections = editor.listSelections()
  lastInfo.needRestore = true
}

function restoreInfo () {
  const scrollbarStyle = editor.getOption('scrollbarStyle')
  if (lastInfo.needRestore) {
    const line = lastInfo.edit.cursor.line
    const ch = lastInfo.edit.cursor.ch
    editor.setCursor(line, ch)
    editor.setSelections(lastInfo.edit.selections)
    switch (appState.currentMode) {
      case modeType.edit:
        if (scrollbarStyle === 'native') {
          $(window).scrollLeft(lastInfo.edit.scroll.left)
          $(window).scrollTop(lastInfo.edit.scroll.top)
        } else {
          const left = lastInfo.edit.scroll.left
          const top = lastInfo.edit.scroll.top
          editor.scrollIntoView()
          editor.scrollTo(left, top)
        }
        break
      case modeType.view:
        $(window).scrollLeft(lastInfo.view.scroll.left)
        $(window).scrollTop(lastInfo.view.scroll.top)
        break
      case modeType.both:
        editor.scrollIntoView()
        editor.scrollTo(lastInfo.edit.scroll.left, lastInfo.edit.scroll.top)
        ui.area.view.scrollLeft(lastInfo.view.scroll.left)
        ui.area.view.scrollTop(lastInfo.view.scroll.top)
        break
    }

    lastInfo.needRestore = false
  }
}

// view actions
function refreshView () {
  ui.area.markdown.html('')
  isDirty = true
  updateViewInner()
}

const updateView = _.debounce(function () {
  editor.operation(updateViewInner)
}, updateViewDebounce)

let lastResult = null
let postUpdateEvent = null

function updateViewInner () {
  if (appState.currentMode === modeType.edit || !isDirty) return
  const value = editor.getValue()
  const lastMeta = md.meta
  md.meta = {}
  delete md.metaError
  let rendered = md.render(value)
  if (md.meta.type && md.meta.type === 'slide') {
    ui.area.view.addClass('black')
    const slideOptions = {
      separator: '^(\r\n?|\n)---(\r\n?|\n)$',
      verticalSeparator: '^(\r\n?|\n)----(\r\n?|\n)$'
    }
    const slides = window.RevealMarkdown.slidify(
      editor.getValue(),
      slideOptions
    )
    ui.area.markdown.html(slides)
    window.RevealMarkdown.initialize()
    // prevent XSS
    ui.area.markdown.html(preventXSS(ui.area.markdown.html()))
    ui.area.markdown.addClass('slides')
    appState.syncscroll = false
    checkSyncToggle()
  } else {
    if (lastMeta.type && lastMeta.type === 'slide') {
      refreshView()
      ui.area.markdown.removeClass('slides')
      ui.area.view.removeClass('black')
      appState.syncscroll = true
      checkSyncToggle()
    }
    // only render again when meta changed
    if (JSON.stringify(md.meta) !== JSON.stringify(lastMeta)) {
      parseMeta(
        md,
        ui.area.codemirror,
        ui.area.markdown,
        $('#ui-toc'),
        $('#ui-toc-affix')
      )
      rendered = md.render(value)
    }
    // prevent XSS
    rendered = preventXSS(rendered)
    const result = postProcess(rendered).children().toArray()
    partialUpdate(result, lastResult, ui.area.markdown.children().toArray())
    if (result && lastResult && result.length !== lastResult.length) {
      updateDataAttrs(result, ui.area.markdown.children().toArray())
    }
    lastResult = $(result).clone()
  }
  removeDOMEvents(ui.area.markdown)
  finishView(ui.area.markdown)
  autoLinkify(ui.area.markdown)
  deduplicatedHeaderId(ui.area.markdown)
  renderTOC(ui.area.markdown)
  generateToc('ui-toc')
  generateToc('ui-toc-affix')
  autoLinkify(ui.area.markdown)
  generateScrollspy()
  updateScrollspy()
  smoothHashScroll()
  isDirty = false
  clearMap()
  // buildMap();
  updateTitleReminder()
  if (postUpdateEvent && typeof postUpdateEvent === 'function') {
    postUpdateEvent()
  }
}

const updateHistoryDebounce = 600

const updateHistory = _.debounce(updateHistoryInner, updateHistoryDebounce)

function updateHistoryInner () {
  writeHistory(renderFilename(ui.area.markdown), renderTags(ui.area.markdown))
}

function updateDataAttrs (src, des) {
  // sync data attr startline and endline
  for (let i = 0; i < src.length; i++) {
    copyAttribute(src[i], des[i], 'data-startline')
    copyAttribute(src[i], des[i], 'data-endline')
  }
}

function partialUpdate (src, tar, des) {
  if (
    !src ||
    src.length === 0 ||
    !tar ||
    tar.length === 0 ||
    !des ||
    des.length === 0
  ) {
    ui.area.markdown.html(src)
    return
  }
  if (src.length === tar.length) {
    // same length
    for (let i = 0; i < src.length; i++) {
      copyAttribute(src[i], des[i], 'data-startline')
      copyAttribute(src[i], des[i], 'data-endline')
      const rawSrc = cloneAndRemoveDataAttr(src[i])
      const rawTar = cloneAndRemoveDataAttr(tar[i])
      if (rawSrc.outerHTML !== rawTar.outerHTML) {
        // console.debug(rawSrc);
        // console.debug(rawTar);
        $(des[i]).replaceWith(src[i])
      }
    }
  } else {
    // diff length
    let start = 0
    // find diff start position
    for (let i = 0; i < tar.length; i++) {
      // copyAttribute(src[i], des[i], 'data-startline');
      // copyAttribute(src[i], des[i], 'data-endline');
      const rawSrc = cloneAndRemoveDataAttr(src[i])
      const rawTar = cloneAndRemoveDataAttr(tar[i])
      if (!rawSrc || !rawTar || rawSrc.outerHTML !== rawTar.outerHTML) {
        start = i
        break
      }
    }
    // find diff end position
    let srcEnd = 0
    let tarEnd = 0
    for (let i = 0; i < src.length; i++) {
      // copyAttribute(src[i], des[i], 'data-startline');
      // copyAttribute(src[i], des[i], 'data-endline');
      const rawSrc = cloneAndRemoveDataAttr(src[i])
      const rawTar = cloneAndRemoveDataAttr(tar[i])
      if (!rawSrc || !rawTar || rawSrc.outerHTML !== rawTar.outerHTML) {
        start = i
        break
      }
    }
    // tar end
    for (let i = 1; i <= tar.length + 1; i++) {
      const srcLength = src.length
      const tarLength = tar.length
      // copyAttribute(src[srcLength - i], des[srcLength - i], 'data-startline');
      // copyAttribute(src[srcLength - i], des[srcLength - i], 'data-endline');
      const rawSrc = cloneAndRemoveDataAttr(src[srcLength - i])
      const rawTar = cloneAndRemoveDataAttr(tar[tarLength - i])
      if (!rawSrc || !rawTar || rawSrc.outerHTML !== rawTar.outerHTML) {
        tarEnd = tar.length - i
        break
      }
    }
    // src end
    for (let i = 1; i <= src.length + 1; i++) {
      const srcLength = src.length
      const tarLength = tar.length
      // copyAttribute(src[srcLength - i], des[srcLength - i], 'data-startline');
      // copyAttribute(src[srcLength - i], des[srcLength - i], 'data-endline');
      const rawSrc = cloneAndRemoveDataAttr(src[srcLength - i])
      const rawTar = cloneAndRemoveDataAttr(tar[tarLength - i])
      if (!rawSrc || !rawTar || rawSrc.outerHTML !== rawTar.outerHTML) {
        srcEnd = src.length - i
        break
      }
    }
    // check if tar end overlap tar start
    let overlap = 0
    for (let i = start; i >= 0; i--) {
      const rawTarStart = cloneAndRemoveDataAttr(tar[i - 1])
      const rawTarEnd = cloneAndRemoveDataAttr(tar[tarEnd + 1 + start - i])
      if (
        rawTarStart &&
        rawTarEnd &&
        rawTarStart.outerHTML === rawTarEnd.outerHTML
      ) {
        overlap++
      } else {
        break
      }
    }
    if (debug) {
      console.debug('overlap:' + overlap)
    }
    // show diff content
    if (debug) {
      console.debug('start:' + start)
      console.debug('tarEnd:' + tarEnd)
      console.debug('srcEnd:' + srcEnd)
    }
    tarEnd += overlap
    srcEnd += overlap
    const repeatAdd = start - srcEnd < start - tarEnd
    const repeatDiff = Math.abs(srcEnd - tarEnd) - 1
    // push new elements
    const newElements = []
    if (srcEnd >= start) {
      for (let j = start; j <= srcEnd; j++) {
        if (!src[j]) continue
        newElements.push(src[j].outerHTML)
      }
    } else if (repeatAdd) {
      for (let j = srcEnd - repeatDiff; j <= srcEnd; j++) {
        if (!des[j]) continue
        newElements.push(des[j].outerHTML)
      }
    }
    // push remove elements
    const removeElements = []
    if (tarEnd >= start) {
      for (let j = start; j <= tarEnd; j++) {
        if (!des[j]) continue
        removeElements.push(des[j])
      }
    } else if (!repeatAdd) {
      for (let j = start; j <= start + repeatDiff; j++) {
        if (!des[j]) continue
        removeElements.push(des[j])
      }
    }
    // add elements
    if (debug) {
      console.debug('ADD ELEMENTS')
      console.debug(newElements.join('\n'))
    }
    if (des[start]) {
      $(newElements.join('')).insertBefore(des[start])
    } else {
      $(newElements.join('')).insertAfter(des[start - 1])
    }
    // remove elements
    if (debug) {
      console.debug('REMOVE ELEMENTS')
    }
    for (let j = 0; j < removeElements.length; j++) {
      if (debug) {
        console.debug(removeElements[j].outerHTML)
      }
      if (removeElements[j]) {
        $(removeElements[j]).remove()
      }
    }
  }
}

function cloneAndRemoveDataAttr (el) {
  if (!el) return
  const rawEl = $(el).clone()
  rawEl.removeAttr('data-startline data-endline')
  rawEl.find('[data-startline]').removeAttr('data-startline data-endline')
  return rawEl[0]
}

function copyAttribute (src, des, attr) {
  if (src && src.getAttribute(attr) && des) {
    des.setAttribute(attr, src.getAttribute(attr))
  }
}

if ($('.cursor-menu').length <= 0) {
  $("<div class='cursor-menu'>").insertAfter('.CodeMirror-cursors')
}

function reverseSortCursorMenu (dropdown) {
  const items = dropdown.find('.textcomplete-item')
  items.sort(function (a, b) {
    return $(b).attr('data-index') - $(a).attr('data-index')
  })
  return items
}

const checkCursorMenu = _.throttle(checkCursorMenuInner, cursorMenuThrottle)

function checkCursorMenuInner () {
  // get element
  const dropdown = $('.cursor-menu > .dropdown-menu')
  // return if not exists
  if (dropdown.length <= 0) return
  // set margin
  const menuRightMargin = 10
  const menuBottomMargin = 4
  // use sizer to get the real doc size (won't count status bar and gutters)
  const docWidth = ui.area.codemirrorSizer.width()
  // get editor size (status bar not count in)
  const editorHeight = ui.area.codemirror.height()
  // get element size
  const width = dropdown.outerWidth()
  const height = dropdown.outerHeight()
  // get cursor
  const cursor = editor.getCursor()
  // set element cursor data
  if (!dropdown.hasClass('CodeMirror-other-cursor')) {
    dropdown.addClass('CodeMirror-other-cursor')
  }
  dropdown.attr('data-line', cursor.line)
  dropdown.attr('data-ch', cursor.ch)
  // get coord position
  const coord = editor.charCoords(
    {
      line: cursor.line,
      ch: cursor.ch
    },
    'windows'
  )
  const left = coord.left
  const top = coord.top
  // get doc top offset (to workaround with viewport)
  const docTopOffset = ui.area.codemirrorSizerInner.position().top
  // set offset
  let offsetLeft = 0
  let offsetTop = defaultTextHeight
  // set up side down
  window.upSideDown = false
  let lastUpSideDown = (window.upSideDown = false)
  // only do when have width and height
  if (width > 0 && height > 0) {
    // make element right bound not larger than doc width
    if (left + width + offsetLeft + menuRightMargin > docWidth) {
      offsetLeft = -(left + width - docWidth + menuRightMargin)
    }
    // flip y when element bottom bound larger than doc height
    // and element top position is larger than element height
    if (
      top + docTopOffset + height + offsetTop + menuBottomMargin >
        Math.max(editor.doc.height, editorHeight) &&
      top + docTopOffset > height + menuBottomMargin
    ) {
      offsetTop = -(height + menuBottomMargin)
      // reverse sort menu because upSideDown
      dropdown.html(reverseSortCursorMenu(dropdown))
      window.upSideDown = true
    }
    const textCompleteDropdown = $(editor.getInputField()).data('textComplete')
      .dropdown
    lastUpSideDown = textCompleteDropdown.upSideDown
    textCompleteDropdown.upSideDown = window.upSideDown
  }
  // make menu scroll top only if upSideDown changed
  if (window.upSideDown !== lastUpSideDown) {
    dropdown.scrollTop(dropdown[0].scrollHeight)
  }
  // set element offset data
  dropdown.attr('data-offset-left', offsetLeft)
  dropdown.attr('data-offset-top', offsetTop)
  // set position
  dropdown[0].style.left = left + offsetLeft + 'px'
  dropdown[0].style.top = top + offsetTop + 'px'
}

function checkInIndentCode () {
  // if line starts with tab or four spaces is a code block
  const line = editor.getLine(editor.getCursor().line)
  const isIndentCode =
    line.substr(0, 4) === '    ' || line.substr(0, 1) === '\t'
  return isIndentCode
}

let isInCode = false

function checkInCode () {
  isInCode = checkAbove(matchInCode) || checkInIndentCode()
}

function checkAbove (method) {
  const cursor = editor.getCursor()
  let text = []
  for (let i = 0; i < cursor.line; i++) {
    // contain current line
    text.push(editor.getLine(i))
  }
  text =
    text.join('\n') + '\n' + editor.getLine(cursor.line).slice(0, cursor.ch)
  // console.debug(text);
  return method(text)
}

function checkBelow (method) {
  const cursor = editor.getCursor()
  const count = editor.lineCount()
  let text = []
  for (let i = cursor.line + 1; i < count; i++) {
    // contain current line
    text.push(editor.getLine(i))
  }
  text = editor.getLine(cursor.line).slice(cursor.ch) + '\n' + text.join('\n')
  // console.debug(text);
  return method(text)
}

function matchInCode (text) {
  let match
  match = text.match(/`{3,}/g)
  if (match && match.length % 2) {
    return true
  } else {
    match = text.match(/`/g)
    if (match && match.length % 2) {
      return true
    } else {
      return false
    }
  }
}

let isInContainer = false
let isInContainerSyntax = false

function checkInContainer () {
  isInContainer = checkAbove(matchInContainer) && !checkInIndentCode()
}

function checkInContainerSyntax () {
  // if line starts with :::, it's in container syntax
  const line = editor.getLine(editor.getCursor().line)
  isInContainerSyntax = line.substr(0, 3) === ':::'
}

function matchInContainer (text) {
  const match = text.match(/:{3,}/g)
  if (match && match.length % 2) {
    return true
  } else {
    return false
  }
}

$(editor.getInputField())
  .textcomplete(
    [
      {
        // emoji strategy
        match: /(^|\n|\s)\B:([-+\w]*)$/,
        search: function (term, callback) {
          const line = editor.getLine(editor.getCursor().line)
          term = line.match(this.match)[2]
          const list = []
          $.map(window.emojify.emojiNames, function (emoji) {
            if (emoji.indexOf(term) === 0) {
              // match at first character
              list.push(emoji)
            }
          })
          $.map(window.emojify.emojiNames, function (emoji) {
            if (emoji.indexOf(term) !== -1) {
              // match inside the word
              list.push(emoji)
            }
          })
          callback(list)
        },
        template: function (value) {
          return (
            '<img class="emoji" src="' +
            serverurl +
            '/build/emojify.js/dist/images/basic/' +
            value +
            '.png"></img> ' +
            value
          )
        },
        replace: function (value) {
          return '$1:' + value + ': '
        },
        index: 1,
        context: function (text) {
          checkInCode()
          checkInContainer()
          checkInContainerSyntax()
          return !isInCode && !isInContainerSyntax
        }
      },
      {
        // Code block language strategy
        langs: supportCodeModes,
        charts: supportCharts,
        match: /(^|\n)```(\w+)$/,
        search: function (term, callback) {
          const line = editor.getLine(editor.getCursor().line)
          term = line.match(this.match)[2]
          const list = []
          $.map(this.langs, function (lang) {
            if (lang.indexOf(term) === 0 && lang !== term) {
              list.push(lang)
            }
          })
          $.map(this.charts, function (chart) {
            if (chart.indexOf(term) === 0 && chart !== term) {
              list.push(chart)
            }
          })
          callback(list)
        },
        replace: function (lang) {
          let ending = ''
          if (!checkBelow(matchInCode)) {
            ending = '\n\n```'
          }
          if (this.langs.indexOf(lang) !== -1) {
            return '$1```' + lang + '=' + ending
          } else if (this.charts.indexOf(lang) !== -1) {
            return '$1```' + lang + ending
          }
        },
        done: function () {
          const cursor = editor.getCursor()
          let text = []
          text.push(editor.getLine(cursor.line - 1))
          text.push(editor.getLine(cursor.line))
          text = text.join('\n')
          // console.debug(text);
          if (text === '\n```') {
            editor.doc.cm.execCommand('goLineUp')
          }
        },
        context: function (text) {
          return isInCode
        }
      },
      {
        // Container strategy
        containers: supportContainers,
        match: /(^|\n):::(\s*)(\w*)$/,
        search: function (term, callback) {
          const line = editor.getLine(editor.getCursor().line)
          term = line.match(this.match)[3].trim()
          const list = []
          $.map(this.containers, function (container) {
            if (container.indexOf(term) === 0 && container !== term) {
              list.push(container)
            }
          })
          callback(list)
        },
        replace: function (lang) {
          let ending = ''
          if (!checkBelow(matchInContainer)) {
            ending = '\n\n:::'
          }
          if (this.containers.indexOf(lang) !== -1) {
            return '$1:::$2' + lang + ending
          }
        },
        done: function () {
          const cursor = editor.getCursor()
          let text = []
          text.push(editor.getLine(cursor.line - 1))
          text.push(editor.getLine(cursor.line))
          text = text.join('\n')
          // console.debug(text);
          if (text === '\n:::') {
            editor.doc.cm.execCommand('goLineUp')
          }
        },
        context: function (text) {
          return !isInCode && isInContainer
        }
      },
      {
        // header
        match: /(?:^|\n)(\s{0,3})(#{1,6}\w*)$/,
        search: function (term, callback) {
          callback(
            $.map(supportHeaders, function (header) {
              return header.search.indexOf(term) === 0 ? header.text : null
            })
          )
        },
        replace: function (value) {
          return '$1' + value
        },
        context: function (text) {
          return !isInCode
        }
      },
      {
        // extra tags for list
        match: /(^[>\s]*[-+*]\s(?:\[[x ]\]|.*))(\[\])(\w*)$/,
        search: function (term, callback) {
          const list = []
          $.map(supportExtraTags, function (extratag) {
            if (extratag.search.indexOf(term) === 0) {
              list.push(extratag.command())
            }
          })
          $.map(supportReferrals, function (referral) {
            if (referral.search.indexOf(term) === 0) {
              list.push(referral.text)
            }
          })
          callback(list)
        },
        replace: function (value) {
          return '$1' + value
        },
        context: function (text) {
          return !isInCode
        }
      },
      {
        // extra tags for blockquote
        match: /(?:^|\n|\s)(>.*|\s|)((\^|)\[(\^|)\](\[\]|\(\)|:|)\s*\w*)$/,
        search: function (term, callback) {
          const line = editor.getLine(editor.getCursor().line)
          const quote = line.match(this.match)[1].trim()
          const list = []
          if (quote.indexOf('>') === 0) {
            $.map(supportExtraTags, function (extratag) {
              if (extratag.search.indexOf(term) === 0) {
                list.push(extratag.command())
              }
            })
          }
          $.map(supportReferrals, function (referral) {
            if (referral.search.indexOf(term) === 0) {
              list.push(referral.text)
            }
          })
          callback(list)
        },
        replace: function (value) {
          return '$1' + value
        },
        context: function (text) {
          return !isInCode
        }
      },
      {
        // referral
        match: /(^\s*|\n|\s{2})((\[\]|\[\]\[\]|\[\]\(\)|!|!\[\]|!\[\]\[\]|!\[\]\(\))\s*\w*)$/,
        search: function (term, callback) {
          callback(
            $.map(supportReferrals, function (referral) {
              return referral.search.indexOf(term) === 0 ? referral.text : null
            })
          )
        },
        replace: function (value) {
          return '$1' + value
        },
        context: function (text) {
          return !isInCode
        }
      },
      {
        // externals
        match: /(^|\n|\s)\{\}(\w*)$/,
        search: function (term, callback) {
          callback(
            $.map(supportExternals, function (external) {
              return external.search.indexOf(term) === 0 ? external.text : null
            })
          )
        },
        replace: function (value) {
          return '$1' + value
        },
        context: function (text) {
          return !isInCode
        }
      }
    ],
    {
      appendTo: $('.cursor-menu')
    }
  )
  .on({
    'textComplete:beforeSearch': function (e) {
      // NA
    },
    'textComplete:afterSearch': function (e) {
      checkCursorMenu()
    },
    'textComplete:select': function (e, value, strategy) {
      // NA
    },
    'textComplete:show': function (e) {
      $(this).data('autocompleting', true)
      editor.setOption('extraKeys', {
        Up: function () {
          return false
        },
        Right: function () {
          editor.doc.cm.execCommand('goCharRight')
        },
        Down: function () {
          return false
        },
        Left: function () {
          editor.doc.cm.execCommand('goCharLeft')
        },
        Enter: function () {
          return false
        },
        Backspace: function () {
          editor.doc.cm.execCommand('delCharBefore')
        }
      })
    },
    'textComplete:hide': function (e) {
      $(this).data('autocompleting', false)
      editor.setOption('extraKeys', editorInstance.defaultExtraKeys)
    }
  })
