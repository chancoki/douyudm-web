// main.js
window.onload = function () {
  // 常量定义
  const DEFAULT_FONT_SIZE = 12; // 默认字体大小
  const LIGHT_BG = "#F2F5F6";   // 亮色背景
  const DARK_BG = "#232427";    // 暗色背景
  const MAX_MSG_COUNT = 150;    // 最大消息数

  // DOM 元素获取
  const roomEle = document.querySelector(".room");
  const msg = document.querySelector(".msg");
  const cutBtn = document.querySelector(".cut");
  const addBtn = document.querySelector('.add');
  const subBtn = document.querySelector('.sub');
  const list = document.querySelector(".list");
  const bt = document.querySelector(".bt");

  // 状态变量
  let msgNum = 0;           // 未读消息数
  let scrollFlag = true;    // 是否自动滚动到底部
  let fontSize = Number(getLocal("Size", DEFAULT_FONT_SIZE)); // 当前字体大小
  let isLight = true;       // 是否为亮色模式

  // 获取本地存储
  function getLocal(key, def) {
    const val = window.localStorage.getItem(key);
    return val || def;
  }

  // 设置字体大小
  function setFontSize(size) {
    document.body.style.fontSize = size + 'px';
    window.localStorage.setItem("Size", size);
    fontSize = size;
  }

  // 设置灯光模式
  function setLightMode(light) {
    document.body.style.background = light ? LIGHT_BG : DARK_BG;
    cutBtn.innerText = light ? "关灯" : "开灯";
    window.localStorage.setItem(
      "ligth",
      JSON.stringify({ color: light ? LIGHT_BG : DARK_BG, title: cutBtn.innerText })
    );
    isLight = light;
  }

  // 初始化字体和灯光
  setFontSize(fontSize);
  const ligth = JSON.parse(getLocal("ligth", JSON.stringify({ color: LIGHT_BG, title: "关灯" })));
  setLightMode(ligth.color === LIGHT_BG);

  // 获取直播间号
  const id = getLocal("id");
  if (!id) {
    const rid = prompt("请输入直播间号");
    if (rid) {
      window.localStorage.setItem("id", rid);
      location.reload();
    } else {
      alert("直播间号不能为空");
      return;
    }
  } else {
    window.localStorage.setItem("id", id);
  }

  document.title = id + "_直播间";

  // 弹幕对象初始化
  var room = new danmaku(id, { debug: false });

  // 连接事件
  room.on("connect", () => {
    roomEle.style.display = "block";
    roomEle.innerHTML = "连接完成";
  });
  room.on("disconnect", function () {
    console.log("[disconnect] roomId=%s", this.roomId);
  });
  room.on("error", () => {
    roomEle.style.display = "block";
    roomEle.innerHTML = "出现错误";
  });
  room.on("loginres", function (res) {
    roomEle.style.display = "block";
    roomEle.innerHTML = id;
  });

  // 添加消息到列表
  function appendMsg(html) {
    if (list.children.length > MAX_MSG_COUNT) list.removeChild(list.children[0]);
    const div = document.createElement("div");
    div.className = "duoyu";
    div.innerHTML = html;
    list.appendChild(div);
    if (scrollFlag) list.scrollTo(0, list.scrollHeight);
  }

  // 滚动检测与未读消息提示
  function scrollTime() {
    const scrollTop = list.scrollHeight - list.scrollTop;
    const clientH = document.documentElement.clientHeight;
    if (scrollTop <= clientH + clientH / 8) {
      scrollFlag = true;
      msg.style.display = "none";
      msgNum = 0;
    } else {
      scrollFlag = false;
      msg.style.display = "block";
      msg.children[0].innerHTML = ++msgNum;
    }
  }

  // 贵族颜色
  function nobilityColor(n) {
    if (n == 3) return "rgb(43, 100, 196)";
    if (n == 4) return "rgb(80, 37, 136)";
    if (n == 5) return "rgb(197, 79, 84)";
    if (n == 6) return "rgb(255, 208, 67)";
    return "";
  }

  // 文本颜色
  function color(brid, nl, bl, txt) {
    if (nl == 7) return "#75B847";
    if (nl < 7 && nl > 2 && txt) return "aliceblue";
    if (brid == id && txt) return textColor(bl);
    return "#777";
  }

  // 等级、牌子、文本颜色
  function blColor(n) {
    if (n <= 5) return "#21B8FC";
    if (n <= 10) return "#25D8E6";
    if (n <= 15) return "#FDAA29";
    if (n <= 20) return "#FD6E21";
    if (n <= 25) return "#EC1A20";
    if (n <= 30) return "#BE29E6";
    return "#D86EFE";
  }
  function textColor(n) {
    if (n <= 5) return "#777777";
    if (n <= 8) return "#2887EA";
    if (n <= 11) return "#7CC752";
    if (n <= 14) return "#FD6CB4";
    if (n <= 17) return "#FD7F24";
    if (n <= 20) return "#BE29E6";
    if (n <= 30) return "#FC0D1C";
    return "#FC0D1C";
  }
  function levelColor(n) {
    if (n <= 14) return "#D39753";
    if (n <= 29) return "#77DF85";
    if (n <= 39) return "#36C3F0";
    if (n <= 49) return "#3872DC";
    if (n <= 59) return "#7066FA";
    if (n <= 69) return "#762AF7";
    if (n <= 79) return "#9828C2";
    if (n <= 89) return "#EF096E";
    if (n <= 99) return "#DE011D";
    if (n <= 109) return "#FF511E";
    if (n <= 119) return "#FF8400";
    if (n <= 124) return "#FFA717";
    if (n <= 129) return "#8916F0";
    return "#C70137";
  }

  // 构建消息元素
  function createEle(res) {
    scrollTime();
    let html = `
      <div class="level" style="border: 1px solid ${levelColor(res.level)}; color: ${levelColor(res.level)}"><i>lv.</i>${res.level < 10 ? "0" + res.level : res.level}</div>
      ${res.bl == 0 || res.bl == "" || !res.bl
        ? ""
        : `<a href='https://www.douyu.com/${res.brid}' target='blank' class="danm" style="background:${blColor(res.bl)};">${res.bl}·${res.bnn}</a>`
      }
      <div class="user">${res.txt ? res.nn + ":" : res.nn}</div>
      <div class="text" style="color:${color(res.brid, res.nl, res.bl, res.txt)};${res.txt && res.nl < 7 && res.nl > 2 ? "background-color:" + nobilityColor(res.nl) : ""
      };">${res.txt ? res.txt : "欢迎来到本直播间"}</div>
    `;
    appendMsg(html);
  }

  // 消息事件监听
  room.on("chatmsg", createEle);
  room.on("uenter", createEle);

  // 未读消息点击，滚动到底部
  msg.addEventListener("click", () => {
    scrollFlag = true;
    list.scrollTo(0, list.scrollHeight);
    msg.style.display = "none";
    msgNum = 0;
  });

  // 窗口大小变化时自动滚动
  window.addEventListener("resize", () => {
    if (scrollFlag) list.scrollTo(0, list.scrollHeight);
  });

  // 切换房间
  bt.addEventListener("click", () => {
    const rid = prompt("直播间号");
    if (rid) {
      window.localStorage.setItem("id", rid);
      location.reload();
    }
  });

  // 灯光切换
  cutBtn.addEventListener("click", () => setLightMode(!isLight));

  // 字体增大
  addBtn.addEventListener('click', () => {
    setFontSize(fontSize + 1);
    list.scrollTo(0, list.scrollHeight);
  });

  // 字体减小
  subBtn.addEventListener('click', () => {
    if (fontSize > DEFAULT_FONT_SIZE) {
      setFontSize(fontSize - 1);
      list.scrollTo(0, list.scrollHeight);
    }
  });

  // 启动弹幕
  room.run();
};