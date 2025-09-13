import { songData } from "../Lrc/song.js";

const delayTime = -0.5  //歌词移动延迟时间 （负数表示 提前）

//获取dom
const doms = {
  ul: document.querySelector('ul'),
  audio: document.querySelector('audio'),
  container: document.querySelector('.container'),
  songbody: document.querySelector('.songBody'),
  sogngName: document.querySelector('.songName'),
  songBtn: document.querySelector('.songBtn'),
  nextBtn: document.querySelector('.nextBtn'),
  lastBtn: document.querySelector('.lastBtn'),
  endTime: document.querySelector('.endTime'),
  currentTime: document.querySelector('.currentTime'),
  rate:document.querySelector('.rate'),
}
//当前歌曲
const lrc = songData[0]
doms.sogngName.innerHTML = lrc.song //歌曲
doms.audio.src = lrc.scr//音频
doms.endTime.innerHTML = doms.audio.duration
var lrcData = []
/**
 * 初始化一个歌词数据
 */
const initLrc = () => {
  const lrcArr = lrc.content.split('\n')
  lrcData = lrcArr.map(item => {
    const part = item.split(']') //[ '[00:22.753', '该怎么去形容你最贴切' ]
    let timeStr = parseTime(part[0])
    let lrcStr = part[1]
    return {
      time: timeStr,
      content: lrcStr
    }
  })
}

/**
 * 格式化时间
 * @param {String} timeStr 
 * @returns 
 */
const parseTime = (timeStr) => {
  const timeStd = timeStr.slice(1)
  const nums = timeStd.split(':')
  return +nums[0] * 60 + +nums[1] + delayTime
}
/**
 * 创建歌词列表
 */
const createLrcElement = () => {
  const frag = document.createDocumentFragment()
  for (let i = 0; i < lrcData.length; i++) {
    const li = document.createElement("li")
    li.textContent = lrcData[i].content
    frag.appendChild(li)
  }
  doms.ul.appendChild(frag)
}
/**
 * 获取当前播放的歌词下标
 * @returns 
 */
const findIndex = () => {
  const currentTime = doms.audio.currentTime
  for (let i = 0; i < lrcData.length; i++) {
    if (lrcData[i].time > currentTime) {
      const lrc = i - 1 <= 0 ? 0 : i -1
      renderLrc(lrc)
      return lrc
    }
  }
  renderLrc(lrcData.length - 1)
  return lrcData.length - 1
}
/**
 * 渲染当前歌词
 * @param {Number} index 
 */
const renderLrc = (index) => {

  var li = document.querySelector('.active')
  if (li) {
    li.classList.remove('active')
  }
  li = doms.ul.children[index]
  li.classList.add('active')
}
initLrc()
createLrcElement()

const songBodyHeight = doms.songbody.offsetHeight
const liHeight = doms.ul.children[0].offsetHeight//li的高度


/**
 * 歌词偏移
 */
const setOffSet = () => {
  let index = findIndex()
  let moveHeight = liHeight * (index + 0.5) - songBodyHeight / 2
  // const maxOffSet = doms.ul.offsetHeight - songBodyHeight

  if (moveHeight < 0) {
    moveHeight = 0
  }
  // if (moveHeight > maxOffSet) {
    // moveHeight = maxOffSet
  // }
  doms.ul.style.transform = `translateY(${-moveHeight}px)`
  renderLrc(index)
}
/**
 * 把时间（s）格式化为 min : sec
 * @param {number} time 
 * @returns 
 */
const fomateTime = (time) => {
  const min = Math.floor(time / 60).toString().padStart(2, '0')
  const sec = Math.floor(time % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

/**
 * 播放进度条
 */
const rateUpdate = () => {
  return (doms.audio.currentTime / doms.audio.duration) *100
}

var duration //歌曲总时长
doms.audio.addEventListener('loadedmetadata',  () => {
  duration = fomateTime(doms.audio.duration)
  doms.endTime.innerHTML = duration

  rateUpdate()
})

//监听歌曲播放
doms.audio.addEventListener('timeupdate', () => {
  doms.currentTime.innerHTML = fomateTime(doms.audio.currentTime)
  doms.rate.style.width = `${rateUpdate()}%`
  setOffSet()
})

//歌曲播放暂停
doms.songBtn.addEventListener('click', () => {
  if (doms.songBtn.innerHTML == '▶') {
    doms.audio.play()
    doms.songBtn.innerHTML = '⏸'
  } else {
    doms.audio.pause()
    doms.songBtn.innerHTML = '▶'
  }
})