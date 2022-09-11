/**
 * [key]:{
 *    pjname:项目名称
 *    host：服务器地址
 *    port：服务器端口
 *    username: 用户名
 *    password：密码
 *    privateKey：私钥
 *    localDir：本地项目所在地址
 *    remoteDir：远程目录
 *    remoteFile：远程目录下指定文件，1、部分如：index.html static  2、所有为 ./*
 *    backdir: 远程备份目录，备份的目录以 hash[8]+日期命名
 *
 * }
 */

module.exports = {
  400: {
    pjname: "",
    host: "", //'39.108.220.102',
    port: '',
    username: "",
    password: "",
    privateKey: "", //如果没有privateKey 就用密码登录
    localDir: "",
    remoteDir: "", //远程目录
    backdir: "", //远程备份目录，备份的目录以 hash[8]+日期命名
    remoteFile: "", //远程目录下指定文件 1、部分如：index.html static  2、所有为 ./*
  },
};
