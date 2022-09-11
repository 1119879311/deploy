const shFactory = require("./shClient");
const localZip =require("./localZip")
const readl = require("./readl");
const { logs, dateFormat, exit } = require("./util");

module.exports = class deploy {
  constructor(option) {
    this.option = option;
    this.init();
  }

  async init (){
    const {localDir} = this.option
    try {
      let actioList = {1:"本地压缩项目",2:"更新",3:"还原",4:"删除旧备份",'':"退出"}
      let readRes = await readl(
        "\n请选择你要的操作：(1: 本地压缩项目； 2:更新；3:还原；4:删除旧备份；其他退出) \n"
      );
      logs.info("你选择的操作:"+actioList[readRes])
      if(readRes==1){
        await localZip(this.getFileName(),localDir)
        exit();
      }else if(readRes){
        this.shClient = new shFactory(this.option);
        this.shAction(readRes)
      }else{
        exit();
      }

    } catch (error) {
      console.error(error)
      exit();
    } 
  }

  async shAction(readRes) {
    try {
      await this.shClient.connect;
      switch (readRes) {
        case 2:
          this.publish()
          break;
        case 3:
          this.rollBacK()
          break;
        case 4:
          this.deleteRemoteBackUp()
          break;
        default:
          this.shClient.clonse();
          process.exit()
      }
    } catch (error) {}
  }
  /**
   * 获取 设置远程的备份文件名路径
   * @returns 
   */
 getRemoteBackupsFileName (){
  const {backdir}= this.option
  let backName = dateFormat(new Date(), "YYYY.MMDD.mmss") + ".back.tar.gz";
  const zipbackFilePath = path.join(backdir, backName).replace(/\\/g, "/");
  return zipbackFilePath
 }
 

 /**
  *  获取本地压缩 和上转到远程的文件名称 
  * @returns 
  */
 getFileName (){
  const { NODE_ENV,pjname} = this.option
  return [NODE_ENV,pjname].filter(item=>item).join(".") +'.dist.tar.gz'
 }

  /**
   * 发布
   */
   async publish() {
    const {shell,clonse} = this.shClient;
    try {
      const { remoteDir,backdir,localDir,remoteFile} = this.option
      const fileName = this.getFileName();
      // 压缩本地
      const localZipDir = await localZip(fileName,localDir)
     
      logs.info(`开始部署中...`)

      //1. 创建目录：为判断远程部署目录是否存在，不存在执行sh命令则新建
      const shMkdir = [
          `if [ ! -d  ${backdir} ];then mkdir -p ${backdir}; fi\n`,
          `if [ ! -d  ${remoteDir} ];then mkdir -p ${remoteDir}; fi\n`,
          `exit\n`
      ]
      await shell(shMkdir.join(' '))

      //2. 上传文件到备份目录
      const remoteFileName = path.join(backdir, fileName).replace(/\\/g, '/')
      await uploadFile(localZipDir,remoteFileName)

      //3. 备份，更新
      let remoteBackupsFileName = this.getRemoteBackupsFileName(); 
      logs.info(`备份文件路径名为：${remoteBackupsFileName}`);

      const shellList = [`cd ${remoteDir}\n`, //进入目录
          `tar -czf ${remoteBackupsFileName} ${remoteFile} --remove-files\n`, //压缩备份原文件
          `tar -xzf  ${remoteFileName} -C ./\n`, //解压更新
          `exit\n`
      ]
      await shell(shellList.join(' '))
      logs.info(`部署成功`)

    } catch (error) {
      console.error(error)
    }finally{
      clonse()
      process.exit();
    }
  }

  /**
   * 回退
   */

  async rollBacK() {
    const { shell,clonse } = this.shClient;
    try {
      const { backdir, remoteFile, remoteDir } = this.option;
     
      //列出远程的所有压缩备份文件
      const shShow = [
               
        'echo "-----备份文件start------";' +
        'for name in `find ' + backdir + '/ -name "*.tar.gz"|xargs ls -t1`;' +
        'do echo ${name#*' + backdir + '/};' +
        'done;echo "-----备份文件END------"\n ',
        `exit\n`
      ]
      
      await shell(shShow.join(" "), true);

      const value = await readl("请输入要还原的备份文件(不需要加后缀.tar.gz)：")
      const zipbackFilePath = path.join(backdir, value + '.tar.gz').replace(/\\/g, '/');
      logs.info(`你要还原的备份文件路径名为：${zipbackFilePath}`)

      const shRoll = [
        'if [  -e ' + zipbackFilePath + ' ] && [ -e ' + remoteDir + ' ]; then echo "---文件存在---"; ' +
        '`cd ' + remoteDir + '; rm -rf ' + remoteFile + ';`' +
        'echo "---原文件已经删除---"' +
        '`tar -xzf  ' + zipbackFilePath + ' -C ' + remoteDir + '/`; echo "---还原成功---";' +
        'else echo "---远程备份文件或者远程部署目录不存在,还原失败---";' +
        'fi\n',
        `exit\n`
      ]
      await shell(shRoll.join(" "), true);
     
    } catch (error) {
      console.log(error);
    }finally{
       clonse();
      process.exit();
    }
  }

  /**
   * 备份
   */
  async backUp() {
    const {  remoteDir ,remoteFile} = this.option;
    const { shell } = this.shClient;
    try {
    
      const zipbackFilePath = this.getRemoteBackupsFileName()
      /**
       * 备份 sh 语句
       */
      const shList = [
        `cd ${remoteDir}\n`, //进入目录
        `tar -czf ${zipbackFilePath} ${remoteFile}\n`, //压缩备份原文件
        `exit\n`,
      ];
      await shell(shList.join(""));
      logs.info(`备份完成`);
    } catch (error) {
      console.error("[deploy-backUp]：" + error);
    }
  }

  /**
   * 删除远程备份(保留最新的十个备份)
   */

  async deleteRemoteBackUp() {
    const { shell,clonse } = this.shClient;
    try {
      const { backdir, YESY } = this.option;
    
      /**
       * 列表备份文件的sh 脚本
       */
      let shShow = [
        `cd ${backdir}\n`,
        'echo "-----以下是要删除的旧备份文件(已保留最新10个)start------";' +
          "backfile=`ls -t  |tail -n +11`;" +
          // 'echo ${delfile};'+
          "for name in ${backfile};" +
          "do echo ${name};" +
          'done;echo "-----旧备份文件END------"\n ',
        `exit\n`,
      ];

      /**
       * 删除备份文件的sh脚本(只保留前10)
       */
      let shDeltele = [
        `cd ${backdir}\n`,
        "delfile=`ls -t  |tail -n +11`;" +
          "echo ${delfile};" +
          "rm -rf ${delfile};" +
          `exit\n`,
      ];
      let isDel;
      if (!YESY) {
        await shell(shShow.join(" "), true);
        isDel = await readl("确认是否需要删除旧备份,保留最新10个，(1:确定;其他退出)：");
      }
      if (YESY || isDel == 1) {
        await shell(shDeltele.join(" "), true);
        logs.info(`成功删除旧备份`);
      }
    } catch (error) {
      console.error("[deploy-deleteRemoteBackUp]：" + error);
    } finally {
      clonse();
      process.exit();
    }
  }
};
