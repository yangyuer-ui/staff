

var App, exampleSongs, parse, rowyourboat, susanna, durationList, noteWS
modulo = function (a, b) { return (+a % (b = +b) + b) % b; };
var noteList = [];
parse = function (m) {
  var base, deli, handleLastline, i, isNum, j, k, l, lastLine, len, len1, len2, line, lines, lyricsDelims, noteDelims, notes, o, ref, ref1, ref2, ref3;
  notes = [];
  base = c4;
  lines = m.split("\n");
  isNum = {};
  ref = [0, 1, 2, 3, 4, 5, 6, 7];
  for (j = 0, len = ref.length; j < len; j++) {
    i = ref[j];
    isNum[i] = true;
  }
  noteDelims = {};
  ref1 = ["<", ">", "#", "b"];
  for (k = 0, len1 = ref1.length; k < len1; k++) {
    deli = ref1[k];
    noteDelims[deli] = true;
  }
  lyricsDelims = {};
  ref2 = [",", ".", ";", "?", "!", "(", ")", " ", void 0];
  for (l = 0, len2 = ref2.length; l < len2; l++) {
    deli = ref2[l];
    lyricsDelims[deli] = true;
  }
  handleLastline = function (line) {
    var accidental, c, control, controlLine, duration, extraDuration, lastLyricsChar, len3, lyrics, lyricsChar, lyricsLine, main, o, options, pitch, results, tempo, tempoLine;
    tempoLine = line.tempoLine, controlLine = line.controlLine, lyricsLine = line.lyricsLine, main = line.main;
    pitch = null;
    extraDuration = 0;
    options = {};
    accidental = 0;
    lyrics = {};
    lastLyricsChar = void 0;
    results = [];
    for (i = o = 0, len3 = main.length; o < len3; i = ++o) {
      c = main[i];
      if (i === main.length - 1 || pitch !== null && (isNum[c] || noteDelims[c])) {
        if (lyrics.exists) {
          if (i === main.length - 1) {
            lyrics.content += lyricsLine.substr(i);
          }
          lyrics.content.trim();
        }
        notes.push({
          pitch: {
            base: pitch,
            accidental: accidental
          },
          duration: duration + extraDuration,
          options: options,
          lyrics: lyrics
        });
        options = {};
        pitch = null;
        duration = null;
        extraDuration = 0;
        accidental = 0;
        lyrics = {};
      }
      tempo = tempoLine != null ? tempoLine[i] : void 0;
      control = controlLine != null ? controlLine[i] : void 0;
      lyricsChar = lyricsLine != null ? lyricsLine[i] : void 0;
      switch (c) {
        case "0":
          pitch = rest;
          break;
        case "1":
          pitch = base;
          break;
        case "2":
          pitch = base + 2;
          break;
        case "3":
          pitch = base + 4;
          break;
        case "4":
          pitch = base + 5;
          break;
        case "5":
          pitch = base + 7;
          break;
        case "6":
          pitch = base + 9;
          break;
        case "7":
          pitch = base + 11;
          break;
        case "<":
          base += 12;
          break;
        case ">":
          base -= 12;
          break;
        case "-":
          extraDuration += 8;
          break;
        case ".":
          extraDuration += duration / 2;
          break;
        case "#":
          accidental = 1;
          break;
        case "b":
          accidental = -1;
      }
      switch (control) {
        case "S":
          options.slur = "start";
          break;
        case "s":
          options.slur = "end";
      }
      if (isNum[c]) {
        duration = (function () {
          switch (tempo) {
            case "#":
              return 1;
            case "-":
              return 4;
            case "=":
              return 2;
            default:
              return 8;
          }
        })();
      }
      if ((lyricsChar != null) && !(isNum[c] && lyricsDelims[lyricsChar])) {
        if (lyrics.exists) {
          lyrics.content += lyricsChar;
        } else if (lyricsChar !== " ") {
          lyrics.exists = true;
          lyrics.content = lyricsChar;
          lyrics.hyphen = !(lastLyricsChar in lyricsDelims);
        }
      }
      results.push(lastLyricsChar = lyricsChar);
    }
    return results;
  };
  lastLine = {};
  for (i = o = 0, ref3 = lines.length; o < ref3; i = o += 1) {
    line = lines[i];
    if (line[0] === "T") {
      lastLine.tempoLine = line.slice(1);
    } else if (line[0] === "C") {
      lastLine.controlLine = line.slice(1);
    } else if (line[0] === "L") {
      lastLine.lyricsLine = line.slice(1);
    } else if (line[0] === "M") {
      if (lastLine.main) {
        handleLastline(lastLine);
        lastLine = {};
      }
      lastLine.main = line.slice(1);
    }
  }
  if (lastLine.main) {
    handleLastline(lastLine);
  }
  return notes;
};

({
  controlSyms: {
    "S": "slur start",
    "s": "slur end"
  }
});

rowyourboat = "M1.   1.|  1   2    3.|   3  2   3    4|  5--|\nT              -             -        -\nLRow, row, row your boat, gently down the stream.\nM<1.>5.| 3.     1.| 5   4 3  2|1--|\nT                       -    -\nC                   S   s \nL Ha ha, fooled ya, I'm a submarine.";

