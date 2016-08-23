# Audio Player
一个基于Web Audio API的本地音乐播放器

[![travis-ci][travis-ci-badge]][travis-ci-link]
[![david-dm][david-dm-badge]][david-dm-link]


## 开发
```sh
    git clone https://github.com/changelime/player.git
    cd player
    npm install --only=dev && npm install -g jspm && jspm install
```

## 构建
```sh
    jspm bundle-sfx src/js/app.js dest/js/app.bundle.js
    npm run built
```

## 功能

* 播放列表（左上角按钮展开）
* 播放控制（播放、暂停、上一曲、下一曲）
* 播放列表搜索

## 演示
[Demo](http://changelime.github.io/player/dest/ "Demo")

![Demo](http://i.imgur.com/h0vI5f2.png)

![Demo](http://i.imgur.com/hcf1QN0.png)

![Demo](http://i.imgur.com/RKu2OEE.png)



## 许可
MIT

<!-- Link -->
[travis-ci-badge]:    https://api.travis-ci.org/changelime/player.svg
[travis-ci-link]:     https://travis-ci.org/changelime/player
[david-dm-badge]:     https://david-dm.org/changelime/player/dev-status.svg
[david-dm-link]:      https://david-dm.org/changelime/player?type=dev