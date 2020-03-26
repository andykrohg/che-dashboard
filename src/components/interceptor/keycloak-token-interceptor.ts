/*
 * Copyright (c) 2015-2018 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
'use strict';

import {HttpInterceptorBase} from './interceptor-base';

const GITHUB_API = 'api.github.com';

const AUTHORIZATION = 'Authorization';

/**
 * @author Oleksii Kurinnyi
 */
export class KeycloakTokenInterceptor extends HttpInterceptorBase {
  static $inject = ['$log', '$q', 'keycloakAuth'];

  $log: ng.ILogService;
  $q: ng.IQService;
  keycloak: any;
  keycloakConfig: any;

  /**
   * Default constructor that is using resource
   */
  constructor($log: ng.ILogService,
              $q: ng.IQService,
              keycloakAuth: any) {
    super();

    this.$log = $log;
    this.$q = $q;
    this.keycloak = keycloakAuth.keycloak;
    this.keycloakConfig = keycloakAuth.config;
  }

  request(config: any): ng.IPromise<any> {
    if (this.keycloak && config.url.indexOf(this.keycloakConfig.url) > -1) {
      return config;
    }

    if (config.url.indexOf(GITHUB_API) > -1) {
      return config;
    }

    const headers = config.headers;
    if (headers && Object.keys(headers).indexOf(AUTHORIZATION) != -1) {
      if (headers[AUTHORIZATION] === undefined) {
        delete headers[AUTHORIZATION];
      }
      return config;
    }


    if (this.keycloak && this.keycloak.token) {
      let deferred = this.$q.defer();
      // this.keycloak.updateToken(5).success(() => {
      //   config.headers = config.headers || {};
      //   config.headers.Authorization = 'Bearer ' + this.keycloak.token;
      //   deferred.resolve(config);
      // }).error(() => {
      //   this.$log.log('token refresh failed :' + config.url);
      //   deferred.reject('Failed to refresh token');
      //   window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
      //   this.keycloak.login();
      // });

      this.keycloak.token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IkVEemlwQkdQUnQzbW9wRVdac2YtajJ6NThHYXQteWtoeWJ5QTRnT2hMSDAifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJjcnciLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoid29ya3Nob3AtdXNlci10b2tlbi1iNTUycSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJ3b3Jrc2hvcC11c2VyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiMDRlMWRmYzAtNDhiYS00M2NkLTg4NzYtMjA0MzEyZWZmMWE3Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmNydzp3b3Jrc2hvcC11c2VyIn0.f9uonPzfHBC3XZ8cSpaBq0yuoD8m4IZFOS7ullN764D9OMG-Pv7EROJ6AiBycI2E2q28a9LCGpDLFFqv7C8GF5N9eZGtNkpHYf3223O_RIA_2hCFHp1_xnBFSk0SHQ__8vFvkoVgRuvxUrTOtPdUHq1RDLE-oVxzaNZtgmyPyh6pqqsy9sh_CnpLDa1irbBD1IHVvLVzNY2YDjp6XIHSn9am2qf4YxEoTnbVunGMtgUP5_j_bhSrcerJMevnm6kfBKgH0kyudpWW9sLphMVcdiHubxhRRDy3MPfcDgWKZEVx58bt-NfdxL2FVRLlyD6TORtYxYaN9eVPUjZYk0dy9g";
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + this.keycloak.token;
      deferred.resolve(config);
      return deferred.promise;
    }
    return config || this.$q.when(config);
  }

  response(response: any): ng.IPromise<any> {
    return response || this.$q.when(response);
  }

  responseError(rejection: any): ng.IPromise<any> {
    return this.$q.reject(rejection);
  }

  requestError(rejection: any): ng.IPromise<any> {
    return this.$q.reject(rejection);
  }

}