susanna = "M00001  2|3    5    5.6 5 3  1.   2  3  3  2  1  2     1   2|\nT   -=  = =    =    = # = =  =    #  =  =  =  =  -     =   =\nL    Oh I come from A labama with my banjo on my knee. And I'm\nC       S s                                                S\nM3    5   5.  6 531. 2  3    3    2   2  1|\nT=    =   =   # ===  #  =    =    =   =  \nLgoin' to Louisia na My true love for to see.\nCs              Ss";

exampleSongs = [
  {
    name: "Row your boat",
    markup: '',
    melody: parse(rowyourboat),
    time: {
      upper: 3,
      lower: 4
    },
    key: {
      left: "1",
      right: "C"
    }
  }, {
    name: "Oh Susanna",
    markup: '',
    melody: parse(susanna),
    time: {
      upper: 4,
      lower: 4
    },
    key: {
      left: "1",
      right: "C"
    }
  }
];
// 时长下拉数据
durationList = [
  {
    name: '二全音符',
    value: 64
  },
  {
    name: '全附点音符',
    value: 48
  },
  {
    name: '全音符',
    value: 32
  },
  {
    name: '二分附点音符',
    value: 24
  },
  {
    name: '二分音符',
    value: 16
  },
  {
    name: '四分附点音符',
    value: 12
  },
  {
    name: '四分音符',
    value: 8
  },
  {
    name: '八分音符',
    value: 4
  },
  {
    name: ' 八分附点音符',
    value: 6
  },
  {
    name: '十六分音符',
    value: 2
  },
  {
    name: '三十二分音符',
    value: 1
  },
]

// 获取接口真实ip
function getIp() {
  let xhr = new XMLHttpRequest()
  xhr.open('GET', `http://www.suihanmusic.com:5001`, true)
  xhr.send();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        sessionStorage.setItem('ipPath', JSON.parse(xhr.response).ip);
      }
    }
  }
}

// 获取CPUID
function getCPUID() {
  let xhr = new XMLHttpRequest()
  xhr.open('POST', `http://localhost:50060/getID`);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send('getID=ID');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        sessionStorage.setItem('CPUID', JSON.parse(xhr.response));
      }
    }
  }
}

//将音高转换为字符
function getNoteName(midiNote) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return noteNames[noteIndex] + octave;
}

//将字符转换为音高
function getMidiNoteFromName(noteName) {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = noteName.slice(0, -1);
  const octave = parseInt(noteName.slice(-1));
  const noteIndex = noteNames.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}


// 播放 MID 文件
function playMidiFile(url) {

  // let res= MIDI.Player.loadFile(url, function () {
  //   // MIDI.Player.start();
  // });
  MIDI.Player.loadFile(url, function (e) {
  });
}

if (window.WebSocket) {
  console.log("zhichi ");
} else {
  // 浏览器不支持WebSocket
}
//MIDI的ws链接
noteWS = new WebSocket("ws://localhost:5001/playWeb");

//申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
noteWS.onopen = function () {
  //当WebSocket创建成功时，触发onopen事件
  console.log("websocket连接成功");
  //ws.send("hello"); //将消息发送到服务端
}

noteWS.onclose = function (e) {
  //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
  console.log("websocket已断开");
}
noteWS.onerror = function (e) {
  //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
  console.log("websocket发生错误" + e);
}

