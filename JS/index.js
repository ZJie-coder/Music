import { songData } from "../Lrc/song.js";

const delayTime = -0.5  //歌词移动延迟时间 （负数表示 提前）

//获取dom
const doms = {
  ul: document.querySelector('ul'),
  audio: document.querySelector('audio'),
  container: document.querySelector('.container'),
  songbody: document.querySelector('.songBody'),
  songName: document.querySelector('.songName'),
  songBtn: document.querySelector('.songBtn'),
  nextBtn: document.querySelector('.nextBtn'),
  lastBtn: document.querySelector('.lastBtn'),
  endTime: document.querySelector('.endTime'),
  currentTime: document.querySelector('.currentTime'),
  rate: document.querySelector('.rate'),
}

var songBodyHeight = 0 //显示歌词区域高度
var liHeight = 0 //li的高度

var isPlay = false

//从本地储存中获取
let songIndex = localStorage.getItem('songIndexStore') || 0
var lrcData = []
/**
 * 初始化一个歌词数据
 */
const initLrc = () => {
  let lrc = songData[songIndex]
  doms.songName.innerHTML = lrc.song //歌曲
  doms.audio.src = lrc.src//音频
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
  getHeight()
}
/**
 * 获取当前播放的歌词下标
 * @returns 
 */
const findIndex = () => {
  const currentTime = doms.audio.currentTime
  for (let i = 0; i < lrcData.length; i++) {
    if (lrcData[i].time > currentTime) {
      const lrc = i - 1 <= 0 ? 0 : i - 1
      renderLrc(lrc)
      return lrc
    }
  }
  renderLrc(lrcData.length - 1)
  return lrcData.length - 1
}
/**
 * 渲染当前歌词 高亮
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

//获得显示区域高度和li的高度
const getHeight = () => {
  songBodyHeight = doms.songbody.offsetHeight
  liHeight = doms.ul.children[0].offsetHeight//li的高度
}

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
  return (doms.audio.currentTime / doms.audio.duration) * 100
}

var duration //歌曲总时长
//监听MP3数据加载完成
doms.audio.addEventListener('loadedmetadata', () => {
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
  isPlay = !isPlay
  if (isPlay) {
    doms.audio.play()
  }else{
    doms.audio.pause()
  }
})

//歌曲序号修改
const songIndexUpdate = (number) => {
  songIndex += number
  if (songIndex >= songData.length) {
    songIndex = 0
  }
  if (songIndex < 0) {
    songIndex = songData.length - 1
  }
}

//监听播放结束
const songEndSwitch = () => {
  doms.audio.addEventListener('ended', () => {
    songIndexUpdate(1)//默认播放下一首
    localStorage.setItem('songIndexStore', songIndex)
    mounted()
    doms.audio.play()
  })
}


doms.nextBtn.addEventListener('click', () => {
  songIndexUpdate(1)
  mounted()
  doms.audio.play()
})
doms.lastBtn.addEventListener('click', () => {
  songIndexUpdate(-1)
  mounted()
  doms.audio.play()
})

doms.audio.addEventListener('play',()=>{
  doms.songBtn.innerHTML = '<span class="iconfont icon-zanting"></span>'
})
doms.audio.addEventListener('pause',()=>{
  doms.songBtn.innerHTML = '<span class="iconfont icon-bofang"></span>'
})
//重置
const reset = () => {
  doms.ul.innerHTML = ''
  duration = 0
  doms.rate.style.width = 0
}
/**
 * 构建
 */
const mounted = async () => {
  await initLrc()
  await reset()
  await createLrcElement()
}

mounted()
songEndSwitch()