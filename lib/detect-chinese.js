const isChinese = require('is-chinese');
const containsChinese = require('contains-chinese');

module.exports = function (RED) {
	function DetectChineseNode(config) {
		RED.nodes.createNode(this, config);

		this.topic = config.topic;
		this.input = config.input || 'payload'; // where to take the input from
		this.inputType = config.inputType || 'msg'; // msg, flow, global or string
		this.output = config.output || 'detect'; // where to put the output
		this.outputType = config.outputType || 'msg'; // msg, flow or global

		var node = this;
		node.on('input', function (msg) {
			'use strict';

			// If the node's topic is set, copy to output msg
			if (node.topic !== '') {
				msg.topic = node.topic;
			}
			// make sure output property is set, if not, assume msg.payload
			if (node.output === '') {
				node.output = 'payload';
			}
			if (node.outputType === '') {
				node.outputType = 'msg';
				node.warn('Output Type field is REQUIRED, currently blank, set to msg');
			}

			// If the input property is blank, assume msg.payload as the required timestamp
			// or make sure that the node's input property actually exists on the input msg
			var inp = '';

			switch (node.inputType) {
				case 'msg':
					inp = RED.util.getMessageProperty(msg, node.input);
					break;
				case 'flow':
					inp = node.context().flow.get(node.input);
					break;
				case 'global':
					inp = node.context().global.get(node.input);
					break;
				case 'env':
					inp = RED.util.evaluateNodeProperty(node.input, node.inputType, node, msg);
					break;
				default:
					node.warn('Unrecognised Input Type, ' + node.inputType + '. Output has been set to none.');
			}

			var detect = isChinese(msg.payload) ? 'entire' : (containsChinese(inp) ? 'partial' : 'none');
			setOutput(msg, node.outputType, node.output, detect);
			node.send(msg);
		});

		function setOutput(msg, outputType, output, value) {
			try {
				switch (outputType) {
					case 'msg':
						RED.util.setMessageProperty(msg, output, value);
						break;
					case 'flow':
						node.context().flow.set(output, value);
						break;
					case 'global':
						node.context().global.set(output, value);
						break;
					default:
						node.warn('Unrecognised Output Type, ' + outputType + '. No output.');
				}
			} catch (err) {
				node.warn('Output property, ' + outputType + '.' + output + ', cannot be set. No output.', err);
			}
		}

	}

	RED.nodes.registerType("detect-chinese", DetectChineseNode);
}