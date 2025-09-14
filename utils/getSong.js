import fs from "fs";
import fetch from "node-fetch"; // Node >=18 可直接用 fetch

async function getLyrics(songId, filename) {
  const url = `https://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://music.163.com/"
    }
  });

  const json = await res.json();

  if (json.lrc && json.lrc.lyric) {
    const lrcContent = json.lrc.lyric;
    fs.writeFileSync(filename, lrcContent, "utf-8");
    console.log(`✅ 歌词已保存到 ${filename}`);
  } else {
    console.log("❌ 这首歌可能没有公开歌词或被限制");
  }
}

// 郑润泽《忘记》的 songId
// getLyrics(2105435473, "wangji.lrc");
getLyrics(172786, "redShoe.lrc");