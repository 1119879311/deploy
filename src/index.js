const fs = require("fs");
const allOption = require("../config");
const { isEmpty,logs, outMapTranformStr, servierMapName} = require("./util");
const outOption = runScriptParseOptions();
const deploy = require("./deploy");

// 获取 参数
function runScriptParseOptions() {
  const argvArr = process.argv.slice(2);
  let YESY = false;
  const argvList = argvArr.filter((item) => {
    if (item === "y") {
      YESY = true;
      return false;
    }
    return true;
  });
  const PROJECT_NAME = argvList[0] || process.env.PROJECT_NAME;
  const NODE_ENV = process.env.NODE_ENV;
  const serviceOption = allOption[PROJECT_NAME];
  return { PROJECT_NAME, NODE_ENV, YESY, serviceOption };
}

/**
 * 验证本地参数
 *
 */
function verifyOutOption() {
  const { PROJECT_NAME, serviceOption, NODE_ENV } = outOption;
  if (isEmpty(serviceOption)) {
    logs.error(`参数[PROJECT_NAME]有误 ${PROJECT_NAME} ; 没有配置指定环境的服务器`);
    throw new Error("ERROR");
  }
  logs.info(
    outMapTranformStr(
      { PROJECT_NAME, NODE_ENV, ...serviceOption },
      servierMapName
    )
  );
  const { localDir, remoteDir, remoteFile } = serviceOption || {};

  if (isEmpty(localDir) || !fs.existsSync(localDir)) {
    logs.error(`[error] 本地目录不存在:[localDir]:${localDir}`);
    throw new Error("ERROR");
  }
  if (isEmpty(remoteDir) || remoteDir == "/") {
    logs.error(`[error] 远程部署目录有误:[remoteDir]:${remoteDir}`);
    throw new Error("ERROR");
  }
  if (isEmpty(remoteFile) || remoteFile == "/" || remoteFile == "/*") {
    logs.error(
      `[error] 远程目录没配置对应部署文件有误:[remoteFile]:${remoteFile}`
    );
    throw new Error("ERROR");
  }
}

function run() {
  const {serviceOption,...baseProps} = outOption
  new deploy({ ...serviceOption, ...baseProps});
}

function start() {
  verifyOutOption();
  run();
}

start();
