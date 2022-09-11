/**
 * 日期格式化
 * @param {*} date
 * @param {*} patter
 * @returns
 */
exports.dateFormat = (date = new Date(), patter = "YYYY-MM-DD mm:ss") => {
  // 判断是否是日期
  function isDate(val) {
    return val instanceof Date && !isNaN(val.getTime());
  }
  //补0
  function setFill(val) {
    return val > 9 ? val : "0" + val;
  }

  let nowTime = date;
  if (!isDate(nowTime)) {
    // 有可能是日期格式的字符串，或者时间戳
    nowTime = /^\d+$/.test(nowTime) ? Number(nowTime) : nowTime;
    nowTime = new Date(nowTime); //尝试转为日期
    //转为之后再做一次判断
    if (!isDate(nowTime)) {
      return date; //如果还不是日期格式，直接返回原数据
    }
  }
  let data = {
    "Y+": nowTime.getFullYear(), //年
    "M+": setFill(nowTime.getMonth() + 1), //月
    "D+": setFill(nowTime.getDate()), //日
    "h+": setFill(nowTime.getHours()), //时
    "m+": setFill(nowTime.getMinutes()), //分
    "s+": setFill(nowTime.getSeconds()), //秒
    S: nowTime.getMilliseconds(), //毫秒
    J: Math.floor((nowTime.getMonth() + 3) / 3), //季度
  };
  for (const key in data) {
    if (new RegExp("(" + key + ")").test(patter)) {
      patter = patter.replace(RegExp.$1, data[key]);
    }
  }

  return patter;
};

/**
 * 是否为空数据
 * @param {*} val
 * @returns
 */
exports.isEmpty = (val) => {
  return val === "" || val === undefined || val === null;
};

/**
 * 美化输出
 */
exports.logs = {
  info: (str = "") => {
    // console.log(`\u001b[32m${str}\u001b[32m`);//绿色
    console.log(`\x1B[32m${str}\x1B[0m`);
  },
  error: (str = "") => {
    console.log(`\x1B[31m${str}\x1B[0m`);
    // console.log(`\u001b[31m${str}\u001b[31m`);//红色
  },
};

/**
 * 终端退出
 * @param {*} code
 */
exports.exit = (code) => {
  process.exit(code);
};

/**
 * 映射字段名称
 */
exports.servierMapName = {
  PROJECT_NAME: "项目名称：",
  NODE_ENV: "环境：",
  host: "地址：",
  port: "端口：",
  localDir:"本地项目：",
  remoteDir: "部署目录：",
  backdir: "远程备份目录：",
  remoteFile: "部署目录指定文件：",
};

/**
 *
 * @param {*} data 数据源
 * @param {*} dataMapName 数据映射
 * @returns
 */
exports.outMapTranformStr = (data, dataMapName) => {
  let result = [];
  for (const key in dataMapName) {
    result.push(`${dataMapName[key]}${data[key]}`);
  }
  return result.join("\n");
};
