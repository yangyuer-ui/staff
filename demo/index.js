
import { OpenSheetMusicDisplay } from '../src/OpenSheetMusicDisplay/OpenSheetMusicDisplay';
import { BackendType } from '../src/OpenSheetMusicDisplay/OSMDOptions';
import * as jsPDF from '../node_modules/jspdf/dist/jspdf.es.min';
import * as svg2pdf from '../node_modules/svg2pdf.js/dist/svg2pdf.umd.min';
import { TransposeCalculator } from '../src/Plugins/Transpose/TransposeCalculator';
import { Note } from "../src/MusicalScore/VoiceData";
$(function () {
    $('#stopRecorder').on("click", function () {
        stopRecorder();
    });
    var openSheetMusicDisplay;
    var sampleFolder = "",
        samples = {},

        zoom = 1.0,
        // HTML Elements in the page
        divControls,
        header,
        err,
        error_tr,
        canvas,
        selectSample,
        zoomIns,
        zoomOuts,
        zoomDivs,
        custom,
        previousCursorBtn,
        nextCursorBtn,
        resetCursorBtn,
        followCursorCheckbox,
        showCursorBtn,
        hideCursorBtn,
        backendSelect,
        backendSelectDiv,
        selectPageSizes;

    // manage option setting and resetting for specific samples, e.g. in the autobeam sample autobeam is set to true, otherwise reset to previous state
    // TODO design a more elegant option state saving & restoring system, though that requires saving the options state in OSMD
    var minMeasureToDrawStashed = 1;
    var maxMeasureToDrawStashed = Number.MAX_SAFE_INTEGER;
    var measureToDrawRangeNeedsReset = false;
    var drawingParametersStashed = "default";
    var drawingParametersNeedsReset = false;
    var autobeamOptionNeedsReset = false;
    var autobeamOptionStashedValue = false;
    var autoCustomColoringOptionNeedsReset = false;
    var autoCustomColoringOptionStashedValue = false;
    var drawPartNamesOptionStashedValue = true;
    var drawPartAbbreviationsStashedValue = true;
    var drawPartNamesOptionNeedsReset = false;
    var pageBreaksOptionStashedValue = false;
    var pageBreaksOptionNeedsReset = false;
    var systemBreaksOptionStashedValue = false; // reset handled by pageBreaksOptionNeedsReset

    var showControls = true;
    var showExportPdfControl = false;
    var showPageFormatControl = false;
    var showZoomControl = true;
    var showHeader = true;
    var showDebugControls = false;

    document.title = "OpenSheetMusicDisplay Demo";
    /* 
   1.鼠标点击时可以在画板上画画
   如果鼠标双击那么停止
   移动进画板颜色改变移除时颜色改变
   */
    var darwbox = document.getElementById("right");
    var istrue = false;
    darwbox.addEventListener("touchstart", (e) => {
        istrue = true;
    })
    darwbox.addEventListener("touchmove", (e) => {
        if (istrue == true) {
            var x = e.touches[0].clientX;
            var y = e.touches[0].clientY;
            var circle = document.createElement("div");
            circle.style.width = "10px";
            circle.style.height = "10px";
            circle.style.backgroundColor = "red";
            circle.style.position = "absolute";
            circle.style.left = x - 5 + "px";
            circle.style.top = y - 5 + "px";
            circle.style.borderRadius = "50%";
            // 滚动方向枚举值
            const DIRECTION_ENUM = {
                DOWN: "down",
                UP: "up",
            };
            // 距顶部
            var scrollTop =
                document.documentElement.scrollTop || document.body.scrollTop;
            // 可视区高度
            var clientHeight =
                document.documentElement.clientHeight || document.body.clientHeight;
            // 滚动条总高度
            var scrollHeight =
                document.documentElement.scrollHeight || document.body.scrollHeight;

            let direction = DIRECTION_ENUM.DOWN;
            // 通过滚动方向判断是触底还是触顶
            if (direction == DIRECTION_ENUM.DOWN) {
                // 滚动触底
                if (scrollTop + clientHeight + threshold >= scrollHeight) {
                    console.log("滚动触底");
                }
            } else {
                // 滚动到顶部
                if (scrollTop <= threshold) {
                    console.log("滚动到顶部");
                }
            }
            darwbox.appendChild(circle);
        }
    })
    darwbox.addEventListener("touchend", (e) => {
        istrue = false;
    })
    var ws = new WebSocket("ws://localhost:5002/playTrue");
    //申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
    ws.onopen = function () {
        //当WebSocket创建成功时，触发onopen事件
        console.log("websocket连接成功");
    }

    ws.onclose = function (e) {
        //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
        console.log("websocket已断开");
    }
    ws.onerror = function (e) {
        //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
        console.log("websocket发生错误" + e);
    }
    ws.onmessage = function (e) {
        if (e.data) {
            console.log('jieshou:' + e.data);
            openSheetMusicDisplay.cursor.next();
            // 当前音openSheetMusicDisplay.cursor.Iterator.CurrentVoiceEntries
            console.log('fasong' + getNowNote());
            ws.send(getNowNote());
        }
    }
    // 播放暂停接口
    var wsRecorder = new WebSocket("ws://localhost:5003/playCtl");
    wsRecorder.onopen = function () {
        //当WebSocket创建成功时，触发onopen事件
        console.log("录制ws打开");
    }
    wsRecorder.onclose = function (e) {
        //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
        console.log("录制已断开");
    }
    wsRecorder.onerror = function (e) {
        //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
        console.log("录制发生错误" + e);
    }
    // src 是播多媒体文件的；srcObject 是实时流
    let mediaRecorder;  // 视频录制数据
    let mediaStreamTrack; // 视频实时流
    // 开始录屏
    async function startRecorder() {
        console.log('kaishiluzhi')
        wsRecorder.send('play');
        // 录制音频视频
        mediaStreamTrack = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
        video.srcObject = mediaStreamTrack;
        video.onloadedmetadata = () => video.play();

        // 需要更好的浏览器支持
        const mime = MediaRecorder.isTypeSupported("video/webm; codecs=vp9")
            ? "video/webm; codecs=vp9"
            : "video/webm";
        mediaRecorder = new MediaRecorder(mediaStreamTrack, {
            mimeType: mime
        })

        let chunks = []
        mediaRecorder.addEventListener('dataavailable', function (e) {
            chunks.push(e.data)
        })
        mediaRecorder.addEventListener('stop', function () {
            // 暂停
            console.log('暂停录制');
            wsRecorder.send('pause');
            let blob = new Blob(chunks, {
                type: chunks[0].type
            })
            let url = URL.createObjectURL(blob);

            // 将video切换成录制的视频
            video.srcObject = null;
            video.src = url;
            video.onloadedmetadata = () => video.play();

            // 下载至本地
            let a = document.createElement('a');
            a.href = url;
            a.download = 'video.mp4';
            a.click();
        })
        // 必须手动启动
        mediaRecorder.start();
    }

    // 停止录屏
    function stopRecorder() {
        // 暂停
        console.log('jieshu录制');
        wsRecorder.send('stop');

        wsRecorder.onmessage = function (e) {
            if (e.data) {
                console.log('结束录制内容:' + e.data);
            }
        }
        if (!mediaStreamTrack) {
            document.getElementsByClassName('message')[0].classList.remove('hidden')
        } else {
            mediaStreamTrack.getVideoTracks().forEach((track) => {
                track.stop();
            });
            mediaRecorder.stop();
            window.$(".ui.modal").modal({ //各种回调方法
                onApprove: function () { //单击确认按钮
                    console.log("确认")
                },
                onDeny: function () {  //单击取消按钮
                    console.log("拒绝")
                }
            })
                .modal("show");
        }
    }

    // 截取图片
    function clipPhoto() {
        let canvas = document.createElement('canvas');
        let { width, height } = video;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        // 下载图片、
        let a = document.createElement('a');
        a.download = "image";
        a.href = canvas.toDataURL('image/png');
        a.click();
    }

    // 获取当前要弹奏的音符
    function getNowNote() {
        let arrNote = [];
        // 当前音openSheetMusicDisplay.cursor.Iterator.CurrentVoiceEntries
        if (openSheetMusicDisplay.cursor.Iterator.CurrentVoiceEntries) {
            openSheetMusicDisplay.cursor.Iterator.CurrentVoiceEntries.forEach((item1) => {
                item1.notes.forEach((item2) => {
                    if (item2.halfTone === 0) {
                        arrNote.push(item2.halfTone);
                    } else {
                        arrNote.push(item2.halfTone + 12);
                    }
                })
            })

            arrNote = [...new Set(arrNote)];
            return arrNote.toString();
        } else {
            return '';
        }
    }

    // Initialization code
    function init() {
        var name, option;
        // Handle window parameter
        var paramEmbedded = findGetParameter('embedded');
        var paramShowControls = findGetParameter('showControls');
        var paramShowPageFormatControl = findGetParameter('showPageFormatControl');
        var paramShowExportPdfControl = findGetParameter('showExportPdfControl');
        var paramShowZoomControl = findGetParameter('showZoomControl');
        var paramShowHeader = findGetParameter('showHeader');
        var paramZoom = findGetParameter('zoom');
        var paramOverflow = findGetParameter('overflow');
        var paramOpenUrl = findGetParameter('openUrl');
        var paramDebugControls = findGetParameter('debugControls');

        var paramCompactMode = findGetParameter('compactMode');
        var paramMeasureRangeStart = findGetParameter('measureRangeStart');
        var paramMeasureRangeEnd = findGetParameter('measureRangeEnd');
        var paramPageFormat = findGetParameter('pageFormat');
        var paramPageBackgroundColor = findGetParameter('pageBackgroundColor');
        var paramBackendType = findGetParameter('backendType');
        var paramPageWidth = findGetParameter('pageWidth');
        var paramPageHeight = findGetParameter('pageHeight');

        var paramHorizontalScrolling = findGetParameter('horizontalScrolling');
        var paramSingleHorizontalStaffline = findGetParameter('singleHorizontalStaffline');

        showHeader = (paramShowHeader !== '0');
        showControls = false;
        if (paramEmbedded) {
            showControls = paramShowControls !== '0';
            showZoomControl = paramShowZoomControl !== '0';
            showPageFormatControl = paramShowPageFormatControl !== '0';
            showExportPdfControl = paramShowExportPdfControl !== '0';
        }

        if (paramZoom) {
            if (paramZoom > 0.1 && paramZoom < 5.0) {
                zoom = paramZoom;
            }
        }
        if (paramOverflow && typeof paramOverflow === 'string') {
            if (paramOverflow === 'hidden' || paramOverflow === 'auto' || paramOverflow === 'scroll' || paramOverflow === 'visible') {
                document.body.style.overflow = paramOverflow;
            }
        }

        var compactMode = paramCompactMode && paramCompactMode !== '0';
        var measureRangeStart = paramMeasureRangeStart ? Number.parseInt(paramMeasureRangeStart) : 0;
        var measureRangeEnd = paramMeasureRangeEnd ? Number.parseInt(paramMeasureRangeEnd) : Number.MAX_SAFE_INTEGER;
        if (measureRangeStart && measureRangeEnd && measureRangeEnd < measureRangeStart) {
            console.log("[OSMD] warning: measure range end parameter should not be smaller than measure range start. We've set start measure = end measure now.")
            measureRangeStart = measureRangeEnd;
        }
        let pageFormat = paramPageFormat ? paramPageFormat : "Endless";
        if (paramPageHeight && paramPageWidth) {
            pageFormat = `${paramPageWidth}x${paramPageHeight}`
        }
        var pageBackgroundColor = paramPageBackgroundColor ? "#" + paramPageBackgroundColor : undefined; // vexflow format, see OSMDOptions. can't use # in parameters.
        //console.log("demo: osmd pagebgcolor: " + pageBackgroundColor);
        var backendType = (paramBackendType && paramBackendType.toLowerCase) ? paramBackendType : "svg";

        var horizontalScrolling = paramHorizontalScrolling === '1';
        var singleHorizontalStaffline = paramSingleHorizontalStaffline === '1';


        divControls = document.getElementById('divControls');
        header = document.getElementById('header');
        err = document.getElementById("error-td");
        error_tr = document.getElementById("error-tr");
        zoomDivs = [];
        zoomDivs.push(document.getElementById("zoom-str"));
        zoomDivs.push(document.getElementById("zoom-str-optional"));
        custom = document.createElement("option");
        selectSample = document.getElementById("selectSample");
        zoomIns = [];
        zoomIns.push(document.getElementById("zoom-in-btn"));
        zoomIns.push(document.getElementById("zoom-in-btn-optional"));
        zoomOuts = [];
        zoomOuts.push(document.getElementById("zoom-out-btn"));
        zoomOuts.push(document.getElementById("zoom-out-btn-optional"));
        canvas = document.createElement("div");
        if (horizontalScrolling) {
            canvas.style.overflowX = 'auto'; // enable horizontal scrolling
        }
        previousCursorBtn = document.getElementById("previous-cursor-btn");
        nextCursorBtn = document.getElementById("next-cursor-btn");
        resetCursorBtn = document.getElementById("reset-cursor-btn");
        followCursorCheckbox = document.getElementById("follow-cursor-checkbox");
        showCursorBtn = document.getElementById("show-cursor-btn");
        hideCursorBtn = document.getElementById("hide-cursor-btn");
        backendSelectDiv = document.getElementById("backend-select-div");
        selectPageSizes = [];

        document.getElementById('startRecorder').addEventListener("click", function () {
            startRecorder();
        });

        document.getElementById('clipPhoto').addEventListener("click", function () {
            clipPhoto();
        });

        document.getElementById('register').addEventListener("click", function () {
            window.open("register.html")
        });

        document.getElementById('userinfoBtn').addEventListener("click", function () {
            window.open("userinfo.html")
        });

        //var defaultDisplayVisibleValue = "block"; // TODO in some browsers flow could be the better/default value
        var defaultVisibilityValue = "visible";
        showDebugControls = paramDebugControls !== '0';
        if (showDebugControls) {
            var elementsToEnable = [
                selectSample, selectPageSizes[0], backendSelect, backendSelectDiv, divControls
            ];
            for (var i = 0; i < elementsToEnable.length; i++) {
                if (elementsToEnable[i]) { // make sure this element is not null/exists in the index.html, e.g. github.io demo has different index.html
                    if (elementsToEnable[i].style) {
                        elementsToEnable[i].style.visibility = defaultVisibilityValue;
                        elementsToEnable[i].style.opacity = 1.0;
                    }
                }
            }
        } else {
            if (divControls) {
                divControls.style.display = "none";
            }
        }

        const optionalControls = document.getElementById('optionalControls');
        if (optionalControls) {
            if (showControls) {
                optionalControls.style.visibility = defaultVisibilityValue;
                optionalControls.style.opacity = 0.8;
            } else {
                optionalControls.style.display = 'none';
            }
        }

        if (!showHeader) {
            if (header) {
                header.style.display = 'none';
            }
        } else {
            if (header) {
                header.style.opacity = 1.0;
            }
        }
        // Hide error
        error();

        if (showControls) {
            const optionalControls = document.getElementById('optionalControls');
            if (optionalControls) {
                optionalControls.style.opacity = 1.0;
                // optionalControls.appendChild(zoomControlsButtons);
                // optionalControls.appendChild(zoomControlsString);
                optionalControls.style.position = 'absolute';
                optionalControls.style.zIndex = '10';
                optionalControls.style.right = '10px';
                // optionalControls.style.padding = '10px';
            }

            if (showZoomControl) {
                const zoomControlsButtonsColumn = document.getElementById('zoomControlsButtons-optional-column');
                zoomControlsButtonsColumn.style.opacity = 1.0;
                // const zoomControlsButtons = document.getElementById('zoomControlsButtons-optional');
                // zoomControlsButtons.style.opacity = 1.0;
                const zoomControlsString = document.getElementById('zoom-str-optional'); // actually === zoomDivs[1] above

                if (zoomControlsString) {
                    zoomControlsString.innerHTML = Math.floor(zoom * 70.0) + "%";
                    zoomControlsString.style.display = 'inline';
                    // zoomControlsString.style.padding = '10px';
                }
            }

            if (showExportPdfControl) {
                const exportPdfButtonColumn = document.getElementById('print-pdf-btn-optional-column');
                if (exportPdfButtonColumn) {
                    exportPdfButtonColumn.style.opacity = 1.0;
                }
            }

            const pageFormatControlColumn = document.getElementById("selectPageSize-optional-column");
            if (pageFormatControlColumn) {
                if (showPageFormatControl) {
                    pageFormatControlColumn.style.opacity = 1.0;
                } else {
                    // showPageFormatControlColumn.innerHTML = "";
                    // pageFormatControlColumn.style.minWidth = 0;
                    // pageFormatControlColumn.style.width = 0;
                    pageFormatControlColumn.style.display = 'none'; // squeezes buttons/columns
                    // pageFormatControlColumn.style.visibility = 'hidden';

                    // const optionalControlsColumnContainer = document.getElementById("optionalControlsColumnContainer");
                    // optionalControlsColumnContainer.removeChild(pageFormatControlColumn);
                    // optionalControlsColumnContainer.width *= 0.66;
                    // optionalControls.witdh *= 0.66;
                    // optionalControls.focus();
                }
            }
        }

        // Create select
        for (name in samples) {
            if (samples.hasOwnProperty(name)) {
                option = document.createElement("option");
                option.value = samples[name];
                option.textContent = name;
            }
            if (selectSample) {
                selectSample.appendChild(option);
            }
        }
        if (JSON.stringify(selectSample) != '{}') {
            selectSample.onchange = selectSampleOnChange;
        }


        for (const selectPageSize of selectPageSizes) {
            if (selectPageSize) {
                selectPageSize.onchange = function (evt) {
                    var value = evt.target.value;
                    openSheetMusicDisplay.setPageFormat(value);
                    openSheetMusicDisplay.render();
                };
            }
        }

        // Pre-select default music piece

        custom.appendChild(document.createTextNode("Custom"));

        // Create zoom controls
        for (const zoomIn of zoomIns) {
            if (zoomIn) {
                zoomIn.onclick = function () {
                    zoom *= 1.2;
                    scale();
                };
            }
        }
        for (const zoomOut of zoomOuts) {
            if (zoomOut) {
                zoomOut.onclick = function () {
                    zoom /= 1.2;
                    scale();
                };
            }
        }

        // Create OSMD object and canvas
        openSheetMusicDisplay = new OpenSheetMusicDisplay(canvas, {
            autoResize: true,
            backend: backendType,
            //backend: "canvas",
            //cursorsOptions: [{type: 3, color: "#2bb8cd", alpha: 0.6, follow: true}], // highlight current measure instead of just a small vertical bar over approximate notes
            disableCursor: false,
            drawingParameters: compactMode ? "compact" : "default", // try compact (instead of default)
            drawPartNames: true, // try false
            // drawTitle: false,
            // drawSubtitle: false,
            drawFingerings: true,
            //fingeringPosition: "left", // Above/Below is default. try left or right. experimental: above, below.
            //fingeringPositionFromXML: false, // do this if you want them always left, for example.
            // fingeringInsideStafflines: "true", // default: false. true draws fingerings directly above/below notes
            setWantedStemDirectionByXml: true, // try false, which was previously the default behavior
            // drawUpToMeasureNumber: 3, // draws only up to measure 3, meaning it draws measure 1 to 3 of the piece.
            drawFromMeasureNumber: measureRangeStart,
            drawUpToMeasureNumber: measureRangeEnd,

            //drawMeasureNumbers: false, // disable drawing measure numbers
            //measureNumberInterval: 4, // draw measure numbers only every 4 bars (and at the beginning of a new system)
            useXMLMeasureNumbers: true, // read measure numbers from xml

            // coloring options
            coloringEnabled: true,
            // defaultColorNotehead: "#CC0055", // try setting a default color. default is black (undefined)
            // defaultColorStem: "#BB0099",

            autoBeam: false, // try true, OSMD Function Test AutoBeam sample
            autoBeamOptions: {
                beam_rests: false,
                beam_middle_rests_only: false,
                //groups: [[3,4], [1,1]],
                maintain_stem_directions: false
            },
            pageFormat: pageFormat,
            pageBackgroundColor: pageBackgroundColor,
            renderSingleHorizontalStaffline: singleHorizontalStaffline

            // tupletsBracketed: true, // creates brackets for all tuplets except triplets, even when not set by xml
            // tripletsBracketed: true,
            // tupletsRatioed: true, // unconventional; renders ratios for tuplets (3:2 instead of 3 for triplets)
        });
        openSheetMusicDisplay.TransposeCalculator = new TransposeCalculator(); // necessary for using osmd.Sheet.Transpose and osmd.Sheet.Instruments[i].Transpose
        //openSheetMusicDisplay.DrawSkyLine = true;
        //openSheetMusicDisplay.DrawBottomLine = true;
        //openSheetMusicDisplay.setDrawBoundingBox("GraphicalLabel", false);
        openSheetMusicDisplay.setLogLevel('info'); // set this to 'debug' if you want to see more detailed control flow information in console

        document.getElementById('right').appendChild(canvas)
        // document.body.appendChild(canvas);

        window.addEventListener("keydown", function (e) {
            var event = window.event ? window.event : e;
            if (event.keyCode === 37) {
                openSheetMusicDisplay.cursor.previous();
                console.log('fasong:' + getNowNote());
                ws.send(getNowNote());
            }
            if (event.keyCode === 39) {
                openSheetMusicDisplay.cursor.next();
                console.log('fasong:' + getNowNote());
                ws.send(getNowNote());
            }
        });
        previousCursorBtn?.addEventListener("click", function () {
            openSheetMusicDisplay.cursor.previous();
            console.log('fasong:' + getNowNote());
            ws.send(getNowNote());
        });
        nextCursorBtn.addEventListener("click", function () {
            // debugger
            let re = new Note();
            openSheetMusicDisplay.cursor.next();
            console.log('fasong:' + getNowNote());
            ws.send(getNowNote());
            // osmd.graphic.measureList[0][0].staffEntries[0].graphicalVoiceEntries[0].notes[0].sourceNote.noteheadColor = "#FF0000" // for the piano note, try measureList[0][1].
            // osmd.graphic.measureList[0][0].staffEntries[1].graphicalVoiceEntries[0].notes[0].sourceNote.noteheadColor = "#0000FF" // blue note on "Auf"
            // osmd.render()

            // 当前音openSheetMusicDisplay.cursor.Iterator.CurrentVoiceEntries
            // const cursorVoiceEntry = openSheetMusicDisplay.cursor.Iterator.CurrentVoiceEntries[0];
            // const lowestVoiceEntryNote = cursorVoiceEntry.Notes[0];

        });
        resetCursorBtn.addEventListener("click", function () {
            openSheetMusicDisplay.cursor.reset();
        });
        if (followCursorCheckbox) {
            followCursorCheckbox.onclick = function () {
                openSheetMusicDisplay.FollowCursor = !openSheetMusicDisplay.FollowCursor;
            }
        }
        hideCursorBtn.addEventListener("click", function () {
            if (openSheetMusicDisplay.cursor) {
                openSheetMusicDisplay.cursor.hide();
            } else {
                console.info("Can't hide cursor, as it was disabled (e.g. by drawingParameters).");
            }
        });
        showCursorBtn.addEventListener("click", function () {
            if (openSheetMusicDisplay.cursor) {
                openSheetMusicDisplay.cursor.show();
            } else {
                console.info("Can't show cursor, as it was disabled (e.g. by drawingParameters).");
            }
        });
        // TODO after selectSampleOnChange, the resize handler triggers immediately,
        //   so we render twice at the start of the demo.
        //   maybe delay the first osmd render, e.g. when window ready?
        if (paramOpenUrl) {
            if (openSheetMusicDisplay.getLogLevel() < 2) { // debug or trace
                console.log("[OSMD] selectSampleOnChange with " + paramOpenUrl);
            }
            selectSampleOnChange(paramOpenUrl);
        } else {
            if (openSheetMusicDisplay.getLogLevel() < 2) { // debug or trace
                console.log("[OSMD] selectSampleOnChange without param");
            }
        }


    }

    // 获取真实ip地址
    function getIpPath() {
        //回车执行查询
        let xhr = new XMLHttpRequest()
        xhr.open('GET', `http://www.suihanmusic.com:5001`)
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    sessionStorage.setItem('ipPath', JSON.parse(xhr.response).ip)
                }
            }
        }
        xhr.send(null);
    }
    function getSongs() {
        //回车执行查询
        let baseUrl = sessionStorage.getItem('ipPath');
        let xhr = new XMLHttpRequest()
        xhr.open('POST', `http://${baseUrl}:16007/search_xml`)
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        document.getElementById('selectSample').value
        xhr.send(window.Qs.stringify({ 'searchXml': '' }))
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let res = JSON.parse(xhr.response);
                    if (res.seatchResList.length > 0) {
                        // Create select
                        let option;
                        for (let i = 0; i < res.seatchResList.length; i++) {
                            if (res.seatchResList.length > 0) {
                                option = document.createElement("option");
                                option.value = `http://${baseUrl}${res.seatchResList[i].savePath}`;
                                option.textContent = res.seatchResList[i].xmlName;
                            }
                            if (selectSample) {
                                selectSample.appendChild(option);
                            }
                        }
                        selectSampleOnChange();
                    }
                    else {
                        html = `<span class="dictName">
                       暂无匹配数据
                      </span>`
                    }
                }
            }
        }
    }

    function findGetParameter(parameterName) {
        // special treatment for the openUrl parameter, because different systems attach different arguments to an URL.
        // because of CORS (cross-origin safety restrictions), you can only load an xml file from the same origin (server).

        // test parameter: ?openUrl=https://opensheetmusiceducation.org/index.php?gf-download=2020%2F01%2FJohannSebastianBach_PraeludiumInCDur_BWV846_1.xml&endUrl&form-id=1&field-id=4&hash=c4ba271ef08204a26cbd4cd2d751c53b78f238c25ddbb1f343e1172f2ce2aa53
        //   (enable the console.log at the end of this method for testing)
        // working test parameter in local demo: ?openUrl=OSMD_function_test_all.xml&endUrl

        if (parameterName === 'openUrl') {
            let startParameterName = 'openUrl=';
            let endParameterName = '&endUrl';
            let openUrlIndex = location.search.indexOf(startParameterName);
            if (openUrlIndex < 0) {
                return undefined;
            }
            let endIndex = location.search.indexOf(endParameterName) + endParameterName.length;
            if (endIndex < 0) {
                console.log("[OSMD] If using openUrl as a parameter, you have to end it with '&endUrl'. openUrl parameter omitted.");
                return undefined;
            }
            let urlString = location.search.substring(openUrlIndex + startParameterName.length, endIndex - endParameterName.length);
            //console.log("openUrl: " + urlString);
            return urlString;
        }

        let result = undefined;
        let tmp = [];
        location.search
            .substr(1)
            .split('&')
            .forEach(function (item) {
                tmp = item.split('=');
                if (tmp[0] === parameterName) {
                    result = decodeURIComponent(tmp[1]);
                    //console.log('Found param:' + parameterName + ' = ' + result);
                }
            });
        return result;
    }

    function selectBoundingOnChange(evt) {
        var value = evt.target.value;
        openSheetMusicDisplay.DrawBoundingBox = value;
    }

    function selectSampleOnChange(str) {
        error();
        disable();
        var isCustom = typeof str === "string";
        if (!isCustom) {
            if (JSON.stringify(selectSample) != "{}") {
                str = sampleFolder + selectSample.value;
            } else {
                // if (samples && samples.length > 0) {
                //     str = sampleFolder + samples[0];
                // } else {
                //     return; // no sample to load right now
                // }
                return;
            }
        }
        // zoom = 1.0;

        setSampleSpecificOptions(str, isCustom);

        openSheetMusicDisplay.load(str).then(

            function () {
                // This gives you access to the osmd object in the console. Do not use in production code
                window.osmd = openSheetMusicDisplay;
                openSheetMusicDisplay.zoom = zoom;
                //openSheetMusicDisplay.Sheet.Transpose = 3; // try transposing between load and first render if you have transpose issues with F# etc
                return openSheetMusicDisplay.render();
            },
            function (e) {

                errorLoadingOrRenderingSheet(e, "rendering");
            },
        ).then(
            function () {
                return onLoadingEnd(isCustom);
            }, function (e) {
                errorLoadingOrRenderingSheet(e, "loading");
                onLoadingEnd(isCustom);
            }
        );
    }

    function setSampleSpecificOptions(str, isCustom) {
        if (!isCustom && str.includes("measuresToDraw")) { // set options for measuresToDraw sample
            // stash previously set range of measures to draw
            if (!measureToDrawRangeNeedsReset) { // only stash once, when measuresToDraw called multiple times in a row
                minMeasureToDrawStashed = openSheetMusicDisplay.EngravingRules.MinMeasureToDrawIndex + 1;
                maxMeasureToDrawStashed = openSheetMusicDisplay.EngravingRules.MaxMeasureToDrawIndex + 1;
            }
            measureToDrawRangeNeedsReset = true;

            // for debugging: draw from a random range of measures
            let minMeasureToDraw = Math.ceil(Math.random() * 15); // measures start at 1 (measureIndex = measure number - 1 elsewhere)
            let maxMeasureToDraw = Math.ceil(Math.random() * 15);
            if (minMeasureToDraw > maxMeasureToDraw) {
                minMeasureToDraw = maxMeasureToDraw;
                let a = minMeasureToDraw;
                maxMeasureToDraw = a;
            }
            //minMeasureToDraw = 1; // set your custom indexes here. Drawing only one measure can be a special case
            //maxMeasureToDraw = 1;
            console.log("drawing measures in the range: [" + minMeasureToDraw + "," + maxMeasureToDraw + "]");
            openSheetMusicDisplay.setOptions({
                drawFromMeasureNumber: minMeasureToDraw,
                drawUpToMeasureNumber: maxMeasureToDraw
            });
        } else if (measureToDrawRangeNeedsReset) { // reset for other samples
            openSheetMusicDisplay.setOptions({
                drawFromMeasureNumber: minMeasureToDrawStashed,
                drawUpToMeasureNumber: maxMeasureToDrawStashed
            });
            measureToDrawRangeNeedsReset = false;
        }

        if (!isCustom && str.includes("Test_Container_height")) {
            drawingParametersStashed = openSheetMusicDisplay.drawingParameters.drawingParametersEnum;
            openSheetMusicDisplay.setOptions({
                drawingParameters: "compacttight"
            });
            drawingParametersNeedsReset = true;
        } else if (drawingParametersNeedsReset) {
            openSheetMusicDisplay.setOptions({
                drawingParameters: drawingParametersStashed
            });
            drawingParametersNeedsReset = false;
        }

        // Enable Boomwhacker-like coloring for OSMD Function Test - Auto-Coloring (Boomwhacker-like, custom color set)
        if (!isCustom && str.includes("auto-custom-coloring")) { // set options for auto coloring sample
            autoCustomColoringOptionNeedsReset = true;
            //openSheetMusicDisplay.setOptions({coloringMode: 1}); // Auto-Coloring with pre-defined colors
            openSheetMusicDisplay.setOptions({
                coloringMode: 2, // custom coloring set. 0 would be XML, 1 autocoloring
                coloringSetCustom: ["#d82c6b", "#F89D15", "#FFE21A", "#4dbd5c", "#009D96", "#43469d", "#76429c", "#ff0000"],
                // last color value of coloringSetCustom is for rest notes
                colorStemsLikeNoteheads: true
            });
        } else if (autoCustomColoringOptionNeedsReset) {
            openSheetMusicDisplay.setOptions({ // set default values. better would be to restore to stashed values, but unnecessarily complex for demo
                coloringMode: 0,
                colorStemsLikeNoteheads: false,
                coloringSetCustom: null
            });
            autoCustomColoringOptionNeedsReset = false;
        }
        if (!isCustom && str.includes("autobeam")) {
            autobeamOptionStashedValue = openSheetMusicDisplay.EngravingRules.AutoBeamNotes; // stash previously set value, to restore later
            autobeamOptionNeedsReset = true;
            openSheetMusicDisplay.setOptions({ autoBeam: true });
        } else if (autobeamOptionNeedsReset) {
            openSheetMusicDisplay.setOptions({ autoBeam: autobeamOptionStashedValue });
            autobeamOptionNeedsReset = false;
        }
        if (!isCustom && str.includes("OSMD_Function_Test_System_and_Page_Breaks")) {
            pageBreaksOptionStashedValue = openSheetMusicDisplay.EngravingRules.NewPageAtXMLNewPageAttribute;
            systemBreaksOptionStashedValue = openSheetMusicDisplay.EngravingRules.NewSystemAtXMLNewSystemAttribute;
            pageBreaksOptionNeedsReset = true;
            openSheetMusicDisplay.setOptions({ newPageFromXML: true, newSystemFromXML: true });
        }
        else if (pageBreaksOptionNeedsReset) {
            openSheetMusicDisplay.setOptions({ newPageFromXML: pageBreaksOptionStashedValue, newSystemFromXML: systemBreaksOptionStashedValue });
            pageBreaksOptionNeedsReset = false;
        }
        if (!isCustom && str.includes("Schubert_An_die_Musik")) { // TODO weird layout bug here with part names. but shouldn't be in score anyways
            drawPartNamesOptionStashedValue = openSheetMusicDisplay.EngravingRules.RenderPartNames;
            drawPartAbbreviationsStashedValue = openSheetMusicDisplay.EngravingRules.RenderPartAbbreviations;
            openSheetMusicDisplay.setOptions({ drawPartNames: false, drawPartAbbreviations: false }); // TODO sets osmd.drawingParameters.DrawPartNames! also check EngravingRules.RenderPartAbbreviations, was false
            drawPartNamesOptionNeedsReset = true;
        } else if (drawPartNamesOptionNeedsReset) {
            openSheetMusicDisplay.setOptions({ drawPartNames: drawPartNamesOptionStashedValue, drawPartAbbreviations: drawPartAbbreviationsStashedValue });
            drawPartNamesOptionNeedsReset = false;
        }
    }

    function errorLoadingOrRenderingSheet(e, loadingOrRenderingString) {
        var errorString = "Error " + loadingOrRenderingString + " sheet: " + e;
        // Always giving a StackTrace might give us more and better error reports.
        // TODO for a release, StackTrace control could be reenabled
        errorString += "\n" + "StackTrace: \n" + e.stack;
        // }
        console.warn(errorString);
    }

    function onLoadingEnd(isCustom) {
        // 默认显示光标
        if (openSheetMusicDisplay.cursor) {
            openSheetMusicDisplay.cursor.show();
        } else {
            console.info("Can't show cursor, as it was disabled (e.g. by drawingParameters).");
        }
        // Remove option from select
        if (!isCustom && custom.parentElement === selectSample) {
            selectSample.removeChild(custom);
        }
        // Enable controls again
        enable();
        // 发送初始第一个值
        setTimeout(() => {
            ws.send(getNowNote());
        }, 100);
    }

    function logCanvasSize() {
        for (const zoomDiv of zoomDivs) {
            if (zoomDiv) {
                zoomDiv.innerHTML = Math.floor(zoom * 70.0) + "%";
            }
        }
    }

    function scale() {
        disable();
        window.setTimeout(function () {
            openSheetMusicDisplay.Zoom = zoom;
            openSheetMusicDisplay.render();
            enable();
        }, 0);
    }

    function rerender() {
        disable();
        window.setTimeout(function () {
            if (openSheetMusicDisplay.IsReadyToRender()) {
                openSheetMusicDisplay.render();
            } else {
                console.log("[OSMD demo] Loses context!"); // TODO not sure that this message is reasonable, renders fine anyways. maybe vexflow context lost?
                selectSampleOnChange(); // reload sample e.g. after osmd.clear()
            }
            enable();
        }, 0);
    }

    function error(errString) {
        if (!errString) {
            error_tr.style.display = "none";
        } else {
            console.log("[OSMD demo] error: " + errString)
            err.textContent = errString;
            error_tr.style.display = "";
            canvas.width = canvas.height = 0;
            enable();
        }
    }

    // Enable/Disable Controls
    function disable() {
        document.body.style.opacity = 0.3;
        setDisabledForControls("disabled");
    }

    function enable() {
        document.body.style.opacity = 1;
        setDisabledForControls("");
        logCanvasSize();
    }

    function setDisabledForControls(disabledValue) {
        if (selectSample) {
            selectSample.disabled = disabledValue;
        }
        for (const zoomIn of zoomIns) {
            if (zoomIn) {
                zoomIn.disabled = disabledValue;
            }
        }
        for (const zoomOut of zoomOuts) {
            if (zoomOut) {
                zoomOut.disabled = disabledValue;
            }
        }
    }

    /**
     * Creates a Pdf of the currently rendered MusicXML
     * @param pdfName if no name is given, the composer and title of the piece will be used
     */
    async function createPdf(pdfName) {
        if (openSheetMusicDisplay.backendType !== BackendType.SVG) {
            console.log("[OSMD] createPdf(): Warning: createPDF is only supported for SVG background for now, not for Canvas." +
                " Please use osmd.setOptions({backendType: SVG}).");
            return;
        }

        if (pdfName === undefined) {
            pdfName = openSheetMusicDisplay.sheet.FullNameString + ".pdf";
        }

        const backends = openSheetMusicDisplay.drawer.Backends;
        let svgElement = backends[0].getSvgElement();

        let pageWidth = 210;
        let pageHeight = 297;
        const engravingRulesPageFormat = openSheetMusicDisplay.rules.PageFormat;
        if (engravingRulesPageFormat && !engravingRulesPageFormat.IsUndefined) {
            pageWidth = engravingRulesPageFormat.width;
            pageHeight = engravingRulesPageFormat.height;
        } else {
            pageHeight = pageWidth * svgElement.clientHeight / svgElement.clientWidth;
        }

        const orientation = pageHeight > pageWidth ? "p" : "l";
        // create a new jsPDF instance
        const pdf = new jsPDF.jsPDF({
            orientation: orientation,
            unit: "mm",
            format: [pageWidth, pageHeight]
        });
        //const scale = pageWidth / svgElement.clientWidth;
        for (let idx = 0, len = backends.length; idx < len; ++idx) {
            if (idx > 0) {
                pdf.addPage();
            }
            svgElement = backends[idx].getSvgElement();

            if (!pdf.svg && !svg2pdf) { // this line also serves to make the svg2pdf not unused, though it's still necessary
                // we need svg2pdf to have pdf.svg defined
                console.log("svg2pdf missing, necessary for jspdf.svg().");
                return;
            }
            await pdf.svg(svgElement, {
                x: 0,
                y: 0,
                width: pageWidth,
                height: pageHeight,
            })
        }

        pdf.save(pdfName); // save/download the created pdf
        //pdf.output("pdfobjectnewwindow", {filename: "osmd_createPDF.pdf"}); // open PDF in new tab/window

        // note that using jspdf with svg2pdf creates unnecessary console warnings "AcroForm-Classes are not populated into global-namespace..."
        // this will hopefully be fixed with a new jspdf release, see https://github.com/yWorks/jsPDF/pull/32
    }

    // Register events: load, drag&drop
    window.addEventListener("load", function () {
        // wsRecorder.send('MACIP');
        // wsRecorder.onmessage = function (e) {
        //     if (e.data) {
        //         console.log('获取mac地址内容:' + e.data);
        //         sessionStorage.setItem('customerId', ' e.data')
        //     }
        // }
        getIpPath();
        getSongs();
        init();
    });
    window.addEventListener("dragenter", function (event) {
        event.preventDefault();
        disable();
    });
    window.addEventListener("dragover", function (event) {
        event.preventDefault();
    });
    window.addEventListener("dragleave", function (event) {
        enable();
    });
    window.addEventListener("drop", function (event) {
        event.preventDefault();
        if (!event.dataTransfer || !event.dataTransfer.files || event.dataTransfer.files.length === 0) {
            return;
        }
        // Add "Custom..." score
        selectSample.appendChild(custom);
        custom.selected = "selected";
        // Read dragged file
        var reader = new FileReader();
        reader.onload = function (res) {
            selectSampleOnChange(res.target.result);
        };
        var filename = event.dataTransfer.files[0].name;
        if (filename.toLowerCase().indexOf(".xml") > 0
            || filename.toLowerCase().indexOf(".musicxml") > 0) {
            reader.readAsText(event.dataTransfer.files[0]);
        } else if (event.dataTransfer.files[0].name.toLowerCase().indexOf(".mxl") > 0) {
            reader.readAsBinaryString(event.dataTransfer.files[0]);
        }
        else {
            alert("No vaild .xml/.mxl/.musicxml file!");
        }

    });


}());

