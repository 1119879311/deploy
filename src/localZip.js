const path = require("path");
const fs = require("fs")
const archiver = require("archiver");
const { logs } = require("./util");

/**
 * 
 * @param {*} fileName 
 * @param {*} localDir 
 * @param {*} isZip 
 * @returns 
 */

function localZip(fileName, localDir, isZip) {
  return new Promise((resolve) => {
    try {
      let localZipDir = path.resolve(process.cwd(), fileName);
      if (isZip) return resolve(localZipDir);
      if (fs.existsSync(localZipDir)) {
        fs.unlinkSync(localZipDir);
        logs.info(`已删除本地旧版压缩`);
      }
      let res = fs.existsSync(localDir);
      if (!res) {
        logs.error(`本地目录不存在:${localDir}`)
        throw new Error("本地目录不存在");
      }
      logs.info(`开始压缩本地文件...`);
      const output = fs.createWriteStream(localZipDir);
      const archive = archiver("tar", {
        gzip: true,
        gzipOptions: {
          level: 9,
        },
      });
      archive.on("error", function (err) {
        throw err;
      });
      archive.pipe(output);
      archive.directory(localDir, false);
      archive.finalize();
      output.on("finish", () => {
        logs.info(`本地文件压缩成功:${localZipDir}`);
        resolve(localZipDir);
      });
    } catch (error) {
      throw error;
    }
  });
}

module.exports = localZip;
