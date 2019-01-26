const isChinese = require('is-chinese');
const containsChinese = require('contains-chinese');

module.exports = function(RED) {
    function DetectChineseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
			msg.chinese = isChinese(msg.payload) ? 'entire' : (containsChinese(msg.payload) ? 'partial' : 'none');
            node.send(msg);
        });
    }
    RED.nodes.registerType("detect-chinese",DetectChineseNode);
}