//获取和弦
function getChord(note) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', `http://localhost:50060/getChord`)
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send(`noteStr=${ note }`);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let res = JSON.parse(xhr.response);
        console.log(res);
        return res;
      }
    }
  }
}
App = React.createClass({
  displayName: "App",
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function () {
    return {
      alignSections: true,
      rawTime: "3/4",
      rawKey: "1=C",
      sectionsPerLine: 4,
      song: exampleSongs[0],
      isPlaying: null,
      volume: 30,
      bpm: 120,
      instrument: "piano",
      songLyrics: '',//歌曲主题
      songSetValue: '',//歌词设置
      isDialog: false,
      isAIcrateDialog: false,
      //  移动的图片的index
      movedPicIndex: -1,
      //  移入的区域的index
      movedInIndex: -1,
      clickBlockItem: {},//当前点击积木属性
      clickChordItem: {},//当前点击和弦属性
      noteMusicSetDialog: false,//曲谱设置弹窗
      chord: [],//和弦积木集合
      clickBlockType: '',//当前点击色块的类型
      pitchBase: '',//音高转换成字符后的显示值
      clickBlockIndex: null,//当前点击色块的下标
      clickChordIndex: null,//当前点击和弦的下标
      audition: [],//选择播放音频
      midiGinger: '',//midi人声
      midiAccount: '',//midi伴奏
      midiMelody: '',//midi旋律
      downQrcodeLink: '',//下载二维码地址
      midiMelodyPlayer: null,//midi旋律播放器
      midiAccountPlayer: null,//midi伴奏播放器

    };
  },
  // 弹窗自动关闭
  alertDig: function (msg) {
    var a = document.createElement('iframe')
    a.style.display = "none"
    document.body.append(a);
    a.src = "http://127.1"
    alert(msg);
  },
  playNotes: function (notes) {
    let _that = this;
    // 0，旋律，1，人声，2，伴奏
    // mp3人声
    let videoGinger = document.getElementById("videoGinger");
    //     myVideo.pause();
    let arr = this.state.audition.sort((x, y) => x - y);
    if (arr.toString() === '') {
      alert('请选择试听项！');
      return;
    }
    _that.setState({
      isPlaying: 1
    });
    if (_that.shouldStop == false) {
      _that.shouldStop = !_that.shouldStop
    }
    switch (arr.toString()) {
      case '0,1,2':
        if (_that.shouldStop == false) {
          videoGinger.pause();
          _that.state.midiMelodyPlayer.stop();
          _that.state.midiAccountPlayer.stop();
        } else {
          videoGinger.play();
          _that.state.midiMelodyPlayer.start();
          _that.state.midiAccountPlayer.start();
        }
        break;
      case '0,1':
        if (_that.shouldStop == false) {
          videoGinger.pause()
          _that.state.midiMelodyPlayer.stop();
        } else {
          videoGinger.play()
          _that.state.midiMelodyPlayer.start();
        }
        break;
      case '0,2':
        if (_that.shouldStop == false) {
          _that.state.midiMelodyPlayer.stop();
          _that.state.midiAccountPlayer.stop();
        } else {
          MIDIjs.play( _that.state.midiMelody)
          MIDIjs.play( _that.state.midiAccount)
          // _that.state.midiMelodyPlayer.start();
          // _that.state.midiAccountPlayer.start();
        }

        break;
      case '1,2':
        if (_that.shouldStop == false) {
          videoGinger.pause();
          _that.state.midiAccountPlayer.stop();
        } else {
          videoGinger.play();
          _that.state.midiAccountPlayer.start();
        }

        break;
      case '0':
        if (_that.shouldStop == false) {
          _that.state.midiMelodyPlayer.stop();
        } else {
          _that.state.midiMelodyPlayer.start();
        }
        break;
      case '1':
        if (_that.shouldStop == false) {
          videoGinger.pause();
        } else {
          videoGinger.play();
        }
        break;
      case '2':
        if (_that.shouldStop == false) {
          _that.state.midiAccountPlayer.stop();
        } else {
          MIDIjs.play( _that.state.midiAccount)
          // _that.state.midiAccountPlayer.start();
        }

        break;
      default:
        alert('请选择试听项！');
        break
    }
    // todo:注释原有试听光标
    // var i, playHelper;
    // i = 0;
    // playHelper = (function (_this) {
    //   return function () {
    //     var base, bpm, crotchetDuration, diff, duration, instrument, m, n, nOctaves, note, noteStr, number, pitch, ref, song, unitPitch;
    //     if (i >= notes.length || _this.shouldStop) {
    //       _this.shouldStop = false;
    //       return _this.setState({
    //         isPlaying: null
    //       });
    //     } else {
    //       note = notes[i];
    //       pitch = note.pitch, duration = note.duration;
    //       _this.setState({
    //         isPlaying: note
    //       });
    //       ref = _this.state, bpm = ref.bpm, instrument = ref.instrument, song = ref.song;
    //       crotchetDuration = 60 / bpm;
    //       if (pitch.base > 0) {
    //         m = song.key.right.match(/(#|b)?([A-G])/);
    //         if (m[1] === "#") {
    //           base = 1;
    //         } else if (m[1] === "b") {
    //           base = -1;
    //         } else {
    //           base = 0;
    //         }
    //         number = (m[2].charCodeAt(0) - 60) % 7 + 1;
    //         base += numberMap[number];
    //         diff = base + pitch.base + pitch.accidental - c4;
    //         unitPitch = modulo(diff, 12);
    //         n = notesMap[unitPitch];
    //         noteStr = String.fromCharCode(65 + (n.number + 1) % 7);
    //         if (n.accidental === 1) {
    //           noteStr += "#";
    //         }
    //         nOctaves = Math.floor(diff / 12) + 4;
    //         Synth.play(instrument, noteStr, nOctaves, duration / 8 * crotchetDuration);
    //       }
    //       setTimeout(playHelper, duration / 8 * crotchetDuration * 1000);
    //       return i++;
    //     }
    //   };
    // })(this);


  },
  shouldStop: false,
  stopPlaying: function () {
    let _that = this;
    _that.setState({
      isPlaying: null
    });
    // 0，旋律，1，人声，2，伴奏
    // mp3人声
    let videoGinger = document.getElementById("videoGinger");
    //     myVideo.pause();
    let arr = this.state.audition.sort((x, y) => x - y);
    switch (arr.toString()) {
      case '0,1,2':
        videoGinger.pause();
        _that.state.midiMelodyPlayer.stop();
        _that.state.midiAccountPlayer.stop();
        break;
      case '0,1':
        videoGinger.pause()
        _that.state.midiMelodyPlayer.stop();

        break;
      case '0,2':
     
        _that.state.midiMelodyPlayer.stop();
        _that.state.midiAccountPlayer.stop();

        break;
      case '1,2':
        videoGinger.pause();
        _that.state.midiAccountPlayer.stop();

        break;
      case '0':
        _that.state.midiMelodyPlayer.stop();
        break;
      case '1':
        videoGinger.pause();
        break;
      case '2':
        _that.state.midiAccountPlayer.stop();
        break;
      default:
        break
    }
    return this.shouldStop = true;
  },

  onChangeAlign: function (e) {
    return this.setState({
      alignSections: e.target.checked
    });
  },
  onChangeKey: function (e) {
    var key, rawKey;
    rawKey = e.target.value;
    this.setState({
      rawKey: rawKey
    });
    if (key = this.parseKey(rawKey)) {
      this.state.song.key = key;
      return this.setState({
        song: this.state.song
      });
    }
  },
  parseKey: function (key) {
    var m;
    m = key.match(/^([1-7])=((?:#|b)?[A-G])$/);
    if (m != null) {
      return {
        left: m[1],
        right: m[2]
      };
    } else {
      return null;
    }
  },
  onChangeTime: function (val) {
    var time;
    this.setState({
      rawTime: val
    });
    time = this.parseRowTime(val);
    if (time.upper > 0 && time.lower > 0) {
      this.state.song.time = time;
      return this.setState({
        song: this.state.song
      });
    }
  },
  parseRowTime: function (rawTime) {
    var iSplit;
    iSplit = rawTime.indexOf("/");
    return {
      upper: parseInt(rawTime.substr(0, iSplit)),
      lower: parseInt(rawTime.substr(iSplit + 1))
    };
  },
  validateTime: function (rawTime) {
    var lower, ref, upper;
    ref = this.parseRowTime(rawTime), upper = ref.upper, lower = ref.lower;
    if ((upper + "/" + lower) === rawTime) {
      return {
        upper: upper,
        lower: lower
      };
    } else {
      return null;
    }
  },
  onChangeSPL: function (e) {
    return this.setState({
      sectionsPerLine: parseInt(e.target.value)
    });
  },
  onChangeVolume: function (v) {
    Synth.setVolume(v / 100);
    return this.setState({
      volume: v
    });
  },
  onChangeBPM: function (e) {
    return this.setState({
      bpm: parseInt(e.target.value)
    });
  },
  instruments: ["piano", "organ", "acoustic", "edm"],
  onSelectInstrument: function (eventKey) {
    return this.setState({
      instrument: eventKey
    });
  },
  onClickInstrument: function (e) {
    var bpm, crotchetDuration, instrument, ref, volume;
    ref = this.state, volume = ref.volume, bpm = ref.bpm, instrument = ref.instrument;
    crotchetDuration = 60 / bpm;
    Synth.setVolume(volume / 100);
    return Synth.play(instrument, "C", 4, crotchetDuration * 2);
  },
  onChangeLyric: function (e) {
    var songLyrics;
    songLyrics = e.target.value;
    return this.setState({
      songLyrics: songLyrics
    });
  },
  onChangeSetSong: function (e) {
    this.setState({
      songSetValue: e.target.value
    });
  },
  onChangeDialog: function (e) {
    this.setState({
      isDialog: true
    });
  },
  handleClose: function (type) {
    if (type === 'noteMusic') {
      this.setState({
        noteMusicSetDialog: false
      });
    } else if (type === 'aiCreate') {
      this.setState({
        isAIcrateDialog: false
      });
      this.setState({
        songSetValue: ''
      });
    }
    else if (type === 'downQrcodeLink') {
      this.setState({
        downQrcodeLink: ''
      });
    }
    else {
      this.setState({
        isDialog: false
      });
    }
  },
  // 作词
  btnChangeLyric: function () {
    let that = this;
    let baseUrl = sessionStorage.getItem('ipPath');
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `http://${ baseUrl }:16005`)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(window.Qs.stringify({
      text: this.state.songLyrics,
      classification: "lyric",//不允许更改
      num_sentences: "100"//返回100句
    }))
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.response);
          that.setState({
            songSetValue: res.generated_text.join('\n')
          });
        }
      }
    }
  },
  // 作曲
  btnChangeSong: function () {
    let that = this;
    let baseUrl = sessionStorage.getItem('ipPath');
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `http://${ baseUrl }:16006/index`)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(window.Qs.stringify({
      lyric: JSON.stringify(this.state.songSetValue.split('\n')),
      returnFormat: 'json'
    }))
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.response);
          var jsonData = res.jsonData;
          exampleSongs = [jsonData];
          that.setState({
            song: exampleSongs[0],
          });
        }
      }
    }
  },
  // 生成midi旋律
  generatMusic: function () {
    let _that = this;
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `http://localhost:50060/jsonToMidi`)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(`dataJson=${ JSON.stringify(this.state.song.melody) }&BPM=${ this.state.bpm }&beat=${ this.state.rawTime }`);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.response);
          _that.state.midiMelody = res.filePath;
          _that.setState({
            midiMelody: _that.state.midiMelody
          });
          _that.state.midiMelodyPlayer =new  MIDI.Player();
          _that.state.midiMelodyPlayer.loadFile(_that.state.midiMelody);
          _that.alertDig('生成旋律成功，可选择试听');
        }
      }
    }
  },
  // 生成MIDI伴奏
  getAccompaniment: function () {
    let _that = this;
    if (this.state.chord.length == 0) {
      this.alertDig('请先设置和弦配置');
      return;
    }
    let xhr = new XMLHttpRequest();
    let baseUrl = sessionStorage.getItem('ipPath');
    xhr.open('POST', `http://${ baseUrl }:16007/autoAccompany`);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(`chordJson=${ JSON.stringify(this.state.chord) }&BPM=${ this.state.bpm }&beat=${ this.state.rawTime }&outFileType=midi`)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.response);
          console.log(res);
          if (res.suceess === 'true') {
            _that.state.midiAccount = `http://${ baseUrl }${ res.data }`;
            _that.setState({
              midiAccount: _that.state.midiAccount
            });
            // midi伴奏
            _that.state.midiAccountPlayer = new  MIDI.Player();
            _that.state.midiAccountPlayer.loadFile(_that.state.midiAccount);
            _that.alertDig('生成伴奏成功，可选择试听');
          }
          else {
            alert('第' + (res.data * 1 + 1) + '个和弦有误，请修改！');
            return;
          }
        }
      }
    }
  },
  // 生成MP3音乐(人声)
  generatMusicMP: function () {
    let _that = this;
    let baseUrl = sessionStorage.getItem('ipPath');
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `http://${ baseUrl }:18860/singer`)
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
      text: this.state.song.melody,
      info: {
        "key": this.state.rawKey,
        "time": this.state.rawTime,
        "perline": this.state.sectionsPerLine.toString(),
        "volume": this.state.volume.toString(),
        "bpm": this.state.bpm.toString()
      }
    }))
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.response);
          _that.state.midiGinger = `http://${ baseUrl }:${ res.fileURL }`;
          _that.setState({
            midiGinger: _that.state.midiGinger
          });
          _that.alertDig('生成人声成功，可选择试听');
        }
      }
    }
  },
  // ai创作
  aiCreate: function () {
    this.setState({
      isAIcrateDialog: true
    });
  },
  /**
 * 点击图片的那一刻
 * 获取要移动的图片id
 */
  dragStart: function (index, e) {
    this.movedPicIndex = index;
  },
  // 设置允许放置图片，默认不允许的
  allowDrop: function (e) {
    e.preventDefault();
  },
  /**
   * 松开鼠标的那一刻
   * 获取图片移动到的图片位置
   */
  drop: function (index, e) {
    e.preventDefault();
    this.movedInIndex = index;
    const picData = this.swapPic(this.movedPicIndex, this.movedInIndex);
    this.state.song.melody = picData;
    this.setState({
      song: this.state.song
    });
  },
  /**
   * 互换图片
   */
  swapPic: function (fromIndex, toIndex) {
    let picData = [...this.state.song.melody];
    [picData[fromIndex], picData[toIndex]] = [picData[toIndex], picData[fromIndex]];
    return picData;
  },
  // 点击积木块
  clickDragItem: function (item, index, type) {
    this.setState({
      clickBlockType: type
    })

    if (type === 'lyric') {
      // 将音高转换成音符
      let pt = JSON.parse(JSON.stringify(item.pitch));
      this.setState({
        clickBlockIndex: index
      })
      this.setState({
        pitchBase: getNoteName(pt.base)
      });
      // 歌词 
      this.setState({
        clickBlockItem: item
      });

    } else {
      // 歌词   
      this.setState({
        clickChordItem: item
      });
      this.setState({
        clickChordIndex: index
      });
    }
  },
  // 新增积木块
  addDragBox: function (type) {
    if (type === 'lyric') {
      exampleSongs[0].melody.push({
        duration: 8,
        lyrics: {
          content: '歌词', exists:
            true, hyphen: true
        },
        options: {},
        pitch:
          { base: 60, accidental: 0 }
      });
      this.setState({
        song: this.state.song
      })
    }
    else {
      // 如果time为3/4和弦duration为24；
      // 如果time为4/4和弦duration为32；
      this.state.chord.push({
        duration: this.state.rawTime === '3/4' ? 24 : 32,
        chord: '',
        type: 2
      });
      this.setState({
        chord: this.state.chord
      })
    }
  },
  /**
   * 积木块属性变动
   * @param {*属性类型} type 
   * @param {*值} val 
   */
  clickBlockItemChange: function (type, e) {
    if (type === 'content')
      this.state.clickBlockItem.lyrics.content = e.target.value
    else if (type === 'pitchBase') {
      this.state.clickBlockItem.pitch.base = getMidiNoteFromName(e.target.value);
      this.setState({
        pitchBase: e.target.value
      });
    } else {
      this.state.clickBlockItem.duration = e.target.value * 1
    }
    this.setState({
      clickBlockItem: this.state.clickBlockItem
    });
    this.setState({
      song: this.state.song
    })
  },
  /**
   * 和弦属性变动
   * @param {*属性类型} type 
   * @param {*值} val 
   */
  clickChordItemChange: function (type, e) {
    if (type === 'chord')
      this.state.clickChordItem.chord = e.target.value;
    else {
      this.state.clickChordItem.type = e.target.value;
    }
    this.setState({
      clickChordItem: this.state.clickChordItem
    })
  },
  // 打开曲谱设置
  noteMusicSet: function () {
    this.setState({
      noteMusicSetDialog: true
    })
  },

  // 删除积木块
  deleteBlockItem: function (index, type) {
    if (type === 'lyrics') {
      // 歌词删除
      exampleSongs[0].melody.splice(index, 1);
      this.setState({
        song: this.state.song
      })
    } else {
      // 和弦删除
      this.state.chord.splice(index, 1);
      this.setState({
        chord: this.state.chord
      })
    }
  },

  //钢琴键盘输入获取音高
  wsPitchMsg: function () {
    // 接受消息
    let that = this;
    noteWS.onmessage = function (e) {
      let data = e.data.split(',');
      if (data[0] == 144) {
        that.state.clickBlockItem.pitch.base = data[1]
        let pb = getNoteName(data[1]);//将音高转换为字符
        that.setState({
          pitchBase: pb
        });
        // 歌词 
        that.setState({
          clickBlockItem: that.state.clickBlockItem
        });
      }
    }
  },

  //钢琴键盘输入获取和弦
  wsChordMsg: function () {
    // 接受消息
    let that = this;
    noteWS.onmessage = function (e) {
      let data = e.data.split(',');
      if (data[0] == 144) {
        noteList.push(data[1]);
        //获取和弦
        let xhr = new XMLHttpRequest();
        xhr.open('POST', `http://localhost:50060/getChord`)
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.send(`noteStr=${ noteList }`);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              let res = JSON.parse(xhr.response);
              console.log(res);
              that.state.clickChordItem.chord = res;
              that.setState({
                clickChordItem: that.state.clickChordItem
              });
            }
          }
        }
      }
      else {
        noteList = [];
      }
    }
  },

  // 下载曲谱
  downLoadNote: function () {
    let _that = this;
    var pic1 = document.getElementById("song") //要生成图片的标签
    //生成canvas标签
    html2canvas(pic1, {
      height: window.scrollHeight,//canvas高
      width: 1720
    }).then(function (canvas) {	//找到pic元素时，生成canvas元素。
      var dataURL = canvas.toDataURL("image/png")	 // 获取canvas对应的base64编码
      // let href = dataURL
      // let a = document.createElement('a') // 创建a标签
      // a.download = "曲谱" // 设置图片名字
      // a.href = href
      // a.dispatchEvent(new MouseEvent('click'))	//模拟点击进行下载 
      // 将base64传输给接口
      let baseUrl = sessionStorage.getItem('ipPath');
      let xhr = new XMLHttpRequest();
      xhr.open('POST', `http://${ baseUrl }:16007/qr_code`);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.send(window.Qs.stringify({
        data: dataURL,
        id: sessionStorage.getItem('CPUID'),
      }));
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            let res = JSON.parse(xhr.response);
            let obj = {
              arlink: `http://${ baseUrl }${ res.seatchRes }`
            }
            //this.QRlink 生成的二维码地址url
            QRCode.toDataURL(obj.arlink, obj, (err, url) => {
              if (err) throw err
              //将生成的二维码路径复制给QRImgUrl
              _that.setState({
                downQrcodeLink: url
              });
            })
          }
        }
      }
    });

  },
  // 播放复选框选择
  auditionSection: function (e) {
    if (e.target.checked) {
      this.state.audition.push(e.target.value);
    } else {
      let index = this.state.audition.indexOf(e.target.value);
      this.state.audition.splice(index, 1);
    }
    return this.setState({
      audition: this.state.audition
    });
  },
  render: function () {
    var alignSections, bpm, instrument, isPlaying,
      rawKey, rawTime, ref,
      sectionsPerLine, song, volume, songLyrics, songSetValue;
    ref = this.state,
      song = ref.song,
      alignSections = ref.alignSections,
      rawTime = ref.rawTime,
      sectionsPerLine = ref.sectionsPerLine,
      isPlaying = ref.isPlaying,
      volume = ref.volume,
      bpm = ref.bpm,
      instrument = ref.instrument,
      rawKey = ref.rawKey,
      songLyrics = ref.songLyrics,
      songSetValue = ref.songSetValue;
    const colorRed = {
      color: 'red'
    }
    return <div>
      {/* mp3音频处理 */}
      <div>
        {this.state.isDialog ? <Modal fullscreen={true} show={this.state.isDialog} onHide={e => this.handleClose('mp3')}>
          <iframe src="lib/waveform-playlist/web-audio-editor.html" height="500px" width="100%">
          </iframe>
          <div>
            <Button variant="secondary" className="btn-outline-primary" onClick={e => this.handleClose('mp3')}>
              关闭
            </Button>
          </div>
        </Modal> : ''}
      </div>
      {/* ai创作 */}
      <div>
        {this.state.isAIcrateDialog ?
          <Modal className="modal">
            <Input type="text" placeholder="歌词主题" label="歌词主题"
              onChange={this.onChangeLyric} value={songLyrics} />
            <Button type="button" className="btn btn-outline-primary" onClick={this.btnChangeLyric}>作词</Button >
            <Button type="button" className="btn btn-outline-primary" disabled={songSetValue == '' ? true : false} onClick={this.btnChangeSong}>作曲</Button >
            <Panel header="歌词配置,修改歌词用enter换行隔开" >
              <Input type="textarea" placeholder="歌词" rows='10'
                onChange={this.onChangeSetSong} value={songSetValue}
                bsStyle={(this.parseKey(rawKey) == null ? "error" : void 0)}
              />
            </Panel>
            <p> <span style={colorRed}>*</span> <span>更新到积木后，当前歌词会从该容器中删除</span></p>
            <Button variant="secondary" className="btn-outline-primary" onClick={e => this.handleClose('aiCreate')}>
              关闭
            </Button>
            <Button variant="primary" className="btn-outline-primary" onClick={e => this.handleClose('aiCreate')}>
              更新到积木
            </Button>
          </Modal> : ''}
      </div>
      {/* 曲谱设置 */}
      <div>
        {this.state.noteMusicSetDialog ?
          <Modal className="noteModal">
            <div className="mark-set">
              <div>
                <span className="control-label">调号</span>
                <Input type="text" placeholder="1=C"
                  onChange={this.onChangeKey} value={rawKey}
                  bsStyle={(this.parseKey(rawKey) == null ? "error" : void 0)}
                />
              </div>
              <div>
                <span className="control-label">节拍</span>
                <SplitButton
                  title="选择time"
                  onSelect={this.onChangeTime}
                >
                  <MenuItem key="3/4" eventKey="3/4">3/4</MenuItem>
                  <MenuItem key="4/4" eventKey="4/4">4/4</MenuItem>
                </SplitButton>
                <span>{rawTime}</span>
              </div>
              <div>
                <span className="control-label">小节对齐</span>
                <Input type="checkbox"
                  onChange={this.onChangeAlign} checked={alignSections}
                />
                <span className="control-label">曲谱每行小节数</span>
                <Input type="number" placeholder="4"
                  value={sectionsPerLine} onChange={this.onChangeSPL}
                />
              </div>

            </div>
            <div className="mark-set">
              <div>  <span className="control-label">速度</span>
                <Input type="number" placeholder="120"
                  value={bpm} onChange={this.onChangeBPM}
                /></div>
              <div>
                <span className="control-label">乐器</span>
                <SplitButton
                  title="instrument"
                  onSelect={this.onSelectInstrument}
                  onClick={this.onClickInstrument}
                >
                  {this.instruments.map((value, index) => {
                    return (
                      <MenuItem key={index} eventKey={index}> {value}
                      </MenuItem>
                    )
                  })}
                </SplitButton></div>
              <div className="mark-set-volume">
                <span className="control-label">音量</span>
                <Slider min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onSlide={this.onChangeVolume}
                  toolTip={true}
                  formatter={(function (v) {
                    return v + "%";
                  })}
                /></div>

            </div>
            <Button variant="secondary" className="btn-outline-primary" onClick={e => this.handleClose('noteMusic')}>
              关闭
            </Button>
            <Button variant="primary" className="btn-outline-primary" onClick={e => this.handleClose('noteMusic')}>
              保存
            </Button>
          </Modal> : ''}
      </div>
      {/* 曲谱下载 */}
      <div>
        {
          this.state.downQrcodeLink != '' ?
            <Modal>
              <img src={this.state.downQrcodeLink} height="100" width="100" />
              <Button variant="secondary" onClick={e => this.handleClose('downQrcodeLink')}>
                关闭
              </Button>
            </Modal> : ''
        }
      </div>
      <div className="md-set form-group row">
        <div className="md-set-play">
          <Button type="button" className="btn btn-outline-primary" onClick={this.noteMusicSet}>曲谱设置</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.aiCreate}>AI创作</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.generatMusic}>生成旋律</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.getAccompaniment}>生成伴奏</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.generatMusicMP}>虚拟歌手</Button >
          {/* <Button
            variant="primary"
            disabled={isLoadingusicMP}
            onClick={!isLoadingusicMP ? this.generatMusicMP : null}
          > {isLoadingusicMP ? '生成中…' : '虚拟歌手'}
          </Button> */}
          <Button type="button" className="btn btn-outline-primary" onClick={this.downLoadNote}>下载曲谱</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.onChangeDialog}>音频编辑</Button >
          {
            isPlaying ? <Button type="button" className="btn btn-outline-primary" onClick={this.stopPlaying}>暂停</Button >
              : <Button type="button" className="btn btn-outline-primary" onClick={this.playNotes.bind(this, song.melody)}>试听</Button >
          }
          <div className="playCheck">
            <input type="checkbox" id="lycis" disabled={this.state.midiMelody === '' ? true : false} value={0} onChange={this.auditionSection} />
            <label for="lycis">旋律</label>
          </div>
          <div className="playCheck">
            <input type="checkbox" className="playCheck" id="people" disabled={this.state.midiGinger === '' ? true : false} value={1} onChange={this.auditionSection} />
            <label for="people">人声</label>
            <video controls="controls" autoplay=""
              id="videoGinger"
              name="media">
              <source
                src={this.state.midiGinger}
                type="audio/mpeg" />
            </video>
          </div>
          <div className="playCheck">
            <input type="checkbox" className="playCheck" id="accompany" disabled={this.state.midiAccount === '' ? true : false} value={2} onChange={this.auditionSection} />
            <label for="accompany">伴奏</label>
          </div>
        </div>
      </div>
      <Grid fluid="true">
        <Col md="9">
          <Panel header="音乐积木编辑" className='panal-block'>
            <div className="drag">
              <div className="drag-box">
                {song.melody.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      draggable={true}
                      onDragStart={e => this.dragStart(index, e)}
                      onDragOver={this.allowDrop}
                      onDrop={e => this.drop(index, e)}
                      className={item.duration % 3 == 1 ? 'drag-item bac1' : 'drag-item bac2'}
                      onClick={e => this.clickDragItem(item, index, 'lyric')}
                      style={{ width: (10 * item.duration) + 'px' }}
                    >
                      <div>
                        <span>{item.lyrics.content}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="drag-box-add" title="点击添加音块积木"
                  onClick={e => this.addDragBox('lyric')}>
                  <span>+</span>
                </div>
              </div>
              <div className="drag-box">
                {this.state.chord.map((item, index) => {
                  return (
                    <div
                      key={item.id}
                      draggable={true}
                      onDragStart={e => this.dragStart(index, e)}
                      className={item.duration % 2 == 1 ? ' drag-item drag-item-chord bac1' : 'drag-item drag-item-chord bac2'}
                      onClick={e => this.clickDragItem(item, index, 'chord')}
                      style={{ width: (10 * item.duration) + 'px  !important;' }}
                    >
                      <div>
                        <span>{item.chord}</span>
                      </div>
                    </div>
                  );
                })}
                <div className="drag-box-add drag-box-add-chord" title="点击添加和弦"
                  onClick={e => this.addDragBox('chord')}
                >
                  <span>+</span>
                </div>
              </div>
            </div>
          </Panel>
        </Col>
        <Col md="3">
          {
            this.state.clickBlockType === 'lyric' ?
              <Panel header="歌词属性" className='panal-block'>
                <Input type="text" label="音高" placeholder='可键盘输入，也可以按下钢琴键录入'
                  value={this.state.pitchBase ? this.state.pitchBase : ''}
                  onChange={e => this.clickBlockItemChange('pitchBase', e)}
                  onFocus={this.wsPitchMsg}
                />
                <h6>*可键盘输入、钢琴键录入</h6>
                <Input type="text" label="歌词" value={this.state.clickBlockItem.lyrics ? this.state.clickBlockItem.lyrics.content : ''}
                  onChange={e => this.clickBlockItemChange('content', e)} />
                <p className="label-title">时长</p>
                <select className="select-div"
                  value={this.state.clickBlockItem.duration}
                  onChange={e => this.clickBlockItemChange('duration', e)}
                >
                  {durationList.map((item, index) => {
                    return (
                      <option key={index} value={item.value}> {item.name}--{item.value}
                      </option>
                    )
                  })}
                </select>
                <Button type="button" className="btn btn-outline-primary" onClick={e => this.deleteBlockItem(this.state.clickBlockIndex, 'lyrics')}>删除积木</Button >
              </Panel> :
              <Panel header="和弦属性" className='panal-block'>
                <Input type="text" label="和弦名" placeholder='可键盘输入，也可以按下钢琴键录入'
                  value={this.state.clickChordItem.chord ? this.state.clickChordItem.chord : ''}
                  onChange={e => this.clickChordItemChange('chord', e)}
                  onFocus={this.wsChordMsg}
                />
                <h6>*可键盘输入、钢琴键录入</h6>
                <p className="label-title">和弦类型</p>
                <select className="select-div"
                  value={this.state.clickChordItem.type}
                  onChange={e => this.clickChordItemChange('type', e)}
                >
                  {/* 1是柱式和弦，2是分解和弦 */}
                  <option value={2}> 分解和弦 </option>
                  <option value={1}> 柱式和弦 </option>
                </select>
                <Button type="button" className="btn btn-outline-primary" onClick={e => this.deleteBlockItem(this.state.clickChordIndex, 'chord')}>删除和弦</Button >
              </Panel>
          }
        </Col>
      </Grid>
      <Grid fluid="true">
        <Col md="12">
          <Panel header="预览" id='song'>
            <Jianpu
              song={song}
              sectionsPerLine={sectionsPerLine}
              alignSections={alignSections}
              highlight={isPlaying}
            />
          </Panel>
        </Col>
      </Grid>
    </div>
  }
});
React.render(<App name="app" />, document.getElementById("mycontainer"));
getIp();
getCPUID();