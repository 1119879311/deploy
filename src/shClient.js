const Client = require("ssh2").Client;
const { logs } = require("./util");

/**
 * sh 基本 api 封装 转为 Promise 形式
 */

/**
 * 执行 sh
 * @param {*} shInstance sh2 实例
 * @param {*} sh  sh 语句
 * @param {*} isOutlog 是否输出执行日志
 * @returns
 */
const shShell = (shInstance, sh, isOutlog) => {
  return new Promise((resolve, reject) => {
    shInstance.shell(function (err, stream) {
      if (err) throw err;
      stream
        .on("close", function () {
          stream.close();
          resolve(true);
        })
        .on("data", function (data) {
          isOutlog && logs.info(data);
        })
        .on("error", function (error) {
          reject(error);
          console.log("[sh:error]:" + error);
        });
      stream.end(sh);
    });
  });
};

/**
 * //上转文件到服务器
 * @param {*} shInstance  sh2 实例
 * @param {*} localFiles  本地要上转的文件、文件夹
 * @param {*} remoteDir  远程目录
 * @returns
 */
function shUploadFile(shInstance, localFiles, remoteDir) {
  if (!shInstance) return;
  logs.info(`${localFiles}=>开始上传文件至服务器..`);

  return new Promise((resolve, reject) => {
    shInstance.sftp(function (err, sftp) {
      if (err) {
        logs.error(`sftp 连接失败..`);
        return reject(err);
      }
      sftp.fastPut(
        localFiles,
        remoteDir.replace(/\\/g, "/"),
        {},
        function (err, result) {
          if (err) {
            logs.error(`文件上传失败..`);
            return reject(err);
          }
          logs.info(`${remoteDir}=>文件上传成功..`);
          resolve(result);
        }
      );
    });
  });
}
/**
 * 获取连接事件
 * @param {*} shInstance
 * @returns
 */
function shConnect(shInstance) {
  return new Promise((resolve, reject) => {
    logs.info("服务器连接中...")
    shInstance.on("error", (err) => {
      reject(err);
      logs.error(`服务器连接失败..`);
      console.error(err)
      process.exit(1);
    });
    shInstance.on("ready", (...args) => {
      logs.info("服务器连接成功!")
      resolve(...args);
    });
  });
}

/**
 * 关闭连接
 * @param {*} shInstance sh 实例
 */
function shClonse(shInstance) {
  shInstance.end();
}

/**
 *
 * @param {*} option sh 连接参数
 * @returns
 */
function shFactory(option) {
  const shInstance = new Client();

  shInstance.connect({
    host: option.host,
    port: option.port,
    username: option.username,
    password: option.password,
  });
  const clonse = () => shClonse(shInstance);
  const shell = (sh, isOutlog) => shShell(shInstance, sh, isOutlog);
  const connect = shConnect(shInstance);

  const uploadFile = (localFiles, remoteDir) =>
    shUploadFile(shInstance, localFiles, remoteDir);

  return { shInstance, connect, shell, uploadFile, clonse };
}

module.exports = shFactory;
