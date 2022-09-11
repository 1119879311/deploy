/**
 * 终端输入简单的交互
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("close", function () {
  rl.close();
});

function readl(tip) {
  return new Promise((resolve) => {
    rl.question(tip, (answer) => {
      resolve(answer);
    });
  });
}
module.exports = readl;
