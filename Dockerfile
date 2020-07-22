FROM registry.redhat.io/ubi7/nodejs-8

ENV PATH=$PATH:/opt/rh/rh-nodejs8/root/usr/bin/
ENV DASHBOARD_URL=http://che-dashboard-crw.apps.cluster-homeroom-c378.homeroom-c378.example.opentlc.com

RUN npm install gulp@3.9.1
COPY . /opt/app-root/src/
USER root
RUN gulp build
USER default

ENTRYPOINT ["gulp", "serve:dist"]
EXPOSE 3000