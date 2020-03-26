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


export type keycloakUserInfo = {
  email: string;
  family_name: string;
  given_name: string;
  name: string;
  preferred_username: string;
  sub: string;
};

/**
 * This class is handling interactions with Keycloak.
 * @author Oleksii Kurinnyi
 */
export class CheKeycloak {

  static $inject = ['$q', 'keycloakAuth'];

  $q: ng.IQService;
  keycloak: any;
  keycloakConfig: any;

  /**
   * Default constructor that is using resource injection
   */
  constructor($q: ng.IQService, keycloakAuth: any) {
    this.$q = $q;
    this.keycloak = keycloakAuth.keycloak;
    this.keycloakConfig = keycloakAuth.config;
  }

  fetchUserInfo(): ng.IPromise<keycloakUserInfo> {
    const defer = this.$q.defer<keycloakUserInfo>();

    if (this.keycloak === null) {
      defer.reject('Keycloak is not found on the page.');
      return defer.promise;
    }

    this.keycloak.loadUserInfo().success((userInfo: keycloakUserInfo) => {
      defer.resolve(userInfo);
    }).error((error: any) => {
      defer.reject(`User info fetching failed, error: ${error}`);
    });

    return defer.promise;
  }

  updateToken(validityTime: number): ng.IPromise<boolean> {
    const deferred = this.$q.defer<boolean>();

    // this.keycloak.updateToken(validityTime).success((refreshed: boolean) => {
    //   deferred.resolve(refreshed);
    // }).error((error: any) => {
    //   deferred.reject(error);
    // });

    this.keycloak.token = "eyJhbGciOiJSUzI1NiIsImtpZCI6IkVEemlwQkdQUnQzbW9wRVdac2YtajJ6NThHYXQteWtoeWJ5QTRnT2hMSDAifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJjcnciLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlY3JldC5uYW1lIjoid29ya3Nob3AtdXNlci10b2tlbi1iNTUycSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJ3b3Jrc2hvcC11c2VyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiMDRlMWRmYzAtNDhiYS00M2NkLTg4NzYtMjA0MzEyZWZmMWE3Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmNydzp3b3Jrc2hvcC11c2VyIn0.f9uonPzfHBC3XZ8cSpaBq0yuoD8m4IZFOS7ullN764D9OMG-Pv7EROJ6AiBycI2E2q28a9LCGpDLFFqv7C8GF5N9eZGtNkpHYf3223O_RIA_2hCFHp1_xnBFSk0SHQ__8vFvkoVgRuvxUrTOtPdUHq1RDLE-oVxzaNZtgmyPyh6pqqsy9sh_CnpLDa1irbBD1IHVvLVzNY2YDjp6XIHSn9am2qf4YxEoTnbVunGMtgUP5_j_bhSrcerJMevnm6kfBKgH0kyudpWW9sLphMVcdiHubxhRRDy3MPfcDgWKZEVx58bt-NfdxL2FVRLlyD6TORtYxYaN9eVPUjZYk0dy9g";

    return deferred.promise;
  }

  isPresent(): boolean {
    return this.keycloak !== null;
  }

  getProfileUrl(): string {
    return this.keycloak.createAccountUrl();
  }

  logout(): void {
    window.sessionStorage.removeItem('githubToken');
    window.sessionStorage.setItem('oidcDashboardRedirectUrl', location.href);
    this.keycloak.logout({});
  }

}
