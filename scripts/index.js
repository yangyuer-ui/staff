

var App, exampleSongs, parse, rowyourboat, susanna,
  modulo = function (a, b) { return (+a % (b = +b) + b) % b; };

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
// 获取ip
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

rowyourboat = "M1.   1.|  1   2    3.|   3  2   3    4|  5--|\nT              -             -        -\nLRow, row, row your boat, gently down the stream.\nM<1.>5.| 3.     1.| 5   4 3  2|1--|\nT                       -    -\nC                   S   s \nL Ha ha, fooled ya, I'm a submarine.";

susanna = "M00001  2|3    5    5.6 5 3  1.   2  3  3  2  1  2     1   2|\nT   -=  = =    =    = # = =  =    #  =  =  =  =  -     =   =\nL    Oh I come from A labama with my banjo on my knee. And I'm\nC       S s                                                S\nM3    5   5.  6 531. 2  3    3    2   2  1|\nT=    =   =   # ===  #  =    =    =   =  \nLgoin' to Louisia na My true love for to see.\nCs              Ss";

exampleSongs = [
  {
    name: "Row your boat",
    markup: rowyourboat,
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
    markup: susanna,
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
      noteMusicSetDialog: false,//曲谱设置弹窗
      chord: [
        {
          duration: '',
          chord: '和弦',
        }
      ],//和弦积木集合
    };
  },
  playNotes: function (notes) {
    var i, playHelper;
    i = 0;
    playHelper = (function (_this) {
      return function () {
        var base, bpm, crotchetDuration, diff, duration, instrument, m, n, nOctaves, note, noteStr, number, pitch, ref, song, unitPitch;
        if (i >= notes.length || _this.shouldStop) {
          _this.shouldStop = false;
          return _this.setState({
            isPlaying: null
          });
        } else {
          note = notes[i];
          pitch = note.pitch, duration = note.duration;
          _this.setState({
            isPlaying: note
          });
          ref = _this.state, bpm = ref.bpm, instrument = ref.instrument, song = ref.song;
          crotchetDuration = 60 / bpm;
          if (pitch.base > 0) {
            m = song.key.right.match(/(#|b)?([A-G])/);
            if (m[1] === "#") {
              base = 1;
            } else if (m[1] === "b") {
              base = -1;
            } else {
              base = 0;
            }
            number = (m[2].charCodeAt(0) - 60) % 7 + 1;
            base += numberMap[number];
            diff = base + pitch.base + pitch.accidental - c4;
            unitPitch = modulo(diff, 12);
            n = notesMap[unitPitch];
            noteStr = String.fromCharCode(65 + (n.number + 1) % 7);
            if (n.accidental === 1) {
              noteStr += "#";
            }
            nOctaves = Math.floor(diff / 12) + 4;
            Synth.play(instrument, noteStr, nOctaves, duration / 8 * crotchetDuration);
          }
          setTimeout(playHelper, duration / 8 * crotchetDuration * 1000);
          return i++;
        }
      };
    })(this);
    return playHelper();
  },
  shouldStop: false,
  stopPlaying: function () {
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
    } else {
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
    xhr.open('POST', `http://${baseUrl}:16005`)
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
    xhr.open('POST', `http://${baseUrl}:16006/index`)
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
  // 生成音乐
  generatMusic: function () {
    let that = this;
    let baseUrl = sessionStorage.getItem('ipPath');
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `http://${baseUrl}:18860/singer`)
    xhr.setRequestHeader('Content-Type', 'application/json')
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
          sessionStorage.setItem('PMusic', `http://${baseUrl}:${res.fileURL}`)
        }
      }
    }
  },
  // 生成伴奏
  getAccompaniment: function () {
    let baseUrl = sessionStorage.getItem('ipPath');
    let xhr = new XMLHttpRequest()
    xhr.open('POST', `http://${baseUrl}:18860/getAccompaniment `)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(
      {
        "key": "Cmajor",
        "tempo": "64"
      }))
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.response);
          sessionStorage.setItem('accompaniment', `http://${baseUrl}:${res.fileURL}`);
          document.getElementById('au').src = `http://${baseUrl}:${res.fileURL}`
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
  clickDragItem: function (item) {
    this.setState({
      clickBlockItem: item
    })
  },
  // 新增积木块
  addDragBox: function () {
    exampleSongs[0].melody.push({
      duration: 12,
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
  },
  /**
   * 积木块属性变动
   * @param {*属性类型} type 
   * @param {*值} val 
   */
  clickBlockItemChange: function (type, val) {
    if (type === 'content')
      this.state.clickBlockItem.content = val
    this.setState({
      clickBlockItem: this.state.clickBlockItem
    })
    this.setState({
      song: this.state.song
    })
  },
  noteMusicSet: function () {
    this.setState({
      noteMusicSetDialog: true
    })
  },
  render: function () {
    var alignSections, bpm, brand, exampleSong, i, instr, instrument, isPlaying,
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
    return <div>
      {/* mp3音频处理 */}
      <div>
        {this.state.isDialog ? <Modal fullscreen={true} show={this.state.isDialog} onHide={e => this.handleClose('mp3')}>
          <iframe src="lib/waveform-playlist/web-audio-editor.html" height="500px" width="100%">
          </iframe>
          <div>
            <Button variant="secondary" onClick={e => this.handleClose('mp3')}>
              关闭
            </Button>
            <Button variant="primary" onClick={e => this.handleClose('mp3')}>
              保存
            </Button>
          </div>
        </Modal> : ''}
      </div>
      {/* ai创作 */}
      <div>
        {this.state.isAIcrateDialog ?
          <Modal>
            <Input type="text" placeholder="歌词主题" label="歌词主题"
              onChange={this.onChangeLyric} value={songLyrics} />
            <Button type="button" className="btn btn-outline-primary" onClick={this.btnChangeLyric}>作词</Button >
            <Button type="button" className="btn btn-outline-primary" onClick={this.btnChangeSong}>作曲</Button >
            <Panel header="歌词配置,修改歌词用enter换行隔开" >
              <Input type="textarea" placeholder="歌词" rows='10'
                onChange={this.onChangeSetSong} value={songSetValue}
                bsStyle={(this.parseKey(rawKey) == null ? "error" : void 0)}
              />
            </Panel>
            <Button variant="secondary" onClick={e => this.handleClose('aiCreate')}>
              关闭
            </Button>
            <Button variant="primary" onClick={e => this.handleClose('aiCreate')}>
              保存
            </Button>
          </Modal> : ''}
      </div>
      {/* 曲谱设置 */}
      <div>
        {this.state.noteMusicSetDialog ?
          <Modal>
            <PanelGroup defaultActiveKey="1" accordion={true} >
              <Panel header="普通设置" eventKey="1">
                <Input type="text" placeholder="1=C" label="Key"
                  onChange={this.onChangeKey} value={rawKey}
                  bsStyle={(this.parseKey(rawKey) == null ? "error" : void 0)}
                />
                <span>Time</span>
                <SplitButton
                  title="选择time"
                  onSelect={this.onChangeTime}
                >
                  <MenuItem key="3/4" eventKey="3/4">3/4</MenuItem>
                  <MenuItem key="4/4" eventKey="4/4">4/4</MenuItem>
                </SplitButton>
                <span>{rawTime}</span>
                <Input type="checkbox" label="Align Sections"
                  onChange={this.onChangeAlign} checked={alignSections}
                />
                <Input type="number" label="Sections per line" placeholder="4"
                  value={sectionsPerLine} onChange={this.onChangeSPL}
                />
              </Panel>
              <Panel header="节拍设置" eventKey="2">
                <div className="form-group">
                  <label className="control-label">Volume</label>
                  <Slider min={0}
                    max={100}
                    step={1}
                    value={volume}
                    onSlide={this.onChangeVolume}
                    toolTip={true}
                    formatter={(function (v) {
                      return v + "%";
                    })}
                  />
                  <Input type="number" label="BPM" placeholder="120"
                    value={bpm} onChange={this.onChangeBPM}
                  />
                </div>
                <div className="form-group">
                  <label className="control-label">Instrument</label>
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
                  </SplitButton>
                </div>
              </Panel>
              <Panel header="音频设置" eventKey="3">
                <span>需点击生成人声或伴奏此处才会有音频</span>
                <div className="form-group">
                  <audio
                    id='au'
                    controls="controls"
                    autoplay
                    loop
                    muted
                  >
                    浏览器不支持音频播放。
                  </audio>
                </div>
              </Panel>
            </PanelGroup>
            <Button variant="secondary" onClick={e => this.handleClose('noteMusic')}>
              关闭
            </Button>
            <Button variant="primary" onClick={e => this.handleClose('noteMusic')}>
              保存
            </Button>
          </Modal> : ''}
      </div>
      <div className="md-set form-group row">
        <div>
          {
            isPlaying ? <Button type="button" className="btn btn-outline-primary" onClick={this.stopPlaying}>暂停</Button >
              : <Button type="button" className="btn btn-outline-primary" onClick={this.playNotes.bind(this, song.melody)}>试听</Button >
          }
          <Button type="button" className="btn btn-outline-primary" onClick={this.aiCreate}>AI创作</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.noteMusicSet}>曲谱设置</Button >
        </div>
        <div>
          <Button type="button" className="btn btn-outline-primary" onClick={this.generatMusic}>虚拟歌手</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.getAccompaniment}>AI伴奏</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.onChangeDialog}>下载曲谱</Button >
          <Button type="button" className="btn btn-outline-primary" onClick={this.onChangeDialog}>音频编辑</Button >
        </div>
      </div>
      <Grid fluid="true">
        <Col md="10">
          <Panel header="音乐积木编辑" >
            <div className="drag-box">
              {song.melody.map((item, index) => {
                return (

                  <div
                    key={item.id}
                    draggable={true}
                    onDragStart={e => this.dragStart(index, e)}
                    onDragOver={this.allowDrop}
                    onDrop={e => this.drop(index, e)}
                    className={item.pitch.base % 2 == 1 ? 'drag-item bac1' : 'drag-item bac2'}
                    onClick={e => this.clickDragItem(item)}
                  >
                    <div className="drag-item-delete">
                      <div className="drag-item-delete-btn">x</div>
                    </div>
                    <div>
                      <span>{item.lyrics.content}</span>
                    </div>
                  </div>
                );
              })}
              <div className="drag-box-add" title="点击添加音块积木"
                onClick={this.addDragBox}>
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
                    onClick={e => this.clickDragItem(item)}
                  >
                    <span>{item.chord}</span>
                  </div>
                );
              })}
              <div className="drag-box-add drag-box-add-chord" title="点击添加和弦"
                onClick={this.addDragBox}
              >
                <span>+</span>
              </div>
            </div>
          </Panel>
        </Col>
        <Col md="2">
          {
            <Panel header="歌词属性" >
              <Input type="text" label="音高" value={this.state.clickBlockItem.pitch ? this.state.clickBlockItem.pitch.base : ''} />
              <Input type="text" label="歌词" value={this.state.clickBlockItem.lyrics ? this.state.clickBlockItem.lyrics.content : ''} onChange={e => this.clickBlockItemChange('content', val)} />
              <Input type="text" label="时长" value={this.state.clickBlockItem.duration} onChange={e => this.clickBlockItemChange('duration', val)} />
            </Panel>
          }
        </Col>
      </Grid>
      <Panel header="预览" >
        <Jianpu
          song={song}
          sectionsPerLine={sectionsPerLine}
          alignSections={alignSections}
          highlight={isPlaying}
        />
      </Panel>
    </div>
  }
});
React.render(<App name="app" />, document.getElementById("mycontainer"));
getIp();