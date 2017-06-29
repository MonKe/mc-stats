// lib
const
  // Record
  Record = {
    append: (record, [key, value]) => {
      record[key] = value
      return record
    },
    map: (record, callback) =>
      Object.keys(record)
        .map(key => [key, callback(record[key])])
        .reduce(Record.append, {})
  },
  // Page
  Page = {
    goTo: (name) => {
      document.querySelector('.page--active').classList.remove('page--active')
      document.querySelector(`.${name}`).classList.add('page--active')
    }
  },
  // MC
  MC = ({title, url, question, passed, failed, total, score, seconds, time}) => ({
    title: title || '',
    url: url || '',
    question: question || 0,
    passed: passed || 0,
    failed: failed || 0,
    total: total || 0,
    score: score || 100,
    seconds: seconds || 0,
    time: time || '0s',
    interval: null,
    init: e => {
      e.preventDefault()
      active.title = e.target['create[title]'].value
      active.url = e.target['create[url]'].value
      active.start()
    },
    start: () => {
      active.question++
      localStorage.setItem('mc-active', JSON.stringify(active))
      active.refresh()
      Page.goTo('active')
      active.interval = setInterval(active.addTime, 1000)
      //console.log('mc start', JSON.stringify(active))
    },
    end: e => {
      e.preventDefault()
      active.id = archive.length
      archive.push(active)
      localStorage.setItem('mc-archive', JSON.stringify(archive))
      localStorage.removeItem('mc-active')
      clearInterval(active.interval)
      active = MC({})
      Archive.refresh()
      Page.goTo('archive')
      //console.log('mc end')
    },
    refresh: () => {
      ui.activeTitle.innerHTML = active.title
      ui.activeURL.href = ui.activeURL.innerHTML = active.url
      ui.activeQuestion.innerHTML = active.question
      ui.activePassed.innerHTML = active.passed
      ui.activeFailed.innerHTML = active.failed
      ui.activeScore.innerHTML = active.score
      ui.activeTime.innerHTML = active.time
    },
    addTo: count => () => {
      active.total = active.question
      active[count]++
      active.question++
      active.updateScore()
      active.refresh()
      localStorage.setItem('mc-active', JSON.stringify(active))
    },
    updateScore: () =>
      active.score = Math.round(active.passed / (active.question - 1) * 100),
    addTime: () => {
      active.seconds++
      active.time = active.seconds + 's'
      active.refresh()
      localStorage.setItem('mc-active', JSON.stringify(active))
    }
  }),
  Archive = {
    restore: e => {
      let index = +e.target.dataset.id
      active = MC(archive[index])
      Archive.delete(e)
      active.start()
    },
    delete: e => {
      let index = +e.target.dataset.id
      archive = [...archive.slice(0, index), ...archive.slice(index + 1)]
      localStorage.setItem('mc-archive', JSON.stringify(archive))
      Archive.refresh()
    },
    refresh: () => {
      ui.archiveList.innerHTML = ''
      archive.forEach(item =>
        ui.archiveList.innerHTML += render(ui.archiveItem, item)
      )
      Interface({
        archiveContinue: {selector: '.archive__continue', all: true, bind: {click: Archive.restore}},
        archiveDelete: {selector: '.archive__delete', all: true, bind: {click: Archive.delete}},
      })
    }
  },
  // IO
  Component = ({selector, build, all, bind}) => {
    switch (build) {
      case 'template':
        let
          source = document.querySelector(selector),
          template = source.outerHTML
        source.outerHTML = ''
        return template
      default:
        if (all) {
          let list = document.querySelectorAll(selector)
          if (bind) Array.from(list).forEach(item => bindEvents(bind, item))
          return list
        }
        else {
          let item = document.querySelector(selector)
          if (bind) bindEvents(bind, item)
          return item
        }
    }
  },
  Interface = config => Record.map(config, Component),
  render = (template, params) =>
    Object.keys(params)
      .reduce((template, key) =>
        template.replace(new RegExp(`\\$${key}`, 'g'), params[key]),
        template
      ),
  bindEvents = (events, element) =>
    Object.keys(events)
      .forEach(key => element.addEventListener(key, events[key]))

// init

let
  archive = JSON.parse(localStorage.getItem('mc-archive')) || [],
  active = MC(JSON.parse(localStorage.getItem('mc-active')) || {}),
  ui = Interface({
    createForm: {selector: '.create', bind: {submit: active.init}},
    archiveList: {selector: '.archive__list'},
    archiveItem: {selector: '.archive__item', build: 'template'},
    activeTitle: {selector: '.active__title'},
    activeURL: {selector: '.active__url'},
    activeQuestion: {selector: '.active__question'},
    activePassed: {selector: '.active__passed'},
    activeFailed: {selector: '.active__failed'},
    activeScore: {selector: '.active__score'},
    activeTime: {selector: '.active__time'},
    activePass: {selector: '.active__pass', bind: {click: active.addTo('passed')}},
    activeFail: {selector: '.active__fail', bind: {click: active.addTo('failed')}},
    activeEnd: {selector: '.active__end', bind: {click: active.end}}
  })

//console.log(ui, archive, active)

if (active.question) {
  active.start()
}
else {
  Archive.refresh()
}
