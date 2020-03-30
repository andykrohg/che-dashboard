/*******************************************************************************
 * Copyright (c) 2015-2018 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 *******************************************************************************/

'use strict';
var minimist = require('minimist');
var url = require('url');
var proxy = require('proxy-middleware');


var serverOptions = {
  string: 'server',
  default: {server: process.env.SERVER_URL}
};

var options = minimist(process.argv.slice(2), serverOptions);

var patterns = ['/api', '/ext', '/ws', '/datasource', '/java-ca', '/im', '/che', '/admin', '/workspace-loader', '/ide'];

var proxies = [];

patterns.forEach(function(pattern) {
  var proxyOptions = url.parse(options.server + pattern);
  if (pattern === '/im') {
    proxyOptions.route = '/im';
  } else if (pattern === '/che') {
    proxyOptions.route = '/che';
  } else if (pattern === '/admin') {
    proxyOptions.route = '/admin';
  } else if (pattern === '/ext') {
    proxyOptions.route = '/ext';
  } else if (pattern === '/workspace-loader') {
    proxyOptions.route = '/workspace-loader';
  } else if (pattern === '/ide') {
    proxyOptions.route = '/ide';
  } else {
    proxyOptions.route = '/api';
    proxyOptions.ws = true;
    proxyOptions.pathRewrite = {
      '/api/websocket$': `/api/websocket?token=${process.env.AUTH_TOKEN}`
    };
  }
  proxyOptions.preserveHost = false;
  proxyOptions.rejectUnauthorized = false;
  proxyOptions.secure = false;
  proxyOptions.headers = {
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`
  };
  proxies.push(proxy(proxyOptions));

});

console.log('Using remote Che server', options.server);

/*
 * Enable proxy
 */

module.exports = proxies;
