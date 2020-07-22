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
import {CheJsonRpcMasterApi} from '../json-rpc/che-json-rpc-master-api';
import {CheJsonRpcApi} from '../json-rpc/che-json-rpc-api.factory';

interface IRemoteWorkspaceResource<T> extends ng.resource.IResourceClass<T> {
  create: any;
  startWorkspace: any;
  getMachineToken: any;
  getDetails: any;
}

/**
 * This class is handling the call to remote API
 * @author Florent Benoit
 */
export class CheRemoteWorkspace {
  private $resource: ng.resource.IResourceService;
  private $q: ng.IQService;
  private remoteWorkspaceAPI: IRemoteWorkspaceResource<any>;
  private cheJsonRpcMasterApi: CheJsonRpcMasterApi;
  private authData: any;
  private cheJsonRpcApi: CheJsonRpcApi;

  /**
   * Default constructor that is using resource
   */
  constructor($resource: ng.resource.IResourceService, $q: ng.IQService, cheJsonRpcApi: CheJsonRpcApi, authData: any) {
    this.$resource = $resource;
    this.$q = $q;
    this.cheJsonRpcApi = cheJsonRpcApi;
    this.authData = authData;

    // remote call
    this.remoteWorkspaceAPI = <IRemoteWorkspaceResource<any>>this.$resource('', {}, {
        getDetails: {method: 'GET', url: authData.url + '/api/workspace/:workspaceId?token=' + authData.token},
        getMachineToken: {method: 'GET', url: 'http://local.apps.cluster-homeroom-c378.homeroom-c378.example.opentlc.com/api/machine/token/:workspaceId?token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJlbkItQzctTjZ6S2dhUFNiMGg5VHVWUm01RktMMDhhUWZ1d0ZTWEdkUkpzIn0.eyJqdGkiOiJhMGQ4NWJkOS0xODRlLTRlODQtYmRmYy01MmI3YmZlNzEwOWYiLCJleHAiOjE1ODgyOTQxMzEsIm5iZiI6MCwiaWF0IjoxNTg1NzAyMTMxLCJpc3MiOiJodHRwOi8va2V5Y2xvYWstY3J3LmFwcHMuY2x1c3Rlci1ob21lcm9vbS1jMzc4LmhvbWVyb29tLWMzNzguZXhhbXBsZS5vcGVudGxjLmNvbS9hdXRoL3JlYWxtcy9jb2RlcmVhZHkiLCJhdWQiOlsiYnJva2VyIiwiYWNjb3VudCJdLCJzdWIiOiI0NGI5ZGRmMS0yNTBmLTRhNDgtYjY3MS1kMmFiNTRhYjliNTYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjb2RlcmVhZHktcHVibGljIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiNDAwNmE2NjEtOWZjYi00YzFjLTllOTQtZDRkZGE5Zjc3MWNmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vY29kZXJlYWR5LWNydy5hcHBzLmNsdXN0ZXItaG9tZXJvb20tYzM3OC5ob21lcm9vbS1jMzc4LmV4YW1wbGUub3BlbnRsYy5jb20iLCJodHRwczovL2NvZGVyZWFkeS1jcncuYXBwcy5jbHVzdGVyLWhvbWVyb29tLWMzNzguaG9tZXJvb20tYzM3OC5leGFtcGxlLm9wZW50bGMuY29tIiwiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImJyb2tlciI6eyJyb2xlcyI6WyJyZWFkLXRva2VuIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJBbmR5IEtyb2hnIiwicHJlZmVycmVkX3VzZXJuYW1lIjoib3BlbnRsYy1tZ3IiLCJnaXZlbl9uYW1lIjoiQW5keSIsImZhbWlseV9uYW1lIjoiS3JvaGciLCJlbWFpbCI6ImFrcm9oZ0ByZWRoYXQuY29tIn0.VfqmoKjzwx_TSJYINb9JjnFKRU8aVkdvWkD6iOsAj8QG01JJCTQT8Fvzyd49lwQilIBhWiUPO2WiA0ACFpTHaajIJtaGjYjSeb8pvHJ1phYZBx673ePkG5N6tBRx4EJrWiUzjXw7dac9lXTK3RvY2FnG0lRYuybkDZXdNJGxI86tnWFn5N5sRm0h9rgw4q-eWmy5mPbvcjyI-Rd9XsGmX58n_p6C0EINrJ5qz1BzsRRdwAza2dFrKIGJlqeChSfAfALh8nijE-q_WJdj0rLpT-N9uMQoeJXWEgHRfjVI0XDKyrA5LD_yxvXj7Jaoa4I9jX1r9Rkj6RXJ4LR3kToBSw'},
        create: {method: 'POST', url: authData.url + '/api/workspace?token=' + authData.token},
        startWorkspace: {method: 'POST', url : authData.url + '/api/workspace/:workspaceId/runtime?environment=:envName&token=' + authData.token}
      }
    );
  }

  createWorkspaceFromConfig(workspaceConfig: any): ng.IPromise<any> {
    return this.remoteWorkspaceAPI.create(workspaceConfig).$promise;
  }

  /**
   * Provides machine token for given workspace
   * @param workspaceId the ID of the workspace
   * @returns {*}
   */
  getMachineToken(workspaceId: string): ng.IPromise<any> {
    alert(`getting token for workspace ${workspaceId} using url ${this.authData.url} and token ${this.authData.token}`);
    let deferred = this.$q.defer();
    let deferredPromise = deferred.promise;

    let promise = this.remoteWorkspaceAPI.getMachineToken({workspaceId: workspaceId}, {}).$promise;
    promise.then((workspace: any) => {
      deferred.resolve(workspace);
    }, (error: any) => {
      deferred.reject(error);
    });

    return deferredPromise;
  }

  /**
   * Starts the given workspace by specifying the ID and the environment name
   * @param workspaceId the workspace ID
   * @param envName the name of the environment
   * @returns {*} promise
   */
  startWorkspace(remoteWsURL: string, workspaceId: string, envName: string): ng.IPromise<any> {
    alert("BAM!!!!");
    let deferred = this.$q.defer();
    let deferredPromise = deferred.promise;
    this.cheJsonRpcMasterApi = this.cheJsonRpcApi.getJsonRpcMasterApi(remoteWsURL);
    this.cheJsonRpcMasterApi.subscribeWorkspaceStatus(workspaceId, (message: any) => {
      if (message.status === 'RUNNING' && message.workspaceId === workspaceId) {
        let promise = this.remoteWorkspaceAPI.getDetails({workspaceId: workspaceId}, {}).$promise;
        promise.then((workspace: any) => {
          deferred.resolve(workspace);
        }, (error: any) => {
          deferred.reject(error);
        });
      }
    });

    this.remoteWorkspaceAPI.startWorkspace({workspaceId: workspaceId, envName : envName}, {}).$promise;

    return deferredPromise;
  }
}
